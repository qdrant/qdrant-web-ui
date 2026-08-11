import { describe, it, expect } from 'vitest';
import {
  parsePrometheus,
  buildSeriesKey,
  listSeries,
  indexByKey,
  indexTypesByName,
  isCounter,
  toRatePerSecond,
  detectUnit,
  formatValue,
  seriesLabel,
} from '../metrics-parser';

const SAMPLE = `# HELP app_info information about qdrant server
# TYPE app_info gauge
app_info{name="qdrant",version="1.15.1"} 1
# HELP collections_total number of collections
# TYPE collections_total gauge
collections_total 3
# HELP memory_active_bytes ...
# TYPE memory_active_bytes gauge
memory_active_bytes 1048576
# HELP rest_responses_total total number of responses
# TYPE rest_responses_total counter
rest_responses_total{method="GET",endpoint="/collections",status="200"} 42
rest_responses_total{endpoint="/collections",method="POST",status="200"} 7
`;

describe('parsePrometheus', () => {
  it('parses help, type and samples', () => {
    const metrics = parsePrometheus(SAMPLE);
    expect(metrics.collections_total.help).toBe('number of collections');
    expect(metrics.collections_total.type).toBe('gauge');
    expect(metrics.collections_total.samples[0].value).toBe(3);
  });

  it('parses labels for a labelled sample', () => {
    const metrics = parsePrometheus(SAMPLE);
    const sample = metrics.app_info.samples[0];
    expect(sample.labels).toEqual({ name: 'qdrant', version: '1.15.1' });
    expect(sample.value).toBe(1);
  });

  it('keeps multiple samples of the same metric distinct by key', () => {
    const metrics = parsePrometheus(SAMPLE);
    expect(metrics.rest_responses_total.samples).toHaveLength(2);
    const keys = metrics.rest_responses_total.samples.map((s) => s.key);
    expect(new Set(keys).size).toBe(2);
  });

  it('handles empty and non-string input', () => {
    expect(parsePrometheus('')).toEqual({});
    expect(parsePrometheus(null)).toEqual({});
    expect(parsePrometheus(undefined)).toEqual({});
  });

  it('parses the Prometheus special values', () => {
    const metrics = parsePrometheus('# TYPE x gauge\nx +Inf\ny -Inf\nz NaN\n');
    expect(metrics.x.samples[0].value).toBe(Infinity);
    expect(metrics.y.samples[0].value).toBe(-Infinity);
    expect(Number.isNaN(metrics.z.samples[0].value)).toBe(true);
  });
});

describe('buildSeriesKey', () => {
  it('returns the bare name when there are no labels', () => {
    expect(buildSeriesKey('collections_total', {})).toBe('collections_total');
  });

  it('is order-independent (labels sorted canonically)', () => {
    const a = buildSeriesKey('m', { b: '2', a: '1' });
    const b = buildSeriesKey('m', { a: '1', b: '2' });
    expect(a).toBe(b);
    expect(a).toBe('m{a="1",b="2"}');
  });
});

describe('listSeries / indexByKey', () => {
  it('flattens every sample into a selectable series', () => {
    const series = listSeries(parsePrometheus(SAMPLE));
    // app_info, collections_total, memory_active_bytes + 2 rest_responses_total
    expect(series).toHaveLength(5);
    expect(series.every((s) => 'key' in s && 'unit' in s)).toBe(true);
  });

  it('indexes latest value by series key', () => {
    const index = indexByKey(parsePrometheus(SAMPLE));
    expect(index.collections_total).toBe(3);
    expect(index.memory_active_bytes).toBe(1048576);
  });
});

describe('indexTypesByName / isCounter', () => {
  it('maps metric name to its declared Prometheus type', () => {
    const types = indexTypesByName(parsePrometheus(SAMPLE));
    expect(types.collections_total).toBe('gauge');
    expect(types.rest_responses_total).toBe('counter');
  });

  it('isCounter only accepts the counter type', () => {
    expect(isCounter('counter')).toBe(true);
    expect(isCounter('gauge')).toBe(false);
    expect(isCounter('')).toBe(false);
    expect(isCounter(undefined)).toBe(false);
  });
});

describe('toRatePerSecond', () => {
  it('derives a per-second rate from cumulative counter points', () => {
    const rate = toRatePerSecond([
      { t: 0, v: 100 },
      { t: 1000, v: 110 }, // +10 over 1s
      { t: 3000, v: 130 }, // +20 over 2s
    ]);
    expect(rate).toEqual([null, 10, 10]);
  });

  it('treats a decrease as a counter reset (gap, not a negative spike)', () => {
    const rate = toRatePerSecond([
      { t: 0, v: 500 },
      { t: 1000, v: 20 }, // reset
      { t: 2000, v: 45 }, // +25 over 1s
    ]);
    expect(rate).toEqual([null, null, 25]);
  });

  it('produces gaps around missing points and zero/negative intervals', () => {
    const rate = toRatePerSecond([
      { t: 0, v: 10 },
      { t: 1000, v: null },
      { t: 2000, v: 30 },
    ]);
    expect(rate).toEqual([null, null, null]);
  });
});

describe('detectUnit', () => {
  it('detects bytes, seconds and plain numbers', () => {
    expect(detectUnit('memory_active_bytes')).toBe('bytes');
    expect(detectUnit('rest_responses_avg_duration_seconds')).toBe('seconds');
    expect(detectUnit('collections_total')).toBe('number');
  });
});

describe('formatValue', () => {
  it('formats by unit', () => {
    expect(formatValue(1048576, 'bytes')).toBe('1.05 MB');
    expect(formatValue(0.5, 'seconds')).toBe('500.0ms');
    expect(formatValue(1234, 'number')).toBe('1,234');
  });

  it('handles missing and non-finite values', () => {
    expect(formatValue(null, 'number')).toBe('—');
    expect(formatValue(undefined, 'bytes')).toBe('—');
    expect(formatValue(Infinity, 'number')).toBe('∞');
  });
});

describe('seriesLabel', () => {
  it('uses the bare name when unlabelled', () => {
    expect(seriesLabel({ name: 'collections_total', labels: {} })).toBe('collections_total');
  });

  it('appends label values for labelled series', () => {
    expect(
      seriesLabel({ name: 'rest_responses_total', labels: { method: 'GET', endpoint: '/x', status: '200' } })
    ).toBe('rest_responses_total · GET /x 200');
  });
});
