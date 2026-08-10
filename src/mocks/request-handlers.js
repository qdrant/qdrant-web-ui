// Entry point imported by src/index.jsx. Resolves the active mock scenario and
// exports the composed MSW handler list.
//
// The scenario is chosen with `npm run dev:msw -- <scenario>`, which the dev
// launcher surfaces as the VITE_MSW_SCENARIO env var. Unknown names fall back
// to the default. Scenarios and instructions for adding variants live in
// ./scenarios.js.
//
// Don't use these mock for testing! They're a developer workflow aid.
import { scenarios, DEFAULT_SCENARIO } from './scenarios';

const requested = import.meta.env.VITE_MSW_SCENARIO || DEFAULT_SCENARIO;
const active = scenarios[requested] ? requested : DEFAULT_SCENARIO;

if (!scenarios[requested]) {
  console.warn(
    `[msw] Unknown scenario "${requested}". Available: ${Object.keys(scenarios).join(', ')}. ` +
      `Falling back to "${DEFAULT_SCENARIO}".`
  );
}
console.log(`[msw] Active mock scenario: "${active}"`);

export const requestHandlers = scenarios[active];
