export const formatBytes = (bytes) => {
  if (!bytes || bytes < 1) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

const zeroUsage = () => ({
  disk_bytes: 0,
  ram_bytes: 0,
  cached_bytes: 0,
  expected_cache_bytes: 0,
});

const addUsage = (a, b) => ({
  disk_bytes: (a.disk_bytes || 0) + (b.disk_bytes || 0),
  ram_bytes: (a.ram_bytes || 0) + (b.ram_bytes || 0),
  cached_bytes: (a.cached_bytes || 0) + (b.cached_bytes || 0),
  expected_cache_bytes: (a.expected_cache_bytes || 0) + (b.expected_cache_bytes || 0),
});

const sumChildren = (items) => items.reduce((acc, c) => addUsage(acc, c.usage), zeroUsage());

export const memoryFootprint = (usage) => (usage?.ram_bytes || 0) + (usage?.cached_bytes || 0);
export const diskFootprint = (usage) => usage?.disk_bytes || 0;

export const sortTree = (node, sortKey) => {
  if (!node.children) return node;
  const sortedChildren = [...node.children]
    .map((c) => sortTree(c, sortKey))
    .sort((a, b) => sortKey(b.usage) - sortKey(a.usage));
  return { ...node, children: sortedChildren };
};

export const buildMemoryTree = (result) => {
  if (!result) return null;
  const groups = [];

  if (result.vectors?.length) {
    const children = result.vectors.map((v) => {
      const subs = [];
      if (v.storage) subs.push({ name: 'storage', usage: v.storage });
      if (v.index) subs.push({ name: 'index', usage: v.index });
      if (v.quantized) subs.push({ name: 'quantized', usage: v.quantized });
      return { name: v.name, usage: sumChildren(subs), children: subs };
    });
    groups.push({ name: 'Vectors', usage: sumChildren(children), children });
  }

  if (result.sparse_vectors?.length) {
    const children = result.sparse_vectors.map((v) => {
      const subs = [];
      if (v.storage) subs.push({ name: 'storage', usage: v.storage });
      if (v.index) subs.push({ name: 'index', usage: v.index });
      return { name: v.name, usage: sumChildren(subs), children: subs };
    });
    groups.push({ name: 'Sparse Vectors', usage: sumChildren(children), children });
  }

  if (result.payload) {
    groups.push({ name: 'Payload', usage: result.payload });
  }

  if (result.payload_index?.length) {
    const children = result.payload_index.map((f) => ({ name: f.name, usage: f.usage }));
    groups.push({ name: 'Payload Indexes', usage: sumChildren(children), children });
  }

  if (result.other && Object.keys(result.other).length > 0) {
    const children = Object.entries(result.other).map(([name, usage]) => ({ name, usage }));
    groups.push({ name: 'Other', usage: sumChildren(children), children });
  }

  return {
    name: 'Total',
    usage: result.total || sumChildren(groups),
    children: groups,
  };
};
