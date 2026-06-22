/**
 * Merge determinista de contenido enriquecido sobre los 8 archivos de políticos.
 * Aplica bio (expandida) y additionalSources (→ compassEvidenced.sources, dedup),
 * preservando posiciones, dimensionScores, confidence, justificaciones, periods,
 * asignaciones ideológicas e incoherencias.
 *
 * Uso: node scripts/enrich/merge-politicians.cjs [--write]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'packages', 'data', 'colombia');
const OUT_DIR = path.join(__dirname, 'out', 'politicians');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(__dirname, 'politician-manifest.json'), 'utf8'));
const WRITE = process.argv.includes('--write');
const TODAY = '2026-06-22';

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const isStr = (v) => typeof v === 'string';
const isUrl = (v) => { if (!isStr(v)) return false; try { const u = new URL(v); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; } };
function cleanString(v, min, max) { if (!isStr(v)) return undefined; const s = v.trim(); return s.length >= min && s.length <= max ? s : undefined; }
function cleanSource(s) {
  if (!s || !isUrl(s.url)) return null;
  const outlet = cleanString(s.outlet, 2, 200);
  const date = isStr(s.date) && ISO.test(s.date.trim()) ? s.date.trim() : undefined;
  if (!outlet || !date) return null;
  const out = { url: s.url.trim(), outlet, date };
  const title = cleanString(s.title, 3, 300);
  if (title) out.title = title;
  if (isUrl(s.archived)) out.archived = s.archived.trim();
  return out;
}
function mergeSources(existing, incoming) {
  const seen = new Set(); const result = [];
  for (const s of [...(existing || []), ...incoming]) {
    if (!s || !isUrl(s.url) || seen.has(s.url)) continue;
    seen.add(s.url); result.push(s);
  }
  return result;
}

// Agrupar ids por archivo
const byFile = {};
for (const [id, file] of Object.entries(MANIFEST)) (byFile[file] = byFile[file] || []).push(id);

const report = { merged: 0, missing: [], invalidFile: [], warnings: [] };

for (const [file, ids] of Object.entries(byFile)) {
  const fp = path.join(DATA_DIR, file + '.json');
  const arr = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const byId = new Map(arr.map((e) => [e.id, e]));
  let touched = false;

  for (const id of ids) {
    const f = path.join(OUT_DIR, id + '.json');
    if (!fs.existsSync(f)) { report.missing.push(id); continue; }
    let enr;
    try { enr = JSON.parse(fs.readFileSync(f, 'utf8')); }
    catch (e) { report.invalidFile.push(`${id}: ${e.message}`); continue; }
    const t = byId.get(id);
    if (!t) { report.warnings.push(`${id}: no encontrado en ${file}`); continue; }

    const bio = cleanString(enr.bio, 50, 5000);
    if (bio) t.bio = bio;
    else if (enr.bio) report.warnings.push(`${id}.bio fuera de rango (${(enr.bio || '').length}) → omitida`);

    const incoming = (enr.additionalSources || []).map(cleanSource).filter(Boolean);
    if (incoming.length && t.compassEvidenced) {
      t.compassEvidenced.sources = mergeSources(t.compassEvidenced.sources, incoming).slice(0, 12);
    }

    t.lastUpdated = TODAY;
    touched = true;
    report.merged++;
  }

  if (touched && WRITE) fs.writeFileSync(fp, JSON.stringify(arr, null, 2) + '\n', 'utf8');
}

console.log('── Merge políticos ──');
console.log('Mezclados:', report.merged, '/', Object.keys(MANIFEST).length);
console.log('Sin archivo:', report.missing.length, report.missing.length ? '→ ' + report.missing.join(', ') : '');
console.log('Archivos inválidos:', report.invalidFile.length);
report.invalidFile.forEach((s) => console.log('   ✗', s));
console.log('Avisos:', report.warnings.length);
report.warnings.slice(0, 30).forEach((s) => console.log('   !', s));

if (WRITE) console.log('\n✓ archivos de políticos reescritos.');
else console.log('\n(dry-run — usa --write para aplicar)');
