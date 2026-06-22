/**
 * Merge determinista de contenido enriquecido sobre colombia/parties.json.
 * Aplica description, compassPosition.justification/sources y sources[]
 * preservando id/country/name/fullName/color/ideologies/compassPosition.{x,y,confidence}/
 * foundedYear/websiteUrl/incoherences.
 *
 * Uso: node scripts/enrich/merge-parties.cjs [--write]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA = path.join(ROOT, 'packages', 'data', 'colombia', 'parties.json');
const OUT_DIR = path.join(__dirname, 'out', 'parties');
const WRITE = process.argv.includes('--write');
const TODAY = '2026-06-22';

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const isStr = (v) => typeof v === 'string';
const isUrl = (v) => { if (!isStr(v)) return false; try { const u = new URL(v); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; } };

function cleanString(v, min, max) {
  if (!isStr(v)) return undefined;
  const s = v.trim();
  return s.length >= min && s.length <= max ? s : undefined;
}
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
  const seen = new Set();
  const result = [];
  for (const s of [...(existing || []), ...(incoming || [])]) {
    const c = s && s.url ? (s.outlet && s.date ? cleanSource(s) : null) : null;
    const v = c || (isUrl(s?.url) ? s : null);
    if (!v || seen.has(v.url)) continue;
    seen.add(v.url);
    result.push(v);
  }
  return result;
}

const parties = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const byId = new Map(parties.map((p) => [p.id, p]));
const report = { merged: 0, missing: [], invalidFile: [], warnings: [] };

for (const p of parties) {
  const f = path.join(OUT_DIR, p.id + '.json');
  if (!fs.existsSync(f)) { report.missing.push(p.id); continue; }
  let enr;
  try { enr = JSON.parse(fs.readFileSync(f, 'utf8')); }
  catch (e) { report.invalidFile.push(`${p.id}: ${e.message}`); continue; }
  const t = byId.get(p.id);

  const description = cleanString(enr.description, 20, 3000);
  if (description) t.description = description;
  else if (enr.description) report.warnings.push(`${p.id}.description fuera de rango → omitida`);

  if (t.compassPosition) {
    const just = cleanString(enr.compassJustification, 20, 5000);
    if (just) t.compassPosition.justification = just;
    const cs = (enr.compassSources || []).map(cleanSource).filter(Boolean);
    if (cs.length) t.compassPosition.sources = mergeSources(t.compassPosition.sources, cs);
  }

  const incoming = (enr.sources || []).map(cleanSource).filter(Boolean);
  if (incoming.length) t.sources = mergeSources(t.sources, incoming).slice(0, 12);

  t.lastUpdated = TODAY;
  report.merged++;
}

console.log('── Merge partidos ──');
console.log('Mezclados:', report.merged, '/', parties.length);
console.log('Sin archivo:', report.missing.length, report.missing.length ? '→ ' + report.missing.join(', ') : '');
console.log('Archivos inválidos:', report.invalidFile.length);
report.invalidFile.forEach((s) => console.log('   ✗', s));
console.log('Avisos:', report.warnings.length);
report.warnings.slice(0, 30).forEach((s) => console.log('   !', s));

if (WRITE) { fs.writeFileSync(DATA, JSON.stringify(parties, null, 2) + '\n', 'utf8'); console.log('\n✓ parties.json reescrito.'); }
else console.log('\n(dry-run — usa --write para aplicar)');
