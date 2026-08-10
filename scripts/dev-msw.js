/* eslint-disable no-console */
// Launches Vite with MSW enabled. An optional positional argument selects a
// mock scenario (see src/mocks/scenarios.js):
//
//   npm run dev:msw            -> default scenario (single-node)
//   npm run dev:msw -- cluster -> "cluster" scenario
//
// Any extra flags are forwarded to Vite, e.g. `npm run dev:msw -- cluster --host`.
const { spawn } = require('child_process');

const args = process.argv.slice(2);
const scenario = args.find((arg) => !arg.startsWith('-'));
const viteArgs = args.filter((arg) => arg !== scenario);

const env = { ...process.env, VITE_DEV_WITH_MSW: 'true' };
if (scenario) {
  env.VITE_MSW_SCENARIO = scenario;
}

const child = spawn('vite', viteArgs, { stdio: 'inherit', shell: true, env });
child.on('exit', (code) => process.exit(code ?? 0));
