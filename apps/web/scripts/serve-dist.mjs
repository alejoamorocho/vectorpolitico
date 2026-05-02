// Server estático mínimo para servir dist/ localmente.
// Útil cuando WDAC bloquea workerd y queremos probar el build de producción
// sin depender de python ni de @astrojs/cloudflare en preview.
//
// Uso: node scripts/serve-dist.mjs

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, createReadStream } from 'node:fs';
import { join, extname } from 'node:path';

const PORT = Number(process.env.PORT) || 4321;
const HOST = process.env.HOST || '127.0.0.1';
const DIST = join(process.cwd(), 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.txt':  'text/plain; charset=utf-8',
};

if (!existsSync(DIST)) {
  console.error(`No existe ${DIST}. Corre primero: pnpm build`);
  process.exit(1);
}

createServer((req, res) => {
  let path = req.url.split('?')[0].replace(/\/$/, '');
  let filepath = join(DIST, path || '/');

  if (existsSync(filepath) && statSync(filepath).isDirectory()) {
    filepath = join(filepath, 'index.html');
  } else if (!existsSync(filepath) && existsSync(filepath + '.html')) {
    filepath = filepath + '.html';
  } else if (!existsSync(filepath) && existsSync(join(filepath, 'index.html'))) {
    filepath = join(filepath, 'index.html');
  }

  if (!existsSync(filepath)) {
    const fallback = join(DIST, '404.html');
    if (existsSync(fallback)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return createReadStream(fallback).pipe(res);
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not Found');
  }

  const ext = extname(filepath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  createReadStream(filepath).pipe(res);
}).listen(PORT, HOST, () => {
  console.log(`Servidor estático en http://${HOST}:${PORT}/  (dist/)`);
  console.log('Ctrl+C para detener.');
});
