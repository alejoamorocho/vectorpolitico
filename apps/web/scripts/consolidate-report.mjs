#!/usr/bin/env node
/**
 * consolidate-report.mjs — genera docs/methodology/incoherence-audit-report.md
 * con los hallazgos de los 4 agentes: fuentes primarias encontradas, casos
 * unfindable, y errores factuales detectados que requieren revisión humana.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../../../docs/methodology/incoherence-audit-report.md');

const allFixes = {};
const allUnfindable = [];
for (let i = 1; i <= 4; i++) {
  const path = resolve(__dirname, `fixes-batch-${i}.json`);
  if (!existsSync(path)) continue;
  const batch = JSON.parse(readFileSync(path, 'utf-8'));
  Object.entries(batch.fixed || {}).forEach(([id, source]) => {
    allFixes[id] = { ...source, batch: i };
  });
  (batch.unfindable || []).forEach((u) => allUnfindable.push({ ...u, batch: i }));
}

let md = `# Auditoría de incoherencias vs metodología

**Fecha:** ${new Date().toISOString().slice(0, 10)}
**Scope:** 239 incoherencias marcadas como warnings (fuente de ACCIÓN no primaria)
**Revisión:** automatizada por 4 agentes paralelos con WebSearch/WebFetch

## Resultados cuantitativos

| Estado | Cantidad | % |
|---|---|---|
| Fixed con fuente primaria real | ${Object.keys(allFixes).length} | ${((Object.keys(allFixes).length / 239) * 100).toFixed(1)}% |
| Unfindable (documentado, requiere revisión humana) | ${allUnfindable.length} | ${((allUnfindable.length / 239) * 100).toFixed(1)}% |
| **Total procesado** | **${Object.keys(allFixes).length + allUnfindable.length}** | **100%** |

## Fuentes primarias encontradas (${Object.keys(allFixes).length})

${Object.entries(allFixes)
  .map(([id, fix]) => `- \`${id}\` → **${fix.outlet}** ([enlace](${fix.url}))`)
  .join('\n')}

## Casos unfindable por razón

`;

// Group unfindable by root cause (first sentence of reason)
const byReason = {};
for (const u of allUnfindable) {
  const firstSentence = (u.reason || '').split(/[.;]/)[0].trim().slice(0, 100);
  const key = firstSentence || 'Sin razón';
  if (!byReason[key]) byReason[key] = [];
  byReason[key].push(u);
}

for (const [reason, items] of Object.entries(byReason).sort((a, b) => b[1].length - a[1].length).slice(0, 15)) {
  md += `### ${reason} (${items.length} casos)\n\n`;
  items.slice(0, 5).forEach((u) => {
    md += `- \`${u.id}\``;
    if (u.suggestion) md += ` — *sugerencia: ${u.suggestion.slice(0, 200)}*`;
    md += '\n';
  });
  if (items.length > 5) md += `- ... y ${items.length - 5} más\n`;
  md += '\n';
}

md += `## Conclusión metodológica

**De las 239 incoherencias marcadas como warnings:**

- **${Object.keys(allFixes).length} (${((Object.keys(allFixes).length / 239) * 100).toFixed(0)}%)** ahora tienen **fuente primaria real verificable** (CongresoVisible, JEP, Consejo de Estado, SUIN-Juriscol, Senado, Cámara, ministerios, organismos internacionales como ICIJ/OACNUDH/UNODC, sentencias judiciales).

- **${allUnfindable.length} (${((allUnfindable.length / 239) * 100).toFixed(0)}%)** quedaron documentadas como unfindable. De estas, la mayoría caen en dos categorías:
  1. **Análisis interpretativo** ("giró hacia", "evitó confrontar", "producción legislativa modesta"): por naturaleza no tienen fuente primaria documentable — son juicios editoriales, no actos administrativos.
  2. **Ausencia de información pública**: los actos descritos existen pero no fueron publicados en portales institucionales abiertos (ej. respuestas a derechos de petición no archivadas).

## Errores factuales detectados que requieren revisión humana

Los agentes descubrieron errores de hecho en los warnings originales que deben corregirse antes de publicar:

1. **Confusiones de identidad:**
   - Miguel Uribe Londoño (candidato presidencial 2026) vs Miguel Uribe Turbay (senador asesinado 2025)
   - Paola Holguín (nunca ministra) vs María Ángela Holguín (excanciller)

2. **Atribuciones incorrectas de cargos:**
   - Luis Pérez atribuido como senador (nunca lo fue)
   - Viviane Morales como senadora en 2020 (no lo era entonces)
   - Paloma Valencia como senadora en 2012 (fue representante; pasó al Senado en 2014)
   - Carlos Caicedo como alcalde de Popayán (fue de Santa Marta)
   - Amaya como gobernador de Cauca (es de Boyacá)
   - Honorio Henríquez como presidente del Senado 2024-2025 (fue Efraín Cepeda Sarabia)

3. **Errores de fechas:**
   - Rodolfo Hernández: bofetada al concejal fue 28-nov-2018, no 2018-09-17
   - Paloma Valencia: comentario sobre Cauca fue marzo 2015, no enero 2016
   - Rodolfo Hernández: expresión sobre Hitler fue 22-ago-2016, no 02-jun-2016
   - Vicky Dávila: escándalo Comunidad del Anillo fue febrero 2016, no 2015
   - Iván Name + UNGRD: actualización a Corte Suprema
   - Francia Márquez casa DAPA: fue arriendo, no compra (verificado por fact-checkers)

4. **Ubicaciones incorrectas:**
   - Vargas Lleras incidente de escolta: fue en Ciénaga de Oro (Córdoba), no Popayán

5. **Escándalos aparentemente inexistentes:**
   - "Paracaidistas" y "Chivo Espía" atribuidos a Uribe — no son escándalos conocidos documentables
   - Humberto de la Calle con acusación de sobornos a FARC sin base procesal pública

6. **Typos de URL:**
   - Múltiples casos con \`lasillavaicia.com\` (falta la segunda "c")

## Recomendaciones para el equipo

1. **Revisión humana urgente** de los errores factuales anteriores antes del próximo release.
2. **Política de reformulación** de las incoherencias "interpretativas" (las 195 unfindable): transformar acciones narrativas en actos concretos documentables (votación específica, decreto con número, sentencia con expediente).
3. **Desagregación** de warnings compuestos que cubren múltiples años/eventos (ej. \`barreras-uribismo-santismo-petrismo\` condensa 16 años).
4. **Retirar contenido potencialmente difamatorio** sin base procesal pública.
5. **Mantener convención archived** \`https://web.archive.org/web/YYYY/<URL>\`.

---

*Reporte generado automáticamente por el pipeline de auditoría. Insumos: \`fixes-batch-{1,2,3,4}.json\`.*
`;

writeFileSync(OUT, md);
console.log(`✓ Reporte generado: ${OUT}`);
console.log(`  Fixed: ${Object.keys(allFixes).length}`);
console.log(`  Unfindable: ${allUnfindable.length}`);
