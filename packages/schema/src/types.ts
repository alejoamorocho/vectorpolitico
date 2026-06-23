/**
 * Brújula Política — Schema de tipos TypeScript
 * Versión: 1.0.0
 *
 * Este archivo es la fuente de verdad para la estructura de todos los datos.
 * Cualquier cambio aquí debe ser versionado y documentado en /docs/methodology/
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type EntityType =
  | "president"
  | "vice_president"
  | "presidential_candidate"
  | "vp_candidate"
  | "senator"
  | "representative"
  | "governor"
  | "mayor";

export type IncoherenceCategory =
  | "economia"
  | "seguridad"
  | "derechos_humanos"
  | "medio_ambiente"
  | "corrupcion"
  | "relaciones_exteriores"
  | "educacion"
  | "salud";

export type Severity = "low" | "medium" | "high";

export type Confidence = "low" | "medium" | "high";

export type Country = "co" | "ve" | "mx" | "cl" | "ar" | "pe" | "ec" | string;

// ─── Bloques base ─────────────────────────────────────────────────────────────

export type Source = {
  url: string;
  title?: string;
  outlet: string;           // nombre del medio o institución
  date: string;             // ISO: YYYY-MM-DD
  archived?: string;        // URL de Wayback Machine — obligatorio para incoherencias
};

export type Period = {
  role: EntityType;
  startDate: string;        // ISO: YYYY-MM-DD
  endDate?: string;         // undefined si sigue en ejercicio
  region?: string;          // para alcaldes y gobernadores: nombre del municipio/dpto
  electedWith?: number;     // porcentaje de votos con que fue elegido
};

// ─── El compass ───────────────────────────────────────────────────────────────

/**
 * Scores individuales por dimensión.
 * Cada dimensión va de -10 a +10.
 * Ver /docs/methodology/compass-scoring.md para criterios exactos.
 */
export type DimensionScores = {
  // Eje X — Económico
  fiscalPolicy: number;       // política fiscal: gasto, impuestos, deuda
  marketPosition: number;     // posición frente al mercado y empresa privada
  socialPolicy: number;       // subsidios, universalismo vs focalización
  tradePolicy: number;        // comercio exterior, TLCs, inversión extranjera

  // Eje Y — Social
  civilRights: number;        // derechos civiles y libertades individuales
  securityApproach: number;   // posición frente a fuerzas de seguridad
  socialRights: number;       // derechos reproductivos, diversidad, derechos sociales
  powerConcentration: number; // concentración de poder, institucionalidad, controles
};

export type CompassPosition = {
  x: number;                  // eje económico: -10 (izquierda) a +10 (derecha)
  y: number;                  // eje social: -10 (libertario) a +10 (autoritario)
  justification?: string;     // explicación detallada, dimensión por dimensión
  sources?: Source[];
  /** Solo partidos: la confianza de la asignación sin dimensionScores.
   *  Entidades individuales deben usar EvidencedCompassPosition. */
  confidence?: Confidence;
};

export type EvidencedCompassPosition = CompassPosition & {
  confidence: Confidence;
  dimensionScores: DimensionScores;
  // Radio de la elipse de incertidumbre (calculado automáticamente desde confidence)
  // high → ~0.5, medium → ~1.5, low → ~3.0
};

// ─── Incoherencias ────────────────────────────────────────────────────────────

export type IncoherenceStatement = {
  text: string;               // descripción precisa del hecho (promesa o acción)
  source: Source;             // fuente primaria — archived es OBLIGATORIO aquí
};

export type Incoherence = {
  id: string;                 // formato: entity-id-tema-año
  category: IncoherenceCategory;
  severity: Severity;
  verified: boolean;          // true solo si fue revisado por un colaborador distinto
  verifiedBy?: string;        // github username del revisor
  proposal: IncoherenceStatement;
  action: IncoherenceStatement;
  nuances?: string;           // contexto adicional — no relativiza, solo informa
  addedBy: string;            // github username del que lo agregó
  addedAt: string;            // ISO: YYYY-MM-DD
};

// ─── Fórmula vicepresidencial ─────────────────────────────────────────────────

export type VpFormula = {
  fullName: string;           // nombre completo de la fórmula vicepresidencial
  shortName?: string;         // nombre corto / como se le conoce
  bio?: string;               // breve biografía
};

// ─── Asignación de ideología (con justificación + fuentes) ───────────────────

/**
 * Documenta POR QUÉ una persona recibe una ideología concreta.
 * Cada asignación debe tener al menos 1 fuente verificable.
 * La justificación debe explicar la relación entre las acciones/declaraciones
 * del político y la ideología asignada — incluyendo, cuando haya distancia
 * geométrica > 6 entre la posición del político y el centro de la ideología,
 * la razón explícita (auto-identificación documentada, contexto histórico,
 * evolución política documentada, etc.).
 */
export type IdeologyAssignment = {
  ideologyId: string;         // id en ideologies.json
  justification: string;      // por qué esta ideología encaja
  sources: Source[];          // al menos 1 fuente
};

// ─── Entidad política principal ───────────────────────────────────────────────

export type Entity = {
  // Identificación
  id: string;                 // slug único: nombre-apellido-apellido
  country: Country;           // código ISO del país
  type: EntityType;           // cargo principal o más reciente
  fullName: string;           // nombre oficial completo
  displayName: string;        // como se le conoce popularmente
  photoUrl?: string;          // URL de R2

  // Relaciones
  party?: string | null;      // id del partido en parties.json
  vpFormula?: VpFormula;      // fórmula vicepresidencial (solo para presidential_candidate)
  periods: Period[];          // todos los cargos ejercidos, cronológico

  // El compass — NÚCLEO DEL PROYECTO
  compassSelfPerceived: CompassPosition;     // 🔵 lo que dice ser
  compassEvidenced: EvidencedCompassPosition; // 🔴 lo que hacen sus acciones

  // Clasificación ideológica
  ideologies: string[];       // tags: ["populismo-izquierda", "socialismo-democratico"]
  ideologySelf?: string;      // id de la ideología auto-percibida (ideologies.json) [legacy — usar ideologySelfAssignment]
  ideologyEvidenced?: string; // id de la ideología evidenciada por acciones [legacy — usar ideologyEvidencedAssignment]
  // Nuevos campos con trazabilidad (metodología v2): si están presentes, su ideologyId
  // debe coincidir con el string legacy correspondiente. Incluyen justificación y fuentes.
  ideologySelfAssignment?: IdeologyAssignment;
  ideologyEvidencedAssignment?: IdeologyAssignment;

  // Contenido
  bio: string;                // párrafo biográfico neutral — hechos, no juicios
  incoherences: Incoherence[];

  // Meta
  lastUpdated: string;        // ISO: YYYY-MM-DD
  contributors: string[];     // github usernames de quienes aportaron datos
};

// ─── Partido político ─────────────────────────────────────────────────────────

export type Party = {
  id: string;                 // slug: centro-democratico
  country: Country;
  name: string;               // nombre corto
  fullName: string;           // nombre oficial completo
  color: string;              // hex color para el compass
  logoUrl?: string;           // URL de R2
  websiteUrl?: string;        // sitio oficial del partido
  foundedYear?: number;
  dissolvedYear?: number;     // si ya no existe
  description: string;        // descripción neutral
  ideologies: string[];       // tags ideológicos del partido
  compassPosition?: CompassPosition; // posición del partido como organización
  sources?: Source[];         // fuentes externas verificables (CNE, Registraduría, análisis)
  incoherences?: Incoherence[]; // incoherencias a nivel de partido
  lastUpdated: string;
  contributors: string[];
};

// ─── Ideología (las ~150 celdas del compass) ──────────────────────────────────

export type ExternalLink = {
  title: string;
  url: string;
  outlet?: string;
};

export type Ideology = {
  id: string;                 // slug: socialismo-democratico
  name: string;               // nombre en español
  nameEn?: string;            // nombre en inglés (para referencia)
  x: number;                  // centro de la celda en eje X
  y: number;                  // centro de la celda en eje Y
  width: number;              // ancho de la celda en el compass
  height: number;             // alto de la celda en el compass
  quadrant: "auth_left" | "auth_right" | "lib_left" | "lib_right";
  color: string;              // hex — rojo=auth_left, azul=auth_right, verde=lib_left, amarillo=lib_right
  description: string;        // explicación educativa breve (máx. 300 palabras)
  longDescription?: string;   // explicación extendida para vista de detalle (markdown)
  historicalContext?: string; // origen histórico y evolución
  contemporaryRelevance?: string; // relevancia actual de la corriente
  commonCriticisms?: string;  // principales críticas desde distintos puntos del espectro
  keyThinkers?: string[];     // pensadores clave asociados
  historicalExamples?: string[]; // ejemplos históricos de aplicación
  relatedIdeologies?: string[]; // slugs de ideologías relacionadas
  wikipediaUrl?: string;      // URL a Wikipedia (en español si existe)
  externalLinks?: ExternalLink[]; // referencias académicas / lecturas sugeridas
};

// ─── Tipos de respuesta de la API ─────────────────────────────────────────────

export type EntitySummary = Pick<
  Entity,
  "id" | "country" | "type" | "displayName" | "photoUrl" | "party" | "periods"
> & {
  compassSelfPerceived: { x: number; y: number };
  compassEvidenced: { x: number; y: number; confidence: Confidence };
  ideologySelf?: string;
  ideologyEvidenced?: string;
  delta: number; // distancia euclidiana entre las dos posiciones
  incoherenceCount: number;
};

export type FilterParams = {
  country?: Country;
  type?: EntityType | EntityType[];
  period?: string;            // "2022-2026" — filtra por figuras activas en ese período
  party?: string;
  confidence?: Confidence;
};
