// Helpers for the Metrics dashboard: parse Qdrant's `/metrics` endpoint
// (Prometheus text exposition format) into structured series, and format the
// numeric values for display.
//
// The `/metrics` endpoint returns plain text, e.g.:
//
//   # HELP app_info information about qdrant server
//   # TYPE app_info gauge
//   app_info{name="qdrant",version="1.15.1"} 1
//   # HELP memory_active_bytes ...
//   # TYPE memory_active_bytes gauge
//   memory_active_bytes 1234567
//
// A single metric name can expose many samples that differ only by their
// labels (e.g. `rest_responses_total` per method/endpoint/status), so each
// sample is identified by a canonical "series key" that folds the labels in.

import prettyBytes from 'pretty-bytes';
import { formatGroupedDigits } from './common-helpers';

// Build a stable, canonical key for a sample: the metric name plus its labels
// sorted by name, so the same series always maps to the same string regardless
// of the label order the server happened to emit.
export const buildSeriesKey = (name, labels) => {
  const entries = Object.entries(labels || {});
  if (entries.length === 0) return name;
  const inner = entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}="${v}"`)
    .join(',');
  // console.log(`${name}{${inner}}`)
  return `${name}{${inner}}`;
};

// Parse a numeric value, tolerating the Prometheus specials.
const parseValue = (raw) => {
  switch (raw) {
    case '+Inf':
      return Infinity;
    case '-Inf':
      return -Infinity;
    case 'NaN':
      return NaN;
    default: {
      const n = Number(raw);
      return Number.isNaN(n) ? null : n;
    }
  }
};

// Parse the `{a="1",b="2"}` label block into an object. Handles escaped quotes
// and backslashes as defined by the exposition format.
const parseLabels = (block) => {
  const labels = {};
  if (!block) return labels;
  const inner = block.slice(1, -1); // strip { }
  const re = /([a-zA-Z_][a-zA-Z0-9_]*)="((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(inner)) !== null) {
    labels[m[1]] = m[2].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
  }
  return labels;
};

const SAMPLE_RE = /^([a-zA-Z_:][a-zA-Z0-9_:]*)(\{.*\})?\s+(.+)$/;

// Parse the Prometheus text into a map of metric name -> descriptor:
//   { name, help, type, samples: [{ name, labels, value, key }] }
export const parsePrometheus = (text) => {
  const metrics = {};
  if (!text || typeof text !== 'string') return metrics;

  const ensure = (name) => {
    if (!metrics[name]) metrics[name] = { name, help: '', type: '', samples: [] };
    return metrics[name];
  };

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line[0] === '#') {
      const meta = line.match(/^#\s+(HELP|TYPE)\s+([a-zA-Z_:][a-zA-Z0-9_:]*)\s+(.*)$/);
      if (meta) {
        const [, kind, name, rest] = meta;
        const metric = ensure(name);
        if (kind === 'HELP') metric.help = rest;
        else metric.type = rest.trim();
      }
      continue;
    }

    const m = line.match(SAMPLE_RE);
    if (!m) continue;
    const [, name, labelBlock, valuePart] = m;
    const value = parseValue(valuePart.trim().split(/\s+/)[0]);
    if (value === null) continue;
    const labels = parseLabels(labelBlock);
    ensure(name).samples.push({ name, labels, value, key: buildSeriesKey(name, labels) });
  }

  return metrics;
};

// Flatten a parsed metrics map into a flat list of selectable series, each one
// with the metadata the UI needs to render and label it.
export const listSeries = (metrics) => {
  const series = [];
  for (const metric of Object.values(metrics || {})) {
    for (const sample of metric.samples) {
      series.push({
        key: sample.key,
        name: sample.name,
        labels: sample.labels,
        help: metric.help,
        type: metric.type,
        unit: detectUnit(sample.name),
      });
    }
  }
  return series.sort((a, b) => a.key.localeCompare(b.key));
};

// Index a parsed metrics map as seriesKey -> latest value, for quickly pulling
// the current value of every subscribed series on each poll.
export const indexByKey = (metrics) => {
  const index = {};
  for (const metric of Object.values(metrics || {})) {
    for (const sample of metric.samples) {
      index[sample.key] = sample.value;
    }
  }
  return index;
};

// Index a parsed metrics map as metricName -> Prometheus type ('gauge',
// 'counter', …). The type is declared per metric name, so it applies to every
// labelled series of that metric.
export const indexTypesByName = (metrics) => {
  const types = {};
  for (const metric of Object.values(metrics || {})) {
    types[metric.name] = metric.type;
  }
  return types;
};

// Counters are cumulative, so the meaningful quantity to plot is their rate of
// change per second rather than the raw total. Gauges are plotted as-is.
export const isCounter = (type) => type === 'counter';

// Convert a series of { t (ms), v } points to a per-second rate, Grafana-style:
// each point is (v - vPrev) / (dtSeconds). The first point and any gap have no
// rate (null). A decrease is treated as a counter reset (process restart) and
// yields a gap rather than a large negative spike.
export const toRatePerSecond = (points) => {
  const out = new Array(points.length).fill(null);
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (prev == null || curr == null || prev.v == null || curr.v == null) continue;
    const dt = (curr.t - prev.t) / 1000;
    if (dt <= 0) continue;
    const delta = curr.v - prev.v;
    if (delta < 0) continue; // counter reset
    out[i] = delta / dt;
  }
  return out;
};

// Guess a display unit from the metric name. Qdrant follows the Prometheus
// convention of encoding the unit as the metric-name suffix.
export const detectUnit = (name) => {
  if (/_bytes$/.test(name)) return 'bytes';
  if (/_seconds$/.test(name)) return 'seconds';
  return 'number';
};

// Format a value for axis ticks and tooltips according to its unit.
export const formatValue = (value, unit) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  if (!Number.isFinite(value)) return value > 0 ? '∞' : '-∞';
  switch (unit) {
    case 'bytes':
      return prettyBytes(value);
    case 'seconds':
      return formatSeconds(value);
    case 'percent':
      return `${formatNumber(value)}%`;
    default:
      return formatNumber(value);
  }
};

const formatSeconds = (value) => {
  if (value === 0) return '0s';
  if (value < 1e-3) return `${(value * 1e6).toFixed(0)}µs`;
  if (value < 1) return `${(value * 1e3).toFixed(1)}ms`;
  return `${value.toFixed(2)}s`;
};

const formatNumber = (value) => {
  // Group digits with the app's locale-independent formatter; round
  // non-integers to 3 decimals to avoid long floats on the axis/tooltip.
  const rounded = Number.isInteger(value) ? value : Math.round(value * 1000) / 1000;
  return formatGroupedDigits(rounded);
};

// A short, human-friendly label for a series, used in chart legends and chips.
// Prefers the most descriptive label value (endpoint/method/name/version) so
// that many samples of the same metric stay distinguishable.
export const seriesLabel = ({ name, labels }) => {
  const values = Object.entries(labels || {});
  if (values.length === 0) return name;
  const preferredOrder = ['method', 'endpoint', 'name', 'version', 'id'];
  const rank = (label) => {
    const i = preferredOrder.indexOf(label);
    return i === -1 ? preferredOrder.length : i;
  };
  const parts = values.sort(([a], [b]) => rank(a) - rank(b)).map(([, v]) => v);
  return `${name} · ${parts.join(' ')}`;
};
