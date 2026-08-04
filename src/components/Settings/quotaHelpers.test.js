import { describe, it, expect } from 'vitest';
import { DEFAULT_LIMIT_PERCENT, configToForm, formToConfig, summarizeUsage, usageStatus } from './quotaHelpers';

describe('configToForm / formToConfig', () => {
  it('treats null max as disabled and fills the default limit for editing', () => {
    expect(configToForm({ enabled: true, max_resident_memory_percent: null, max_disk_usage_percent: null })).toEqual({
      enabled: true,
      memoryEnabled: false,
      memory: DEFAULT_LIMIT_PERCENT,
      diskEnabled: false,
      disk: DEFAULT_LIMIT_PERCENT,
    });
  });

  it('round-trips enabled limits and clears disabled ones', () => {
    const form = {
      enabled: true,
      memoryEnabled: true,
      memory: 70,
      diskEnabled: false,
      disk: 55,
    };
    expect(formToConfig(form, 5)).toEqual({
      enabled: true,
      max_resident_memory_percent: 70,
      max_disk_usage_percent: null,
      release_margin_percent: 5,
    });
    expect(configToForm(formToConfig(form, 5))).toMatchObject({
      enabled: true,
      memoryEnabled: true,
      memory: 70,
      diskEnabled: false,
      disk: DEFAULT_LIMIT_PERCENT,
    });
  });
});

describe('summarizeUsage', () => {
  it('uses local usage on a single node', () => {
    expect(summarizeUsage({ usage: { resident_memory_percent: 42 } }, 'resident_memory_percent')).toEqual({
      percent: 42,
      peers: [],
      distributed: false,
    });
  });

  it('reports the peak across peers and ignores missing values for the peak', () => {
    const status = {
      peers: {
        aaa: { resident_memory_percent: 30 },
        bbb: { resident_memory_percent: 80 },
        ccc: {},
      },
    };
    const result = summarizeUsage(status, 'resident_memory_percent');
    expect(result.percent).toBe(80);
    expect(result.distributed).toBe(true);
    expect(result.peers).toEqual([
      { id: 'aaa', percent: 30 },
      { id: 'bbb', percent: 80 },
      { id: 'ccc', percent: null },
    ]);
  });

  it('sorts peers by id so the list is stable across refreshes', () => {
    const ids = ['9007199254740993123', '42', '9007199254740993122', '7'];
    const peers = Object.fromEntries(ids.map((id, i) => [id, { resident_memory_percent: i }]));
    expect(summarizeUsage({ peers }, 'resident_memory_percent').peers.map((p) => p.id)).toEqual([
      '7',
      '42',
      '9007199254740993122',
      '9007199254740993123',
    ]);
  });
});

describe('usageStatus', () => {
  it('classifies against the limit and release margin', () => {
    expect(usageStatus(50, 80, 5, true)).toBe('ok');
    expect(usageStatus(75, 80, 5, true)).toBe('warning');
    expect(usageStatus(80, 80, 5, true)).toBe('exceeded');
    expect(usageStatus(90, 80, 5, false)).toBe('neutral');
    expect(usageStatus(null, 80, 5, true)).toBe('neutral');
  });
});
