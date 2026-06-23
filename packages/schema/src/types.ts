/**
 * Brújula Política — Tipos TypeScript canónicos.
 *
 * Estos tipos se DERIVAN de los schemas Zod (`zod.ts`) mediante `z.infer`, de
 * modo que el tipo y la validación runtime nunca puedan divergir: hay una sola
 * fuente de verdad (los schemas). No declares aquí tipos a mano que ya existan
 * como schema; edítalos en `zod.ts` y se reflejan automáticamente.
 *
 * Cualquier cambio estructural debe versionarse y documentarse en /docs/methodology/.
 */

export type {
  // Enums
  EntityType,
  IncoherenceCategory,
  Severity,
  Confidence,
  Quadrant,
  // Bloques base
  Source,
  Period,
  DimensionScores,
  CompassPosition,
  EvidencedCompassPosition,
  IncoherenceStatement,
  Incoherence,
  VpFormula,
  IdeologyAssignment,
  // Entidades del dominio
  Entity,
  Party,
  ExternalLink,
  Ideology,
  // Tipos de respuesta de la API
  EntitySummary,
  FilterParams,
} from './zod';

/**
 * Código de país ISO 3166-1 alpha-2. Los literales son sugerencias de
 * autocompletado; en la práctica se acepta cualquier string de 2 letras
 * (validado por `countrySchema` en `zod.ts`).
 */
export type Country = 'co' | 've' | 'mx' | 'cl' | 'ar' | 'pe' | 'ec' | (string & {});
