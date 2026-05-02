#!/usr/bin/env node
/**
 * audit-incoherences.mjs
 *
 * Audita TODAS las incoherencias del proyecto contra los 5 requisitos
 * del estándar metodológico (incoherence-standard.md):
 *   1. Promesa textual con URL, outlet, fecha ISO
 *   2. Acción contraria con fuente PRIMARIA (no opinión, no Twitter)
 *   3. Ambas URLs archivadas en Wayback Machine
 *   4. Categoría válida + severidad justificada
 *   5. verified debe ser boolean (verificación por segundo colaborador)
 *
 * Categoriza issues por severidad (crítico | warning | info) y produce
 * un reporte agregado.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../../../packages/data/colombia');

const VALID_CATEGORIES = new Set([
  'economia',
  'seguridad',
  'derechos_humanos',
  'medio_ambiente',
  'corrupcion',
  'relaciones_exteriores',
  'educacion',
  'salud',
]);
const VALID_SEVERITY = new Set(['low', 'medium', 'high']);

// Outlets that count as primary sources for "action"
const PRIMARY_ACTION_OUTLETS = [
  // Instituciones colombianas
  'congreso visible', 'congresovisible',
  'suin-juriscol', 'suin juriscol',
  'diario oficial',
  'registraduría', 'registraduria',
  'contraloría', 'contraloria',
  'procuraduría', 'procuraduria',
  'consejo de estado', 'corte constitucional', 'corte suprema', 'tribunal',
  'jep', 'cnmh', 'dane', 'ideam', 'epm',
  'minhacienda', 'minsalud', 'mineducación', 'mineducacion',
  'mintrabajo', 'minambiente', 'mintic', 'mincomercio', 'minenergía', 'minenergia',
  'cancillería', 'cancilleria',
  'presidencia', 'función pública', 'funcion publica',
  'senado', 'cámara', 'camara', 'congreso',
  'secretaría', 'secretaria',
  'alcaldía', 'alcaldia', 'gobernación', 'gobernacion', 'concejo de bogotá',
  'fiscalía', 'fiscalia', 'defensoría', 'defensoria',
  'fecode', 'onic', 'cric',
  'comisión de la verdad', 'comision de la verdad',
  // Organismos internacionales reconocidos como fuente primaria
  'corte interamericana', 'cidh', 'oea', 'oacnudh',
  'u.s. congress', 'us congress', 'public law',
  'icij', 'indepaz', 'unodc',
];

// Outlets that are opinion/media — OK for proposal (if Wikipedia-like) but
// need scrutiny for action
const OPINION_OUTLETS = [
  'el tiempo',
  'el espectador',
  'semana',
  'la silla vacía',
  'la silla vacia',
  'blu radio',
  'caracol',
  'rcn',
  'noticias',
  'razón pública',
  'razon publica',
  'infobae',
  'el país',
  'el pais',
  'el colombiano',
  'el heraldo',
  'cnn',
  'bbc',
  'reuters',
  'afp',
  'ap',
];

function isPrimarySource(outlet) {
  if (!outlet) return false;
  const lower = outlet.toLowerCase();
  return PRIMARY_ACTION_OUTLETS.some((po) => lower.includes(po));
}

function isOpinionSource(outlet) {
  if (!outlet) return false;
  const lower = outlet.toLowerCase();
  return OPINION_OUTLETS.some((oo) => lower.includes(oo));
}

// Collect all entities
const files = [
  'presidents',
  'vice-presidents',
  'senators',
  'candidates',
  'vp-candidates',
  'mayors',
  'representatives',
  'governors',
];
const entities = [];
for (const f of files) {
  const arr = JSON.parse(readFileSync(resolve(DATA_DIR, `${f}.json`), 'utf-8'));
  arr.forEach((e) => entities.push({ ...e, _file: f }));
}

// Audit
let totalIncoherences = 0;
const issues = {
  critical: [],
  warning: [],
  info: [],
};

for (const entity of entities) {
  for (const inc of entity.incoherences || []) {
    totalIncoherences++;
    const ctx = `${entity.displayName} / ${inc.id}`;

    // CRITICAL: missing required fields
    if (!inc.id) issues.critical.push(`${ctx}: falta id`);
    if (!inc.category || !VALID_CATEGORIES.has(inc.category)) {
      issues.critical.push(`${ctx}: category inválida "${inc.category}"`);
    }
    if (!inc.severity || !VALID_SEVERITY.has(inc.severity)) {
      issues.critical.push(`${ctx}: severity inválida "${inc.severity}"`);
    }
    if (typeof inc.verified !== 'boolean') {
      issues.critical.push(`${ctx}: verified debe ser boolean`);
    }

    // CRITICAL: proposal structure
    if (!inc.proposal?.text || inc.proposal.text.length < 20) {
      issues.critical.push(`${ctx}: proposal.text corto o ausente`);
    }
    if (!inc.proposal?.source?.url) issues.critical.push(`${ctx}: proposal.source.url ausente`);
    if (!inc.proposal?.source?.outlet) issues.critical.push(`${ctx}: proposal.source.outlet ausente`);
    if (!inc.proposal?.source?.date || !/^\d{4}-\d{2}-\d{2}$/.test(inc.proposal?.source?.date)) {
      issues.critical.push(`${ctx}: proposal.source.date no es ISO YYYY-MM-DD`);
    }
    if (!inc.proposal?.source?.archived) {
      issues.critical.push(`${ctx}: proposal.source.archived ausente (requisito Wayback)`);
    }

    // CRITICAL: action structure
    if (!inc.action?.text || inc.action.text.length < 20) {
      issues.critical.push(`${ctx}: action.text corto o ausente`);
    }
    if (!inc.action?.source?.url) issues.critical.push(`${ctx}: action.source.url ausente`);
    if (!inc.action?.source?.outlet) issues.critical.push(`${ctx}: action.source.outlet ausente`);
    if (!inc.action?.source?.date || !/^\d{4}-\d{2}-\d{2}$/.test(inc.action?.source?.date)) {
      issues.critical.push(`${ctx}: action.source.date no es ISO YYYY-MM-DD`);
    }
    if (!inc.action?.source?.archived) {
      issues.critical.push(`${ctx}: action.source.archived ausente (requisito Wayback)`);
    }

    // WARNING: action should come from primary source
    if (inc.action?.source?.outlet && !isPrimarySource(inc.action.source.outlet)) {
      if (isOpinionSource(inc.action.source.outlet)) {
        issues.warning.push(
          `${ctx}: action.outlet "${inc.action.source.outlet}" es medio de opinión — debería ser fuente primaria (votación, decreto, resolución, sentencia, ejecución presupuestal)`
        );
      } else {
        issues.info.push(`${ctx}: action.outlet "${inc.action.source.outlet}" no reconocida como primaria`);
      }
    }

    // WARNING: addedBy and addedAt
    if (!inc.addedBy) issues.warning.push(`${ctx}: addedBy ausente`);
    if (!inc.addedAt || !/^\d{4}-\d{2}-\d{2}$/.test(inc.addedAt)) {
      issues.warning.push(`${ctx}: addedAt no es ISO YYYY-MM-DD`);
    }

    // INFO: verified=false is expected (pre-merge); verified=true needs verifiedBy
    if (inc.verified === true && !inc.verifiedBy) {
      issues.critical.push(`${ctx}: verified=true pero verifiedBy ausente`);
    }

    // INFO: nuances is optional but recommended
    if (!inc.nuances) issues.info.push(`${ctx}: sin nuances (opcional pero recomendado)`);
  }
}

// Report
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  AUDITORÍA DE 326 INCOHERENCIAS vs METODOLOGÍA            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log(`Total entidades: ${entities.length}`);
console.log(`Total incoherencias: ${totalIncoherences}\n`);

console.log(`🔴 CRÍTICOS: ${issues.critical.length}`);
console.log(`🟡 WARNINGS (fuente no primaria): ${issues.warning.length}`);
console.log(`🔵 INFO: ${issues.info.length}\n`);

if (issues.critical.length > 0) {
  console.log('━━━ ISSUES CRÍTICOS (bloquean cumplimiento metodológico) ━━━');
  issues.critical.slice(0, 30).forEach((i) => console.log('  🔴', i));
  if (issues.critical.length > 30) console.log(`  ... y ${issues.critical.length - 30} más`);
  console.log('');
}

// Summary by outlet for warnings
if (issues.warning.length > 0) {
  console.log('━━━ WARNINGS por outlet (acción con fuente no primaria) ━━━');
  const outletCount = {};
  for (const w of issues.warning) {
    const match = w.match(/action\.outlet "([^"]+)"/);
    if (match) outletCount[match[1]] = (outletCount[match[1]] || 0) + 1;
  }
  Object.entries(outletCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([outlet, count]) => console.log(`  🟡 ${count}× ${outlet}`));
  console.log('');
}

// Critical issues categorized
if (issues.critical.length > 0) {
  const categorized = {};
  for (const c of issues.critical) {
    const match = c.match(/: (.+?)(?:\s\(|$)/);
    if (match) {
      const kind = match[1]
        .replace(/"[^"]+"/g, '"X"')
        .replace(/\d+/g, 'N')
        .slice(0, 80);
      categorized[kind] = (categorized[kind] || 0) + 1;
    }
  }
  console.log('━━━ TIPOS DE ISSUES CRÍTICOS ━━━');
  Object.entries(categorized)
    .sort((a, b) => b[1] - a[1])
    .forEach(([kind, count]) => console.log(`  ${count}× ${kind}`));
  console.log('');
}

// Entities with most issues
const entityIssues = {};
for (const all of [...issues.critical, ...issues.warning]) {
  const match = all.match(/^([^/]+?) \//);
  if (match) {
    const name = match[1].trim();
    entityIssues[name] = (entityIssues[name] || 0) + 1;
  }
}
console.log('━━━ TOP 10 ENTIDADES CON MÁS ISSUES ━━━');
Object.entries(entityIssues)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([name, count]) => console.log(`  ${count}× ${name}`));

const compliant = totalIncoherences - issues.critical.length;
console.log(`\n━━━ RESUMEN FINAL ━━━`);
console.log(`Incoherencias 100% compliance (críticos=0): ${compliant}/${totalIncoherences}`);
console.log(`Tasa de cumplimiento estricto: ${((compliant / totalIncoherences) * 100).toFixed(1)}%`);
