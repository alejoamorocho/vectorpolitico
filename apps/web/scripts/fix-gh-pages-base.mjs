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
import { join } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const BASE = '/vectorpolitico';

// (href|src|action)="/path"  donde path NO empieza por / (no protocol-relative)
// y NO empieza ya con 'vectorpolitico' (ya tiene base).
const ATTR_RE = /(href|src|action)="\/(?!\/|vectorpolitico\b)([^"]*)"/g;

function walkHtml(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walkHtml(full));
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
}

const files = walkHtml(DIST);
let touched = 0;
for (const file of files) {
  const original = readFileSync(file, 'utf8');
  const updated = original.replace(ATTR_RE, (m, attr, path) => {
    if (path.startsWith('#')) return m;
    return `${attr}="${BASE}/${path}"`;
  });
  if (updated !== original) {
    writeFileSync(file, updated, 'utf8');
    touched++;
  }
}
console.log(`[fix-gh-pages-base] Procesados ${files.length} HTML, modificados ${touched}.`);
