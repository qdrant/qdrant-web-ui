// Preset charts offered as one-click buttons on the Metrics dashboard.
//
// Presets reference label-free gauge metrics, whose series key is simply the
// metric name, so they resolve reliably regardless of the labels a particular
// deployment emits. Metrics that aren't present in the current response just
// render as an empty series until data arrives.
export const PRESETS = [
  {
    id: 'memory',
    label: 'Memory',
    charts: [
      {
        title: 'Memory usage',
        metrics: [
          'memory_resident_bytes',
          'memory_allocated_bytes',
          'memory_active_bytes',
          'memory_retained_bytes',
          'memory_metadata_bytes',
        ],
      },
    ],
  },
  {
    id: 'collections',
    label: 'Collections',
    charts: [
      {
        title: 'Collections & pending operations',
        metrics: ['collections_total', 'collections_vector_total', 'pending_operations'],
      },
    ],
  },
];
