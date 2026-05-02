/**
 * Estado global del compass — nanostores (cero overhead, funciona entre islas Astro).
 *
 * Por qué nanostores y no Zustand: nanostores hidrata sin Context Provider,
 * lo que permite que <CompassFilters> y <Compass> sean islas React separadas
 * en la misma página Astro y compartan estado sin acoplamiento.
 */

import { atom, computed } from 'nanostores';
import type { EntitySummary, FilterParams } from '@brujula/schema';

// ─── Stores ──────────────────────────────────────────────────────────────────

/** Filtros activos en el compass. */
export const $filters = atom<FilterParams>({});

/** ID de la entidad resaltada (hover o click). null = sin highlight. */
export const $highlightId = atom<string | null>(null);

/** Todas las entidades disponibles (cargadas desde el endpoint estático). */
export const $allEntities = atom<EntitySummary[]>([]);

/** Entidades filtradas según $filters. */
export const $filteredEntities = computed(
  [$allEntities, $filters],
  (entities, f) =>
    entities.filter((e) => {
      if (f.country && e.country !== f.country) return false;
      if (f.type) {
        const types = Array.isArray(f.type) ? f.type : [f.type];
        if (!types.includes(e.type)) return false;
      }
      if (f.party && e.party !== f.party) return false;
      if (f.confidence && e.compassEvidenced.confidence !== f.confidence) return false;
      if (f.period) {
        const [fromStr, toStr] = f.period.split('-');
        const from = Number(fromStr);
        const to = Number(toStr);
        const active = e.periods.some((p) => {
          const ps = Number(p.startDate.slice(0, 4));
          const pe = p.endDate ? Number(p.endDate.slice(0, 4)) : 9999;
          return ps <= to && pe >= from;
        });
        if (!active) return false;
      }
      return true;
    }),
);

// ─── Actions ─────────────────────────────────────────────────────────────────

export function setFilter<K extends keyof FilterParams>(
  key: K,
  value: FilterParams[K] | undefined,
): void {
  const current = $filters.get();
  const next = { ...current };
  if (value === undefined) {
    delete next[key];
  } else {
    next[key] = value;
  }
  $filters.set(next);
}

export function clearFilters(): void {
  $filters.set({});
}

export function setHighlight(id: string | null): void {
  $highlightId.set(id);
}

export function loadEntities(entities: EntitySummary[]): void {
  $allEntities.set(entities);
}
