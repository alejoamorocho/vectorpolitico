/**
 * Reincorpora las incoherencias restauradas (out/restore/<id>.json) a las
 * entidades, validando cada una contra las restricciones del schema y evitando
 * duplicados por id. Las que no validen se reportan y NO se agregan.
 *
 * Uso: node scripts/enrich/merge-restore-incoherences.cjs [--write]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'packages', 'data', 'colombia');
const OUT_DIR = path.join(__dirname, 'out', 'restore');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(__dirname, 'incoherence-manifest.json'), 'utf8'));
const WRITE = process.argv.includes('--write');

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const CATS = ['economia', 'seguridad', 'derechos_humanos', 'medio_ambiente', 'corrupcion', 'relaciones_exteriores', 'educacion', 'salud'];
const SEV = ['low', 'medium', 'high'];
const isStr = (v) => typeof v === 'string';
const isUrl = (v) => { if (!isStr(v)) return false; try { const u = new URL(v); return /^https?:$/.test(u.protocol); } catch { return false; } };

function validSource(s) {
  if (!s || !isUrl(s.url) || !isUrl(s.archived)) return false;
  if (!isStr(s.outlet) || s.outlet.trim().length < 2 || s.outlet.length > 200) return false;
  if (!isStr(s.date) || !ISO.test(s.date.trim())) return false;
  if (s.title != null && (!isStr(s.title) || s.title.trim().length < 3 || s.title.length > 300)) return false;
  return true;
}
function validInc(i, errors) {
  const bad = (m) => { errors.push(`${i && i.id}: ${m}`); return false; };
  if (!i || !SLUG.test(i.id || '')) return bad('id inválido');
  if (!CATS.includes(i.category)) return bad('category inválida');
  if (!SEV.includes(i.severity)) return bad('severity inválida');
  if (typeof i.verified !== 'boolean') return bad('verified no boolean');
  for (const side of ['proposal', 'action']) {
    const st = i[side];
    if (!st || !isStr(st.text) || st.text.trim().length < 10 || st.text.length > 2000) return bad(`${side}.text fuera de rango`);
    if (!validSource(st.source)) return bad(`${side}.source inválida (url/archived/outlet/date)`);
  }
  if (!isStr(i.addedBy) || !i.addedBy.length) return bad('addedBy');
  if (!isStr(i.addedAt) || !ISO.test(i.addedAt)) return bad('addedAt');
  return true;
}

const byFile = {};
for (const [id, file] of Object.entries(MANIFEST)) (byFile[file] = byFile[file] || []).push(id);

const report = { added: 0, skippedDup: 0, invalid: [], entities: 0, files: new Set() };

for (const file of fs.existsSync(OUT_DIR) ? [...new Set(Object.values(MANIFEST))] : []) {
  const fp = path.join(DATA_DIR, file + '.json');
  const arr = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const byId = new Map(arr.map((e) => [e.id, e]));
  let touched = false;

  for (const id of byFile[file] || []) {
    const rf = path.join(OUT_DIR, id + '.json');
    if (!fs.existsSync(rf)) continue;
    let data;
    try { data = JSON.parse(fs.readFileSync(rf, 'utf8')); } catch { continue; }
    const ent = byId.get(id);
    if (!ent) continue;
    ent.incoherences = ent.incoherences || [];
    const have = new Set(ent.incoherences.map((x) => x.id));
    let addedHere = 0;
    for (const inc of data.incoherences || []) {
      if (!validInc(inc, report.invalid)) continue;
      if (have.has(inc.id)) { report.skippedDup++; continue; }
      ent.incoherences.push(inc);
      have.add(inc.id);
      report.added++;
      addedHere++;
    }
    if (addedHere) { touched = true; report.entities++; }
  }
  if (touched && WRITE) { fs.writeFileSync(fp, JSON.stringify(arr, null, 2) + '\n', 'utf8'); report.files.add(file); }
}

console.log('── Restaurar incoherencias ──');
console.log('Incoherencias AGREGADAS:', report.added, '| entidades:', report.entities);
console.log('Duplicadas omitidas:', report.skippedDup);
console.log('Inválidas rechazadas:', report.invalid.length);
report.invalid.forEach((s) => console.log('   ✗', s));
console.log(WRITE ? `\n✓ archivos reescritos: ${[...report.files].join(', ')}` : '\n(dry-run — usa --write para aplicar)');
