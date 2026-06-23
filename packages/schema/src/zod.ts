/**
 * Schemas Zod isomorfos a types.ts.
 *
 * Se usan para:
 *  - Validación en build time (Astro lee los JSON y los parsea con estos schemas).
 *  - Validación en runtime (Hono API valida queries y payloads).
 *  - Generación de OpenAPI/TypeScript desde un solo sitio.
 *
 * IMPORTANTE: mantener estos schemas sincronizados con `types.ts`.
 * Si agregas un campo en types.ts, agrégalo aquí también. El CI falla si
 * un JSON en packages/data/** no cumple estos schemas.
 */

import { z } from 'zod';

// ─── Primitives ──────────────────────────────────────────────────────────────

/** Score en el compass: -10 a +10 inclusive. */
export const scoreSchema = z
  .number()
  .min(-10, 'Score debe ser >= -10')
  .max(10, 'Score debe ser <= +10');

/** Fecha ISO YYYY-MM-DD. */
export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Debe ser fecha ISO YYYY-MM-DD');

/** Slug kebab-case: lowercase, números, guiones. */
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Debe ser slug kebab-case');

/** Código de país ISO 3166-1 alpha-2 (lowercase). */
export const countrySchema = z
  .string()
  .regex(/^[a-z]{2}$/, 'Debe ser código ISO 3166-1 alpha-2 en minúsculas');

/** Color hexadecimal válido. */
export const hexColorSchema = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Debe ser color hex #RGB o #RRGGBB');

/** URL http(s) válida. Rechaza esquemas peligrosos (javascript:, data:, etc.)
 *  que `z.url()` aceptaría — previene XSS al renderizar URLs de datos en `href`. */
export const urlSchema = z
  .string()
  .url('Debe ser URL válida')
  .refine((u) => /^https?:\/\//i.test(u.trim()), 'La URL debe usar esquema http(s)');

// ─── Enums ───────────────────────────────────────────────────────────────────

export const entityTypeSchema = z.enum([
  'president',
  'vice_president',
  'presidential_candidate',
  'vp_candidate',
  'senator',
  'representative',
  'governor',
  'mayor',
]);

export const incoherenceCategorySchema = z.enum([
  'economia',
  'seguridad',
  'derechos_humanos',
  'medio_ambiente',
  'corrupcion',
  'relaciones_exteriores',
  'educacion',
  'salud',
]);

export const severitySchema = z.enum(['low', 'medium', 'high']);
export const confidenceSchema = z.enum(['low', 'medium', 'high']);

export const quadrantSchema = z.enum([
  'auth_left',
  'auth_right',
  'lib_left',
  'lib_right',
]);

// ─── Building blocks ─────────────────────────────────────────────────────────

export const sourceSchema = z.object({
  url: urlSchema,
  title: z.string().min(3).max(300).optional(),
  outlet: z.string().min(2).max(200),
  date: isoDateSchema,
  /** Para incoherencias, este campo es obligatorio (validado al nivel superior). */
  archived: urlSchema.optional(),
});

export const periodSchema = z
  .object({
    role: entityTypeSchema,
    startDate: isoDateSchema,
    endDate: isoDateSchema.optional(),
    region: z.string().min(2).max(120).optional(),
    electedWith: z.number().min(0).max(100).optional(),
  })
  .refine(
    (p) => !p.endDate || p.endDate >= p.startDate,
    { message: 'endDate debe ser >= startDate', path: ['endDate'] },
  );

// ─── Compass ─────────────────────────────────────────────────────────────────

export const dimensionScoresSchema = z.object({
  // Eje X — Económico
  fiscalPolicy: scoreSchema,
  marketPosition: scoreSchema,
  socialPolicy: scoreSchema,
  tradePolicy: scoreSchema,
  // Eje Y — Social
  civilRights: scoreSchema,
  securityApproach: scoreSchema,
  socialRights: scoreSchema,
  powerConcentration: scoreSchema,
});

export const compassPositionSchema = z.object({
  x: scoreSchema,
  y: scoreSchema,
  justification: z.string().min(20).max(5000).optional(),
  sources: z.array(sourceSchema).optional(),
  // Para partidos: confidence sin dimensionScores.
  // Para entidades individuales usar evidencedCompassPositionSchema.
  confidence: confidenceSchema.optional(),
});

export const evidencedCompassPositionSchema = compassPositionSchema.extend({
  confidence: confidenceSchema,
  dimensionScores: dimensionScoresSchema,
});

// ─── Incoherencias ───────────────────────────────────────────────────────────

/** Una statement (promesa o acción) de una incoherencia. `source.archived` es obligatorio. */
export const incoherenceStatementSchema = z.object({
  text: z.string().min(10).max(2000),
  source: sourceSchema.extend({
    archived: urlSchema, // forzado a obligatorio aquí
  }),
});

export const incoherenceSchema = z
  .object({
    id: slugSchema,
    category: incoherenceCategorySchema,
    severity: severitySchema,
    verified: z.boolean(),
    verifiedBy: z.string().min(1).max(100).optional(),
    proposal: incoherenceStatementSchema,
    action: incoherenceStatementSchema,
    nuances: z.string().max(2000).optional(),
    addedBy: z.string().min(1).max(100),
    addedAt: isoDateSchema,
  })
  .refine(
    (i) => !i.verified || (i.verifiedBy && i.verifiedBy.length > 0),
    {
      message: 'Si verified=true, verifiedBy es obligatorio',
      path: ['verifiedBy'],
    },
  );

// ─── Ideología (celda del compass) ───────────────────────────────────────────

export const externalLinkSchema = z.object({
  title: z.string().min(2).max(200),
  url: urlSchema,
  outlet: z.string().min(2).max(200).optional(),
});

export const ideologySchema = z.object({
  id: slugSchema,
  name: z.string().min(2).max(120),
  nameEn: z.string().min(2).max(120).optional(),
  x: scoreSchema,
  y: scoreSchema,
  width: z.number().positive().max(20),
  height: z.number().positive().max(20),
  quadrant: quadrantSchema,
  color: hexColorSchema,
  description: z.string().min(20).max(3000),
  longDescription: z.string().min(50).max(10000).optional(),
  historicalContext: z.string().min(20).max(5000).optional(),
  contemporaryRelevance: z.string().min(20).max(3000).optional(),
  commonCriticisms: z.string().min(20).max(3000).optional(),
  keyThinkers: z.array(z.string().min(2).max(120)).optional(),
  historicalExamples: z.array(z.string().min(2).max(200)).optional(),
  relatedIdeologies: z.array(slugSchema).optional(),
  wikipediaUrl: urlSchema.optional(),
  externalLinks: z.array(externalLinkSchema).optional(),
});

// ─── Partido ─────────────────────────────────────────────────────────────────

export const partySchema = z.object({
  id: slugSchema,
  country: countrySchema,
  name: z.string().min(2).max(120),
  fullName: z.string().min(2).max(200),
  color: hexColorSchema,
  logoUrl: urlSchema.optional(),
  websiteUrl: urlSchema.optional(),
  foundedYear: z.number().int().min(1800).max(2100).optional(),
  dissolvedYear: z.number().int().min(1800).max(2100).optional(),
  description: z.string().min(20).max(3000),
  ideologies: z.array(slugSchema),
  compassPosition: compassPositionSchema.optional(),
  sources: z.array(sourceSchema).optional(),
  incoherences: z.array(incoherenceSchema).default([]),
  lastUpdated: isoDateSchema,
  contributors: z.array(z.string().min(1).max(100)),
});

// ─── Fórmula vicepresidencial ────────────────────────────────────────────────

export const vpFormulaSchema = z.object({
  fullName: z.string().min(3).max(200),
  shortName: z.string().min(2).max(120).optional(),
  bio: z.string().min(10).max(3000).optional(),
});

// ─── Asignación ideológica con trazabilidad (metodología v2) ────────────────

/**
 * Documenta POR QUÉ una persona recibe una ideología concreta.
 * Cada asignación debe tener al menos 1 fuente verificable.
 */
export const ideologyAssignmentSchema = z.object({
  ideologyId: slugSchema,
  justification: z.string().min(20).max(3000),
  sources: z.array(sourceSchema).min(1, 'Se requiere al menos una fuente'),
});

// ─── Entidad política ────────────────────────────────────────────────────────

export const entitySchema = z
  .object({
    id: slugSchema,
    country: countrySchema,
    type: entityTypeSchema,
    fullName: z.string().min(3).max(200),
    displayName: z.string().min(2).max(120),
    photoUrl: urlSchema.optional(),
    party: slugSchema.nullish(),
    vpFormula: vpFormulaSchema.optional(),
    periods: z.array(periodSchema).min(1, 'Al menos un período es requerido'),
    compassSelfPerceived: compassPositionSchema,
    compassEvidenced: evidencedCompassPositionSchema,
    ideologies: z.array(slugSchema),
    ideologySelf: slugSchema.optional(),
    ideologyEvidenced: slugSchema.optional(),
    // Metodología v2: asignaciones con justificación y fuentes.
    // Si están presentes, su ideologyId debe coincidir con el string legacy.
    ideologySelfAssignment: ideologyAssignmentSchema.optional(),
    ideologyEvidencedAssignment: ideologyAssignmentSchema.optional(),
    bio: z.string().min(50).max(5000),
    incoherences: z.array(incoherenceSchema),
    lastUpdated: isoDateSchema,
    contributors: z.array(z.string().min(1).max(100)).min(1),
  })
  .refine(
    (e) => {
      // Coherencia: una incoherencia verified=true debe tener revisor distinto al que la agregó
      return e.incoherences.every(
        (inc) => !inc.verified || inc.verifiedBy !== inc.addedBy,
      );
    },
    {
      message:
        'Una incoherencia verificada debe ser revisada por alguien distinto al que la agregó',
      path: ['incoherences'],
    },
  )
  .refine(
    (e) =>
      !e.ideologySelfAssignment ||
      !e.ideologySelf ||
      e.ideologySelfAssignment.ideologyId === e.ideologySelf,
    {
      message:
        'ideologySelfAssignment.ideologyId debe coincidir con ideologySelf (string legacy)',
      path: ['ideologySelfAssignment'],
    },
  )
  .refine(
    (e) =>
      !e.ideologyEvidencedAssignment ||
      !e.ideologyEvidenced ||
      e.ideologyEvidencedAssignment.ideologyId === e.ideologyEvidenced,
    {
      message:
        'ideologyEvidencedAssignment.ideologyId debe coincidir con ideologyEvidenced (string legacy)',
      path: ['ideologyEvidencedAssignment'],
    },
  );

// ─── API types ───────────────────────────────────────────────────────────────

export const entitySummarySchema = z.object({
  id: slugSchema,
  country: countrySchema,
  type: entityTypeSchema,
  displayName: z.string(),
  photoUrl: urlSchema.optional(),
  party: slugSchema.nullish(),
  periods: z.array(periodSchema),
  compassSelfPerceived: z.object({ x: scoreSchema, y: scoreSchema }),
  compassEvidenced: z.object({
    x: scoreSchema,
    y: scoreSchema,
    confidence: confidenceSchema,
  }),
  ideologySelf: slugSchema.optional(),
  ideologyEvidenced: slugSchema.optional(),
  delta: z.number().min(0),
  incoherenceCount: z.number().int().nonnegative(),
});

export const filterParamsSchema = z.object({
  country: countrySchema.optional(),
  type: z.union([entityTypeSchema, z.array(entityTypeSchema)]).optional(),
  period: z
    .string()
    .regex(/^\d{4}-\d{4}$/, 'Formato: YYYY-YYYY')
    .optional(),
  party: slugSchema.nullish(),
  confidence: confidenceSchema.optional(),
});

// ─── Tipos inferidos (fuente de verdad de los tipos) ─────────────────────────
// Los tipos del dominio se DERIVAN de los schemas con z.infer, de modo que el
// schema (validación runtime) y el tipo (TypeScript) nunca puedan divergir.
// `packages/schema/src/types.ts` los reexporta como API pública del paquete.

export type EntityType = z.infer<typeof entityTypeSchema>;
export type IncoherenceCategory = z.infer<typeof incoherenceCategorySchema>;
export type Severity = z.infer<typeof severitySchema>;
export type Confidence = z.infer<typeof confidenceSchema>;
export type Quadrant = z.infer<typeof quadrantSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Period = z.infer<typeof periodSchema>;
export type DimensionScores = z.infer<typeof dimensionScoresSchema>;
export type CompassPosition = z.infer<typeof compassPositionSchema>;
export type EvidencedCompassPosition = z.infer<typeof evidencedCompassPositionSchema>;
export type IncoherenceStatement = z.infer<typeof incoherenceStatementSchema>;
export type Incoherence = z.infer<typeof incoherenceSchema>;
export type VpFormula = z.infer<typeof vpFormulaSchema>;
export type IdeologyAssignment = z.infer<typeof ideologyAssignmentSchema>;
export type Entity = z.infer<typeof entitySchema>;
export type Party = z.infer<typeof partySchema>;
export type ExternalLink = z.infer<typeof externalLinkSchema>;
export type Ideology = z.infer<typeof ideologySchema>;
export type EntitySummary = z.infer<typeof entitySummarySchema>;
export type FilterParams = z.infer<typeof filterParamsSchema>;

// ─── Helpers inferidos (tipos de entrada antes de defaults/transforms) ───────

export type EntityInput = z.input<typeof entitySchema>;
export type PartyInput = z.input<typeof partySchema>;
export type IdeologyInput = z.input<typeof ideologySchema>;

/**
 * Safe parsers útiles para build-time que arrojan errores legibles.
 * Astro `lib/data.ts` los usa para fallar el build si algún JSON es inválido.
 */
export function parseEntityOrThrow(raw: unknown, pathHint = '<entity>') {
  const result = entitySchema.safeParse(raw);
  if (!result.success) {
    const msg = result.error.issues
      .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Entidad inválida en ${pathHint}:\n${msg}`);
  }
  return result.data;
}

export function parsePartyOrThrow(raw: unknown, pathHint = '<party>') {
  const result = partySchema.safeParse(raw);
  if (!result.success) {
    const msg = result.error.issues
      .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Partido inválido en ${pathHint}:\n${msg}`);
  }
  return result.data;
}

export function parseIdeologyOrThrow(raw: unknown, pathHint = '<ideology>') {
  const result = ideologySchema.safeParse(raw);
  if (!result.success) {
    const msg = result.error.issues
      .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Ideología inválida en ${pathHint}:\n${msg}`);
  }
  return result.data;
}
