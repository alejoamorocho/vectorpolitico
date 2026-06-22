/**
 * Merge determinista de contenido enriquecido sobre ideologies.json.
 *
 * Lee scripts/enrich/out/ideologies/<id>.json (producidos por los agentes),
 * mezcla SOLO los campos de contenido permitidos sobre el original (preservando
 * id/name/nameEn/x/y/width/height/quadrant/color/description), valida cada campo
 * contra las restricciones del schema y reescribe ideologies.json.
 *
 * Uso: node scripts/enrich/merge-ideologies.cjs [--write]
 *   sin --write: dry-run (solo reporta).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA = path.join(ROOT, 'packages', 'data', 'ideologies.json');
const OUT_DIR = path.join(__dirname, 'out', 'ideologies');
const WRITE = process.argv.includes('--write');

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const isStr = (v) => typeof v === 'string';
const len = (v) => (isStr(v) ? v.trim().length : 0);
const isUrl = (v) => {
  if (!isStr(v)) return false;
  try { const u = new URL(v); return u.protocol === 'http:' || u.protocol === 'https:'; }
  catch { return false; }
};

const original = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const validSlugs = new Set(original.map((i) => i.id));
const byId = new Map(original.map((i) => [i.id, i]));

const report = { merged: 0, missing: [], invalidFile: [], fieldWarnings: [] };

function cleanString(v, min, max, id, field) {
  if (!isStr(v)) return undefined;
  const s = v.trim();
  if (s.length < min || s.length > max) {
    report.fieldWarnings.push(`${id}.${field}: longitud ${s.length} fuera de [${min},${max}] → omitido`);
    return undefined;
  }
  return s;
}

function cleanStringArray(v, min, max, id, field) {
  if (!Array.isArray(v)) return undefined;
  const arr = v.filter(isStr).map((s) => s.trim()).filter((s) => s.length >= min && s.length <= max);
  return arr.length ? arr : undefined;
}

for (const ide of original) {
  const f = path.join(OUT_DIR, ide.id + '.json');
  if (!fs.existsSync(f)) { report.missing.push(ide.id); continue; }
  let enr;
  try { enr = JSON.parse(fs.readFileSync(f, 'utf8')); }
  catch (e) { report.invalidFile.push(`${ide.id}: ${e.message}`); continue; }

  const target = byId.get(ide.id);

  const longDescription = cleanString(enr.longDescription, 50, 10000, ide.id, 'longDescription');
  if (longDescription) target.longDescription = longDescription;

  const historicalContext = cleanString(enr.historicalContext, 20, 5000, ide.id, 'historicalContext');
  if (historicalContext) target.historicalContext = historicalContext;

  const contemporaryRelevance = cleanString(enr.contemporaryRelevance, 20, 3000, ide.id, 'contemporaryRelevance');
  if (contemporaryRelevance) target.contemporaryRelevance = contemporaryRelevance;

  const commonCriticisms = cleanString(enr.commonCriticisms, 20, 3000, ide.id, 'commonCriticisms');
  if (commonCriticisms) target.commonCriticisms = commonCriticisms;

  const keyThinkers = cleanStringArray(enr.keyThinkers, 2, 120, ide.id, 'keyThinkers');
  if (keyThinkers) target.keyThinkers = keyThinkers;

  const historicalExamples = cleanStringArray(enr.historicalExamples, 2, 200, ide.id, 'historicalExamples');
  if (historicalExamples) target.historicalExamples = historicalExamples;

  if (Array.isArray(enr.relatedIdeologies)) {
    const rel = [...new Set(enr.relatedIdeologies.filter(isStr).map((s) => s.trim()))]
      .filter((s) => SLUG_RE.test(s) && validSlugs.has(s) && s !== ide.id);
    if (rel.length) target.relatedIdeologies = rel.slice(0, 6);
  }

  if (isUrl(enr.wikipediaUrl)) target.wikipediaUrl = enr.wikipediaUrl.trim();
  else if (enr.wikipediaUrl) report.fieldWarnings.push(`${ide.id}.wikipediaUrl: URL inválida → omitida`);

  if (Array.isArray(enr.externalLinks)) {
    const links = [];
    for (const l of enr.externalLinks) {
      if (!l || !isUrl(l.url)) continue;
      const title = cleanString(l.title, 2, 200, ide.id, 'externalLinks.title');
      if (!title) continue;
      const link = { title, url: l.url.trim() };
      const outlet = isStr(l.outlet) && len(l.outlet) >= 2 ? l.outlet.trim().slice(0, 200) : undefined;
      if (outlet) link.outlet = outlet;
      links.push(link);
    }
    if (links.length) target.externalLinks = links.slice(0, 6);
  }

  // nameEn opcional si el agente lo aporta y no existía
  if (!target.nameEn && isStr(enr.nameEn) && len(enr.nameEn) >= 2) target.nameEn = enr.nameEn.trim();

  report.merged++;
}

console.log('── Merge ideologías ──');
console.log('Mezcladas:', report.merged, '/', original.length);
console.log('Sin archivo de salida:', report.missing.length, report.missing.length ? '→ ' + report.missing.join(', ') : '');
console.log('Archivos inválidos:', report.invalidFile.length);
report.invalidFile.forEach((s) => console.log('   ✗', s));
console.log('Avisos de campo:', report.fieldWarnings.length);
report.fieldWarnings.slice(0, 40).forEach((s) => console.log('   !', s));

if (WRITE) {
  fs.writeFileSync(DATA, JSON.stringify(original, null, 2) + '\n', 'utf8');
  console.log('\n✓ ideologies.json reescrito.');
} else {
  console.log('\n(dry-run — usa --write para aplicar)');
}
