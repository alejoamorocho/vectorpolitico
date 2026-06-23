/**
 * Loader de datos en build time.
 *
 * Lee los JSON de @brujula/data, los valida con zod (de @brujula/schema)
 * y expone funciones de acceso tipadas para las páginas Astro.
 *
 * Si cualquier JSON es inválido, el build falla con un mensaje claro.
 * Astro SSG los compila a HTML estático — cero costo runtime.
 */

// @brujula/data expone JSON bajo packages/data/. Importamos directo por path
// relativo porque Vite/Astro no resuelve bien los subpath-exports de workspace
// packages con node-linker=hoisted.
import ideologies from '../../../../packages/data/ideologies.json';
import parties from '../../../../packages/data/colombia/parties.json';
import presidentsRaw from '../../../../packages/data/colombia/presidents.json';
import vicePresidentsRaw from '../../../../packages/data/colombia/vice-presidents.json';
import senatorsRaw from '../../../../packages/data/colombia/senators.json';
import candidatesRaw from '../../../../packages/data/colombia/candidates.json';
import vpCandidatesRaw from '../../../../packages/data/colombia/vp-candidates.json';
import mayorsRaw from '../../../../packages/data/colombia/mayors.json';
import representativesRaw from '../../../../packages/data/colombia/representatives.json';
import governorsRaw from '../../../../packages/data/colombia/governors.json';

import type {
  Entity,
  EntitySummary,
  Ideology,
  Party,
} from '@brujula/schema';
import {
  parseEntityOrThrow,
  parseIdeologyOrThrow,
  parsePartyOrThrow,
} from '@brujula/schema/zod';

// ─── Validación en build ─────────────────────────────────────────────────────

const allEntitiesRaw: unknown[] = [
  ...(presidentsRaw as unknown[]),
  ...(vicePresidentsRaw as unknown[]),
  ...(senatorsRaw as unknown[]),
  ...(candidatesRaw as unknown[]),
  ...(vpCandidatesRaw as unknown[]),
  ...(mayorsRaw as unknown[]),
  ...(representativesRaw as unknown[]),
  ...(governorsRaw as unknown[]),
];

const _entities: Entity[] = allEntitiesRaw.map((raw, i) =>
  parseEntityOrThrow(raw, `entity[${i}]`),
);

const _parties: Party[] = (parties as unknown[]).map((raw, i) =>
  parsePartyOrThrow(raw, `party[${i}]`),
);

const _ideologies: Ideology[] = (ideologies as unknown[]).map((raw, i) =>
  parseIdeologyOrThrow(raw, `ideology[${i}]`),
);

// ─── Math helpers ────────────────────────────────────────────────────────────

function euclideanDistance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function toEntitySummary(e: Entity): EntitySummary {
  return {
    id: e.id,
    country: e.country,
    type: e.type,
    displayName: e.displayName,
    photoUrl: e.photoUrl,
    party: e.party,
    periods: e.periods,
    compassSelfPerceived: {
      x: e.compassSelfPerceived.x,
      y: e.compassSelfPerceived.y,
    },
    compassEvidenced: {
      x: e.compassEvidenced.x,
      y: e.compassEvidenced.y,
      confidence: e.compassEvidenced.confidence,
    },
    ideologySelf: e.ideologySelf,
    ideologyEvidenced: e.ideologyEvidenced,
    delta: euclideanDistance(e.compassSelfPerceived, e.compassEvidenced),
    incoherenceCount: e.incoherences.length,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function getAllEntities(): Entity[] {
  return _entities;
}

export function getEntityBySlug(slug: string): Entity | undefined {
  return _entities.find((e) => e.id === slug);
}

export function getEntitiesByType(type: Entity['type']): Entity[] {
  return _entities.filter((e) => e.type === type);
}

export function getEntitiesByParty(partyId: string): Entity[] {
  return _entities.filter((e) => e.party === partyId);
}

export function getCompassSummary(): EntitySummary[] {
  return _entities.map(toEntitySummary);
}

export function getAllParties(): Party[] {
  return _parties;
}

export function getPartyBySlug(slug: string): Party | undefined {
  return _parties.find((p) => p.id === slug);
}

export function getAllIdeologies(): Ideology[] {
  return _ideologies;
}

export function getIdeologyBySlug(slug: string): Ideology | undefined {
  return _ideologies.find((i) => i.id === slug);
}

export function getEntitiesByIdeology(ideologyId: string): Entity[] {
  return _entities.filter((e) => e.ideologies.includes(ideologyId));
}

export { euclideanDistance };
