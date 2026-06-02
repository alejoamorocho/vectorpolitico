// Postbuild para GitHub Pages: reescribe paths absolutos hardcodeados.
//
// Astro reescribe automáticamente los assets que él controla (CSS, JS,
// imports) usando el `base` config. Pero los `<a href="/foo">` hardcoded
// en código de usuario (BaseLayout, páginas, componentes) NO se
// reescriben — quedan apuntando a /foo en lugar de /vectorpolitico/foo,
// lo que rompe la navegación en GitHub Pages.
//
// Este script recorre todos los .html del dist/ y reescribe
// `href="/x"`, `src="/x"`, `action="/x"` (que NO empiecen ya con
// /vectorpolitico/ ni con //) a `/vectorpolitico/x`. Preserva URLs
// externas, anchors (#), y paths ya prefijados.
//
// Uso: pnpm build:gh-pages   (ya lo invoca al final)

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const BASE = '/vectorpolitico';

// Para HTML: atributos con path absoluto que NO empiezan ya con /vectorpolitico ni con //
const HTML_RE = /(href|src|action)="\/(?!\/|vectorpolitico\b)([^"]*)"/g;

// Para JS: literales string "/ideologias/", "/partidos/", "/figuras/" etc en bundles.
// Solo paths internos conocidos para evitar reescribir cosas como "/api/v1" si las hubiera.
const JS_PATHS = ['ideologias', 'partidos', 'figuras', 'metodologia', 'about', 'contribuir'];
const JS_RE = new RegExp(`(["'\`])/(${JS_PATHS.join('|')})/`, 'g');

function walk(dir, exts) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full, exts));
    else if (exts.includes(extname(entry))) out.push(full);
  }
  return out;
}

function transformFile(file, pattern, replacer) {
  const original = readFileSync(file, 'utf8');
  const updated = original.replace(pattern, replacer);
  if (updated !== original) {
    writeFileSync(file, updated, 'utf8');
    return true;
  }
  return false;
}

// 1. HTML files
const htmlFiles = walk(DIST, ['.html']);
let htmlTouched = 0;
for (const f of htmlFiles) {
  const ok = transformFile(f, HTML_RE, (m, attr, path) => {
    if (path.startsWith('#')) return m;
    return `${attr}="${BASE}/${path}"`;
  });
  if (ok) htmlTouched++;
}

// 2. JS bundles
const jsFiles = walk(DIST, ['.js', '.mjs']);
let jsTouched = 0;
for (const f of jsFiles) {
  const ok = transformFile(f, JS_RE, (_m, quote, path) => `${quote}${BASE}/${path}/`);
  if (ok) jsTouched++;
}

console.log(
  `[fix-gh-pages-base] HTML: ${htmlTouched}/${htmlFiles.length} mod, JS: ${jsTouched}/${jsFiles.length} mod.`,
);
