import fs from 'node:fs';
// @ts-expect-error: plain JavaScript module without type declarations
import { startServer } from '../scripts/serve-dist.mjs';

/**
 * Serves the built site for the duration of the test run, unless BASE_URL points at a deployed site.
 * Returning a function makes Playwright call it as the teardown once all tests have finished.
 */
export default async function globalSetup() {
  if (process.env.BASE_URL) return;

  if (!fs.existsSync('dist/index.html')) {
    throw new Error('No built site found in dist/. Run `npm run build` before running the tests.');
  }

  const server = await startServer(4321);
  return () => new Promise<void>((resolve) => server.close(() => resolve()));
}
