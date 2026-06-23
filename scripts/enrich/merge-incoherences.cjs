/**
 * Aplica los veredictos de verificación de incoherencias.
 * Para cada entidad/partido con archivo de veredicto en out/incoherences/<id>.json,
 * conserva SOLO las incoherencias marcadas keep=true y elimina el resto.
 * Las entidades SIN archivo de veredicto se dejan intactas (no se pierde data;
 * se reportan para re-ejecutar).
 *
 * Uso: node scripts/enrich/merge-incoherences.cjs [--write]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'packages', 'data', 'colombia');
const OUT_DIR = path.join(__dirname, 'out', 'incoherences');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(__dirname, 'incoherence-manifest.json'), 'utf8'));
const WRITE = process.argv.includes('--write');

// Agrupar entityIds por archivo de datos
const byFile = {};
for (const [id, file] of Object.entries(MANIFEST)) (byFile[file] = byFile[file] || []).push(id);

const report = { entities: 0, kept: 0, removed: 0, missing: [], invalid: [], noVerdictForInc: [] };

for (const [file, entityIds] of Object.entries(byFile)) {
  const fp = path.join(DATA_DIR, file + '.json');
  const arr = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const byId = new Map(arr.map((e) => [e.id, e]));
  let touched = false;

  for (const id of entityIds) {
    const vf = path.join(OUT_DIR, id + '.json');
    if (!fs.existsSync(vf)) { report.missing.push(id); continue; }
    let verdict;
    try { verdict = JSON.parse(fs.readFileSync(vf, 'utf8')); }
    catch (e) { report.invalid.push(`${id}: ${e.message}`); continue; }

    const keepSet = new Set((verdict.verdicts || []).filter((v) => v.keep === true).map((v) => v.id));
    const known = new Set((verdict.verdicts || []).map((v) => v.id));
    const ent = byId.get(id);
    if (!ent || !Array.isArray(ent.incoherences)) continue;

    const before = ent.incoherences.length;
    ent.incoherences = ent.incoherences.filter((inc) => {
      if (keepSet.has(inc.id)) return true;
      if (!known.has(inc.id)) { report.noVerdictForInc.push(`${id}:${inc.id}`); return true; } // sin veredicto → conservar por seguridad
      return false; // veredicto keep=false → eliminar
    });
    const after = ent.incoherences.length;
    report.kept += after;
    report.removed += before - after;
    report.entities++;
    touched = true;
  }

  if (touched && WRITE) fs.writeFileSync(fp, JSON.stringify(arr, null, 2) + '\n', 'utf8');
}

console.log('── Merge incoherencias ──');
console.log('Entidades procesadas:', report.entities);
console.log('Incoherencias CONSERVADAS:', report.kept);
console.log('Incoherencias ELIMINADAS:', report.removed);
console.log('Sin archivo de veredicto (intactas):', report.missing.length, report.missing.length ? '→ ' + report.missing.join(', ') : '');
console.log('Veredictos inválidos:', report.invalid.length);
report.invalid.forEach((s) => console.log('   ✗', s));
console.log('Incoherencias sin veredicto explícito (conservadas):', report.noVerdictForInc.length);

if (WRITE) console.log('\n✓ archivos reescritos.');
else console.log('\n(dry-run — usa --write para aplicar)');
