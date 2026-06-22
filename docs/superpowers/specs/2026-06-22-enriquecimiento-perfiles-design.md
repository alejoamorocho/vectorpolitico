# Enriquecimiento total de perfiles + fuentes visibles

- **Fecha:** 2026-06-22
- **Estado:** aprobado, en ejecución
- **Alcance:** las 268 entidades (135 ideologías, 23 partidos, 110 políticos)

## Objetivo

Nutrir por completo los perfiles de políticos, partidos y corrientes políticas
con contenido investigado y neutral, y hacer **visibles las fuentes** ("para saber
más") en todas las páginas de detalle.

## Decisiones de alcance (acordadas con el usuario)

1. **Cero cambios de schema.** Solo se llenan campos que ya existen en `zod.ts`.
2. **Investigación real** por entidad (web), tono neutral idéntico al actual, sin
   inventar hechos ni fuentes.
3. **Directo a las 268**, sin gate de revisión de piloto, pero con **verificación
   adversarial** integrada por entidad.
4. **Commits incrementales por tipo**: ideologías → partidos → políticos.
5. "Saber más" en políticos/partidos = sección de **fuentes agregadas y
   deduplicadas** a partir de los `sources` existentes (no se crea campo nuevo).
   En ideologías = `externalLinks` (ya renderizado como "Lecturas sugeridas").

## Campos a llenar (solo existentes en el schema)

### Ideologías (135) — `ideologies.json`
`longDescription`, `historicalContext`, `contemporaryRelevance`,
`commonCriticisms`, `keyThinkers[]`, `historicalExamples[]`,
`relatedIdeologies[]` (slugs válidos existentes), `wikipediaUrl`,
`externalLinks[]` ({title, url, outlet?}).
**Preservar intactos:** `id`, `name`, `nameEn`, `x`, `y`, `width`, `height`,
`quadrant`, `color`.

### Partidos (23) — `colombia/parties.json`
`description` (más completa), `compassPosition.justification` + `.sources[]`,
`sources[]` (CNE, Registraduría, prensa seria, sitio oficial).
**Preservar:** `id`, `country`, `name`, `fullName`, `color`, `compassPosition.{x,y,confidence}`,
`ideologies`, `foundedYear`, `websiteUrl`, incoherencias existentes.

### Políticos (110) — `colombia/{presidents,vice-presidents,senators,representatives,candidates,vp-candidates,governors,mayors}.json`
`bio` (más completa, factual, neutral), `compassSelfPerceived.{justification,sources}`,
`compassEvidenced.{justification,sources}`,
`ideologySelfAssignment` / `ideologyEvidencedAssignment` donde falten (con ≥1 fuente
y `ideologyId` que coincida con el string legacy si existe),
`sources`/`archived` de incoherencias completos.
**Preservar:** posiciones (`x`,`y`), `dimensionScores`, `confidence`, `periods`,
`type`, `party`, identificadores.

## Cambios de UI (para que las fuentes se vean)

Hoy las fuentes de políticos y partidos no se renderizan en ninguna página.

- **`figuras/[slug].astro`**: nueva sección "Fuentes" que agrega y deduplica (por
  URL) todos los `sources` del entity (compass autopercibido, evidenciado,
  asignaciones ideológicas, incoherencias). Cada item: título/outlet, fecha, enlace.
- **`partidos/[slug].astro`**: sección "Fuentes" desde `sources[]`, enlace a
  `websiteUrl`, y render de incoherencias del partido (hoy invisibles).
- **`ideologias/[slug].astro`**: bloques nuevos para `contemporaryRelevance`
  ("Relevancia contemporánea") y `commonCriticisms` ("Críticas comunes").
- **`packages/schema/src/types.ts`**: sincronizar con `zod.ts` (agregar
  `contemporaryRelevance` y `commonCriticisms` a `Ideology`). Sin cambio de comportamiento.

## Arquitectura de ejecución

Separar **investigar** (paralelo, seguro) de **escribir el archivo** (determinista).

- **Fase 1 — UI** (main loop, directo): secciones de fuentes + bloques nuevos + sync types.
- **Fase 2 — Investigación** (Workflow, fan-out): un agente por entidad investiga en
  la web y **escribe su resultado a un archivo individual**
  `scripts/enrich/out/<tipo>/<id>.json` (parallel-safe: cada agente, su archivo).
  Recibe los datos actuales de la entidad por `args` para preservar lo correcto y
  expandir.
- **Fase 3 — Verificación adversarial** (Workflow): segundo agente por entidad lee el
  archivo producido y refuta: ¿fuentes reales y accesibles? ¿tono neutral? ¿slugs de
  `relatedIdeologies`/`ideologyId` válidos? ¿algún dato sin respaldo? Corrige o marca.
- **Fase 4 — Merge determinista** (main loop, script Node): mezcla los campos
  enriquecidos sobre los JSON originales **preservando** los campos protegidos,
  pone `lastUpdated: "2026-06-22"`, agrega contributor, valida con los parsers Zod
  del proyecto, y **commit por tipo**.

Orden: 3 corridas de Workflow secuenciales (ideologías, partidos, políticos),
validando y commiteando entre cada una.

## Verificación / criterios de aceptación

- `pnpm` build / validación Zod del proyecto pasa para los tres archivos por tipo.
- Cada `externalLinks`/`sources` apunta a una URL real (verificada por el agente).
- Tono neutral, en español correcto con tildes.
- `relatedIdeologies` e `ideologyId` referencian slugs existentes.
- Las secciones de fuentes aparecen renderizadas en figura/partido (revisión visual).

## Riesgos y mitigaciones

- **URLs alucinadas** → agentes deben verificar cada URL (WebFetch/WebSearch) antes
  de incluirla; verificador adversarial revisa una muestra.
- **Sobrescritura de contenido bueno** → el merge solo toca campos objetivo y
  preserva la lista de campos protegidos; los agentes reciben el dato actual y
  expanden en vez de reemplazar a ciegas.
- **Conflictos de escritura** → ningún agente escribe el JSON final; cada uno escribe
  su archivo individual; el merge serial los consolida.
