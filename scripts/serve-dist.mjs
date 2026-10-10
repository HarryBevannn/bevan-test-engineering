// Minimal static server for the built site (dist/), used by the Playwright tests.
// Behaves like Netlify for what the tests need: /path/ serves /path/index.html, unknown paths
// get dist/404.html with a 404 status.
//
// The tests start it in-process (tests/global-setup.ts) rather than as a separate server process,
// because Playwright can't reliably stop a child server process on Windows and the run hangs.
// It can also be run on its own: `node scripts/serve-dist.mjs`.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

export function startServer(port = 4321, dir = 'dist') {
  const root = path.resolve(dir);

  function resolveFile(urlPath) {
    const clean = path.normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    let file = path.join(root, clean);
    if (!file.startsWith(root)) return null;
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    return fs.existsSync(file) ? file : null;
  }

  const server = http.createServer((req, res) => {
    const file = resolveFile(req.url ?? '/');
    const target = file ?? path.join(root, '404.html');
    res.writeHead(file ? 200 : 404, { 'Content-Type': TYPES[path.extname(target)] ?? 'application/octet-stream' });
    fs.createReadStream(target).pipe(res);
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => resolve(server));
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 4321);
  await startServer(port);
  console.log(`Serving dist/ on http://localhost:${port}`);
}
