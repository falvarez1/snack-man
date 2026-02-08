import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const port = 5173;
const root = process.cwd();

function build() {
  execSync('tsc -p tsconfig.app.json', { stdio: 'inherit' });
}

build();
fs.watch(path.join(root, 'src'), { recursive: true }, () => {
  try {
    build();
  } catch {
    // keep serving previous output when compile fails
  }
});

const server = http.createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url ?? '/index.html';
  const filePath = path.join(root, url.startsWith('/src/') ? `dist${url.slice(4)}` : url.slice(1));
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(root) || !fs.existsSync(resolved)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = path.extname(resolved);
  const map = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css' };
  res.setHeader('Content-Type', map[ext] ?? 'text/plain');
  res.end(fs.readFileSync(resolved));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Dev server at http://localhost:${port}`);
});
