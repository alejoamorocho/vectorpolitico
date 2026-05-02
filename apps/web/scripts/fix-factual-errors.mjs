#!/usr/bin/env node
/**
 * fix-factual-errors.mjs
 *
 * Aplica las correcciones factuales detectadas por los agentes auditores.
 * Categorías:
 *   A. Typos de URL (lasillavaicia → lasillavacia)
 *   B. Errores de fecha
 *   C. Errores de ubicación
 *   D. Eliminación de incoherencias fabricadas/difamatorias sin base documental
 *   E. Correcciones de identidad/cargo
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../../../packages/data/colombia');

const FILES = [
  'presidents',
  'vice-presidents',
  'senators',
  'candidates',
  'vp-candidates',
  'mayors',
  'representatives',
  'governors',
];

// ─── A) Typos de URL globales ────────────────────────────────────────────────
function fixUrlTypos(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/lasillavaicia\.com/g, 'lasillavacia.com');
}

// ─── B+C+E) Correcciones por ID de incoherencia ──────────────────────────────
// Cada entrada puede: patch (merge parcial) o remove: true
const INCOHERENCE_PATCHES = {
  // Rodolfo Hernández — bofetada al concejal fue 28-nov-2018, no 2018-09-17
  'rodolfo-bofetada-concejal': {
    patch: {
      action: {
        source: {
          date: '2018-11-28',
        },
      },
    },
    note: 'Fecha corregida: 2018-09-17 → 2018-11-28 (incidente real)',
  },

  // Rodolfo Hernández — expresión sobre Hitler fue 22-ago-2016, no 02-jun-2016
  'rodolfo-expresion-hitler': {
    patch: {
      action: {
        source: {
          date: '2016-08-22',
        },
      },
    },
    note: 'Fecha corregida: 2016-06-02 → 2016-08-22',
  },

  // Paloma Valencia — comentario sobre Cauca fue marzo 2015, no enero 2016
  'paloma-cauca-division': {
    patch: {
      action: {
        source: {
          date: '2015-03-01',
        },
      },
    },
    note: 'Fecha corregida: 2016-01-XX → 2015-03-XX',
  },

  // Vicky Dávila — escándalo Comunidad del Anillo fue febrero 2016, no 2015
  'davila-escandalo-uribe-audios-2015': {
    patch: {
      action: {
        source: {
          date: '2016-02-01',
        },
      },
    },
    note: 'Fecha corregida: 2015 → feb-2016 (Comunidad del Anillo)',
  },

  // Vargas Lleras escolta — incidente fue en Ciénaga de Oro (Córdoba), dic-2016
  'vargas-lleras-escolta-popayan': {
    patch: {
      action: {
        text: 'El 16 de diciembre de 2016, durante campaña presidencial en Ciénaga de Oro (Córdoba), Germán Vargas Lleras abofeteó a un escolta de seguridad en una incidente público registrado en video y en múltiples medios. Vargas Lleras se disculpó posteriormente en rueda de prensa.',
        source: {
          date: '2016-12-16',
        },
      },
    },
    note: 'Ubicación+fecha corregidas: Popayán 2017-03 → Ciénaga de Oro (Córdoba) 2016-12. Nombre de víctima eliminado por no verificarse.',
  },

  // Beltrán - Santa Marta turismo (asignación cruzada — él es de Bucaramanga)
  'beltran-santa-marta-turismo': {
    remove: true,
    note: 'Asignación cruzada: Juan Carlos Beltrán es alcalde de Bucaramanga, no Santa Marta. Incoherence incorrectamente atribuida.',
  },

  // Jorge Iván Ospina - transporte metro (asignación cruzada — él es de Cali, describe Manizales)
  'jo-transporte-metro': {
    remove: true,
    note: 'Asignación cruzada: Ospina es alcalde de Cali, el texto describe Manizales.',
  },

  // Carlos Caicedo — atribuido como alcalde de Popayán (fue de Santa Marta)
  'carlos-caicedo-educacion-presupuesto': {
    remove: true,
    note: 'Error factual: atribuye a Caicedo haber sido alcalde de Popayán. Fue alcalde de Santa Marta.',
  },
  'carlos-caicedo-seguridad-promesas': {
    remove: true,
    note: 'Error factual: atribuye a Caicedo haber sido alcalde de Popayán. Fue alcalde de Santa Marta.',
  },

  // Luis Pérez nunca fue senador — incoherencias con este supuesto son inválidas
  'lp-seguridad-rural': {
    remove: true,
    note: 'Error factual: Luis Pérez nunca fue senador/congresista.',
  },
  'luis-perez-pensiones-reforma': {
    remove: true,
    note: 'Error factual: Luis Pérez nunca fue senador/congresista.',
  },

  // Viviane Morales no era senadora en 2020
  'vm-pensiones-reforma': {
    remove: true,
    note: 'Error factual: Viviane Morales no era senadora en 2020 (fue 2014-2018).',
  },

  // Amaya — gobernador de Boyacá, no Cauca
  'amaya-cauca-mineria': {
    remove: true,
    note: 'Error factual: Amaya es gobernador de Boyacá, no Cauca. Ubicación incorrecta.',
  },

  // Luis Gilberto Murillo — bajo su gestión deforestación BAJÓ al mínimo histórico
  'luis-gilberto-murillo-medio-ambiente': {
    remove: true,
    note: 'Error factual: bajo gestión Murillo como Canciller (2023-2024) la deforestación bajó al mínimo histórico — el claim original afirma lo contrario.',
  },

  // Honorio Henríquez — presidencia del Senado 2024-2025 fue de Efraín Cepeda Sarabia
  'henriquez-presidencia-senado-acuerdo-paz': {
    remove: true,
    note: 'Error factual: Honorio Henríquez no fue presidente del Senado 2024-2025 (fue Efraín Cepeda Sarabia).',
  },

  // Paloma Valencia — no era senadora en 2012 (fue representante, pasó al Senado en 2014)
  'pv-victimas-reparacion': {
    remove: true,
    note: 'Error factual: Paloma Valencia no era senadora en 2012 (ingresó al Senado en 2014).',
  },

  // Paola Holguín — nunca fue ministra; confundida con María Ángela Holguín
  'ph-justicia-transicional': {
    remove: true,
    note: 'Confusión de identidad: Paola Holguín (senadora) vs María Ángela Holguín (excanciller). Claim no aplica a Paola.',
  },

  // Clara López — no hay evidencia de nombramiento como embajadora bajo Duque
  'claralopez-embajada-duque-2020': {
    remove: true,
    note: 'Sin evidencia documental: no hay registro de nombramiento como embajadora bajo Duque.',
  },

  // Francia Márquez casa DAPA — fue arriendo, no compra
  'franciamarquez-casa-dapa-2022': {
    patch: {
      action: {
        text: 'En 2022, tras asumir la vicepresidencia, Francia Márquez se hospedó en una finca en DAPA (Valle del Cauca) por razones de seguridad. Fact-checkers verificaron que fue en calidad de arriendo con cargo al presupuesto de protección de la vicepresidencia, no una compra personal como se difundió. La inversión en protección se justificó por el nivel de amenaza contra su vida documentado por la UNP.',
      },
    },
    note: 'Aclaración: fue arriendo con cargo a presupuesto de protección, no compra. Verificado por Colombia Check y La Silla Vacía Fact-checking.',
  },

  // Humberto de la Calle — acusación de sobornos FARC sin base procesal pública
  'hdc-negocios-farc': {
    remove: true,
    note: 'Sin base documental: no hay investigación pública ni sentencia sobre sobornos de HDC por FARC. Claim potencialmente difamatorio.',
  },

  // Uribe — escándalos "Paracaidistas" y "Chivo Espía" no son documentables
  'alvaro-uribe-senador-corrupcion-2025': {
    remove: true,
    note: 'Sin base documental: "Paracaidistas" y "Chivo Espía" no corresponden a escándalos documentables de Uribe. Casos reales son Agro Ingreso Seguro, Yidispolítica, chuzadas del DAS, Saludcoop.',
  },

  // Acusaciones vagas sin base procesal
  'mauricio-lizcano-corrupcion': {
    remove: true,
    note: 'Sin caso concreto especificado. Acusación genérica sin base procesal pública.',
  },
  'ivan-cepeda-transparencia-fondos': {
    remove: true,
    note: 'Sin caso concreto especificado. Acusación genérica sin base procesal pública.',
  },
  'enrique-gomez-corrupcion': {
    remove: true,
    note: 'Sin caso concreto especificado. Acusación genérica.',
  },

  // Ortega no era senador durante PND 2022-2026
  'ortega-descentralizacion': {
    remove: true,
    note: 'Error temporal: Ortega no era senador durante PND 2022-2026.',
  },

  // Miguel Uribe — confusión entre Londoño (padre, candidato 2026) y Turbay (hijo, senador asesinado 2025)
  // Los 3 incoherencias mencionadas deben revisarse individualmente — removemos las que mezclan identidades
  'miguel-uribe-seguridad-vs-atentado': {
    remove: true,
    note: 'Confusión de identidad: Miguel Uribe Londoño (padre, candidato 2026) vs Miguel Uribe Turbay (hijo, senador asesinado 2025). Requiere reformulación clara.',
  },
  'miguel-uribe-renovacion-trayectoria-familiar': {
    remove: true,
    note: 'Confusión de identidad: Miguel Uribe Londoño (padre, candidato 2026) vs Miguel Uribe Turbay (hijo, senador asesinado 2025). Requiere reformulación clara.',
  },

  // Bolívar posesión DPS — fecha real 2024-03-05, no 2023-08-14
  'bolivar-outsider-renuncia-recurso': {
    patch: {
      action: {
        source: {
          date: '2024-03-05',
        },
      },
    },
    note: 'Fecha corregida: 2023-08-14 → 2024-03-05 (posesión real).',
  },
};

// Cifra errónea de homicidios en Medellín 2023
// El warning afirma 42/100k; cifra oficial oficial (Medicina Legal) fue ~13.5/100k.
INCOHERENCE_PATCHES['gutierrez-medellin-homicidios'] = {
  remove: true,
  note: 'Error factual: tasa oficial 2023 fue ~13.5/100k (mínimo histórico), no 42/100k como afirma el claim.',
};

// ─── Aplicar cambios ─────────────────────────────────────────────────────────
const removedIds = [];
const patchedIds = [];
const typoFixes = { count: 0 };

function deepMerge(target, source) {
  if (!source) return target;
  const out = { ...target };
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && out[k] && typeof out[k] === 'object') {
      out[k] = deepMerge(out[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function walkFixTypos(obj) {
  if (typeof obj === 'string') {
    const fixed = fixUrlTypos(obj);
    if (fixed !== obj) typoFixes.count++;
    return fixed;
  }
  if (Array.isArray(obj)) return obj.map(walkFixTypos);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = walkFixTypos(v);
    return out;
  }
  return obj;
}

for (const f of FILES) {
  const path = resolve(DATA_DIR, `${f}.json`);
  let arr = JSON.parse(readFileSync(path, 'utf-8'));
  let modified = false;

  for (const e of arr) {
    if (!e.incoherences) continue;
    const origLen = e.incoherences.length;
    // First: remove flagged incoherences
    e.incoherences = e.incoherences.filter((inc) => {
      const rule = INCOHERENCE_PATCHES[inc.id];
      if (rule?.remove) {
        removedIds.push({ entity: e.displayName, id: inc.id, note: rule.note });
        return false;
      }
      return true;
    });
    if (e.incoherences.length !== origLen) modified = true;

    // Second: apply patches
    for (const inc of e.incoherences) {
      const rule = INCOHERENCE_PATCHES[inc.id];
      if (rule?.patch) {
        const before = JSON.stringify(inc);
        const merged = deepMerge(inc, rule.patch);
        Object.assign(inc, merged);
        if (JSON.stringify(inc) !== before) {
          patchedIds.push({ entity: e.displayName, id: inc.id, note: rule.note });
          modified = true;
        }
      }
    }
  }

  // Third: fix URL typos globally
  arr = walkFixTypos(arr);

  writeFileSync(path, JSON.stringify(arr, null, 2) + '\n');
  if (modified) console.log(`  ✓ ${f}.json`);
}

console.log(`\n━━━ RESUMEN ━━━`);
console.log(`✓ Incoherencias removidas: ${removedIds.length}`);
removedIds.forEach((r) => console.log(`  - ${r.entity} / ${r.id}: ${r.note}`));
console.log(`\n✓ Incoherencias con correcciones: ${patchedIds.length}`);
patchedIds.forEach((p) => console.log(`  - ${p.entity} / ${p.id}: ${p.note}`));
console.log(`\n✓ Typos de URL corregidos (lasillavaicia → lasillavacia): ${typoFixes.count}`);
