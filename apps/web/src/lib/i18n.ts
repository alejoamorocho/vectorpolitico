// apps/web/src/lib/i18n.ts
import type { EntityType } from '@brujula/schema';

export const entityTypeLabels: Record<EntityType, { singular: string; plural: string }> = {
  president:              { singular: 'Presidente',                  plural: 'Presidentes' },
  vice_president:         { singular: 'Vicepresidente',              plural: 'Vicepresidentes' },
  presidential_candidate: { singular: 'Candidato presidencial',      plural: 'Candidatos presidenciales' },
  vp_candidate:           { singular: 'Candidato a vicepresidente',  plural: 'Candidatos a vicepresidente' },
  senator:                { singular: 'Senador',                     plural: 'Senadores' },
  representative:         { singular: 'Representante a la Cámara',   plural: 'Representantes' },
  governor:               { singular: 'Gobernador',                  plural: 'Gobernadores' },
  mayor:                  { singular: 'Alcalde',                     plural: 'Alcaldes' },
};

/** Helper: get singular label for an entity type. */
export function entityTypeLabel(type: string): string {
  return (entityTypeLabels as Record<string, { singular: string }>)[type]?.singular ?? type;
}

/** Helper: get plural label for an entity type. */
export function entityTypeLabelPlural(type: string): string {
  return (entityTypeLabels as Record<string, { plural: string }>)[type]?.plural ?? type;
}
