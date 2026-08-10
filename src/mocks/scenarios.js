// Registry of mock scenarios. Pick one with `npm run dev:msw -- <name>`.
//
// To add a variant:
//   1. Create a file in ./handlers/ exporting an array of handlers that
//      override only the endpoints your variant changes (see cluster.js).
//   2. Register it below with `compose(<yourHandlers>, baseHandlers)`.
import { catchAll } from './lib';
import { baseHandlers } from './handlers/base';
import { clusterHandlers } from './handlers/cluster';
import { optimizationsHandlers } from './handlers/optimizations';
import { clusterBigHandlers } from './handlers/cluster-big';
import { clusterSmallHandlers } from './handlers/cluster-small';

export const DEFAULT_SCENARIO = 'single-node';

// A scenario is: variant overrides first, base handlers next, safety net last.
// MSW uses the first matching handler, so overrides shadow the base ones.
const compose = (...groups) => [...groups.flat(), catchAll];

export const scenarios = {
  'single-node': compose(baseHandlers),
  cluster: compose(clusterHandlers, baseHandlers),
  'cluster-small': compose(clusterSmallHandlers, baseHandlers),
  'cluster-big': compose(clusterBigHandlers, baseHandlers),
  optimizations: compose(optimizationsHandlers, baseHandlers),
};
