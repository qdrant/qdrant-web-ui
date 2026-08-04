// Default percentage shown when a quota is first switched on with no value set.
export const DEFAULT_LIMIT_PERCENT = 80;

// Map the GET /quotas config to the editable form. A `null` max means that
// resource is uncapped, i.e. its row switch is off.
export const configToForm = (config = {}) => ({
  enabled: Boolean(config.enabled),
  memoryEnabled: config.max_resident_memory_percent != null,
  memory: config.max_resident_memory_percent ?? DEFAULT_LIMIT_PERCENT,
  diskEnabled: config.max_disk_usage_percent != null,
  disk: config.max_disk_usage_percent ?? DEFAULT_LIMIT_PERCENT,
});

// Map the form back to a PUT /quotas body, preserving the release margin.
export const formToConfig = (form, releaseMargin) => ({
  enabled: form.enabled,
  max_resident_memory_percent: form.memoryEnabled ? form.memory : null,
  max_disk_usage_percent: form.diskEnabled ? form.disk : null,
  release_margin_percent: releaseMargin,
});

// Order peer ids deterministically so the list doesn't reshuffle on refresh.
// Peer ids are u64 and can exceed Number.MAX_SAFE_INTEGER, so compare digit
// strings by length first; anything non-numeric falls back to plain ordering.
export function comparePeerIds(a, b) {
  const left = String(a);
  const right = String(b);
  const numeric = /^\d+$/;
  if (numeric.test(left) && numeric.test(right)) {
    if (left.length !== right.length) return left.length - right.length;
    return left < right ? -1 : left > right ? 1 : 0;
  }
  return left < right ? -1 : left > right ? 1 : 0;
}

// Reduce the per-peer quota usage from GET /quotas into a headline number.
// The quota is enforced per peer, so the busiest peer is what matters; fall
// back to the serving peer's usage when the cluster is single-node.
export function summarizeUsage(status, key) {
  const entries = status && status.peers ? Object.entries(status.peers) : [];
  if (entries.length) {
    let peak = null;
    const peers = entries
      .map(([id, peer]) => {
        const percent = peer[key] ?? null;
        if (percent != null && (peak == null || percent > peak)) peak = percent;
        return { id, percent };
      })
      .sort((a, b) => comparePeerIds(a.id, b.id));
    return { percent: peak, peers, distributed: true };
  }
  return { percent: status?.usage?.[key] ?? null, peers: [], distributed: false };
}

// Classify current usage against the configured limit (minus the release
// margin) so the meter can colour itself. 'neutral' while the quota is off.
export function usageStatus(percent, limit, margin, enabled) {
  if (!enabled || limit == null || percent == null) return 'neutral';
  if (percent >= limit) return 'exceeded';
  if (percent >= limit - (margin ?? 0)) return 'warning';
  return 'ok';
}
