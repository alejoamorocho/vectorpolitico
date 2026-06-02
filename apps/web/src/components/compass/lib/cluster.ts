import type { EntitySummary } from '@brujula/schema';

/**
 * Resuelve el solapamiento de figuras que comparten (casi) la misma celda.
 *
 * Como cada figura se ancla al centroide de su ideología, muchas caen en el
 * MISMO punto y se renderizan una encima de otra (parece que "faltan"). Este
 * helper agrupa las figuras por su posición autopercibida redondeada y asigna
 * a cada una un pequeño desplazamiento determinista (en unidades de data) de
 * forma que el grupo se despliega como un racimo legible dentro de la celda.
 *
 * El MISMO desplazamiento se aplica al punto autopercibido y al evidenciado de
 * cada figura, de modo que la flecha de coherencia se preserva intacta.
 */

export type EntityOffset = { dx: number; dy: number };

// Radio del racimo en unidades de data (-10..+10). Una celda típica mide
// ~1.4 a 2.5 unidades, así que 0.55 mantiene el racimo dentro de la celda.
const CLUSTER_RADIUS = 0.55;

function keyFor(x: number, y: number): string {
  // Redondear a 0.5 para agrupar figuras que caen en el mismo centroide.
  return `${Math.round(x * 2) / 2},${Math.round(y * 2) / 2}`;
}

/**
 * Devuelve un Map<entityId, {dx, dy}> con el desplazamiento de cada figura.
 *
 * Layout del racimo: distribución en espiral de Fermat (girasol) que reparte
 * N puntos de forma uniforme y estéticamente agradable sin solapes.
 */
export function computeClusterOffsets(entities: EntitySummary[]): Map<string, EntityOffset> {
  // Agrupar por celda autopercibida
  const groups = new Map<string, EntitySummary[]>();
  for (const e of entities) {
    const k = keyFor(e.compassSelfPerceived.x, e.compassSelfPerceived.y);
    const arr = groups.get(k) ?? [];
    arr.push(e);
    groups.set(k, arr);
  }

  const offsets = new Map<string, EntityOffset>();
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ~2.39996 rad

  for (const [, members] of groups) {
    const n = members.length;
    if (n === 1) {
      offsets.set(members[0].id, { dx: 0, dy: 0 });
      continue;
    }
    // Orden estable por id para que el layout sea determinista entre builds
    const sorted = [...members].sort((a, b) => a.id.localeCompare(b.id));
    for (let i = 0; i < sorted.length; i++) {
      // Espiral de girasol: r = R * sqrt(i / (n-1)), theta = i * golden
      const t = n === 1 ? 0 : i / (n - 1);
      const r = CLUSTER_RADIUS * Math.sqrt(t);
      const theta = i * GOLDEN_ANGLE;
      offsets.set(sorted[i].id, {
        dx: r * Math.cos(theta),
        dy: r * Math.sin(theta),
      });
    }
  }

  return offsets;
}
