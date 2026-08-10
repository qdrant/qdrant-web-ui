/* eslint-disable no-console */
// Ensures public/mockServiceWorker.js exists. Invoked by scripts/dev-msw.js
// before it starts Vite (`npm run dev:msw`)
//
// public/mockServiceWorker.js is a generated, git-ignored artifact that MSW
// needs to intercept requests in the browser. This regenerates it when absent
// (e.g. a fresh clone or a deleted file) and, if it can't, prints what to run.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const workerPath = path.join('public', 'mockServiceWorker.js');

if (fs.existsSync(workerPath)) {
  process.exit(0);
}

// `msw init` pulls in @inquirer, which imports util.styleText — a function
// added in Node 20.12.0 (and 21.7.0). On older Node it throws an opaque
// "does not provide an export named 'styleText'" SyntaxError on import. Detect
// that here and explain, instead of letting the CLI crash. We probe for the API
// directly because it was backported unevenly across the 20.x / 21.x lines.
if (typeof require('node:util').styleText !== 'function') {
  console.error(
    `\n[dev:msw] Node ${process.versions.node} is too old to generate the MSW service worker.\n` +
      '          `msw init` needs util.styleText, added in Node 20.12.0\n'
  );
  process.exit(1);
}

console.log(`\n[dev:msw] ${workerPath} is missing — generating the MSW service worker...\n`);

try {
  // --no-save: the worker directory is already recorded in package.json, so
  // skip msw's interactive "save worker directory?" prompt (which would hang
  // or crash in this non-interactive script).
  execSync('npx msw init public --no-save', { stdio: 'inherit' });
  console.log('\n[dev:msw] Service worker ready. Starting the dev server...\n');
} catch (error) {
  console.error(
    '\n[dev:msw] Could not generate the MSW service worker automatically.\n' +
      '          Generate it once with the command below, then re-run `npm run dev:msw`:\n\n' +
      '              npx msw init public/\n'
  );
  process.exit(1);
}
