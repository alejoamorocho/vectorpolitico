---
title: Historial de cambios de la metodología
description: Registro de versiones de cada documento de la metodología — qué cambió, cuándo, y por qué. La metodología es viva — esta página deja constancia de su evolución.
order: 90
section: meta
version: 1.1.0
lastUpdated: 2026-06-22
authors:
  - ssi-co
---

## Por qué un changelog

La metodología del proyecto es viva. A medida que se descubren mejores formas de modelar la política colombiana, los documentos se actualizan. Este historial responde dos preguntas que cualquier usuario o contribuidor puede tener:

- **¿Cuándo cambió esto?** — para saber qué versión del análisis es la que ves en el sitio hoy.
- **¿Por qué cambió?** — para que ninguna decisión metodológica parezca arbitraria.

Cada documento tiene su propio bloque de versiones al final; esta página es el **índice consolidado**.

## 2026-06-22 — Enriquecimiento total de perfiles y fuentes visibles

Las 268 entidades del dataset (135 ideologías, 23 partidos, 110 políticos) quedan con su contenido completo y con fuentes a la vista. Hasta ahora muchos campos existían en el schema pero estaban vacíos, y las fuentes de figuras y partidos no se mostraban en ningún lado.

### Datos enriquecidos

- **Ideologías (135/135):** se llenan los campos que estaban vacíos — `longDescription`, `historicalContext`, `contemporaryRelevance`, `commonCriticisms`, `relatedIdeologies`, `wikipediaUrl` y `externalLinks` — con contenido investigado y fuentes verificadas.
- **Partidos (23/23):** descripción y justificación del compass ampliadas; `sources[]` curadas y verificadas (CNE, Registraduría, prensa de referencia, sitio oficial).
- **Políticos (110/110):** biografía expandida (de ~395 a ~1.394 caracteres en promedio) y fuentes verificadas añadidas a `compassEvidenced.sources`.

### Cambios de UI

- **Figuras** (`/figuras/<id>`): nueva sección **"Fuentes"** que agrega y deduplica todas las referencias del perfil (compass, asignaciones ideológicas, incoherencias).
- **Partidos** (`/partidos/<id>`): sección **"Fuentes"**, enlace al sitio oficial y render de incoherencias documentadas (antes invisibles).
- **Ideologías** (`/ideologias/<id>`): bloques **"Relevancia contemporánea"** y **"Críticas comunes"**, además de "Lecturas sugeridas".

### Schema y pipeline

- Se agregaron a `Ideology` los campos `contemporaryRelevance` y `commonCriticisms` (`types.ts` sincronizado con Zod).
- El enriquecimiento usó un pipeline de **investigación + verificación adversarial** por entidad (un agente investiga y verifica cada URL; un segundo agente refuta), con merge determinista y validación Zod (268/268).
- Se aclara que `ideologies.json` es la **fuente de verdad**; `generate:ideologies` ahora **preserva** el contenido editorial al recalcular el layout.

### Documentos afectados

- [Cómo funciona el mapa](/metodologia/how-it-works) → v3.1.0 (sección "Fuentes" en páginas de detalle, fuente de verdad).
- [Fuentes de datos](/metodologia/data-sources) → v1.3.0 (conteos y campos completos por tipo).
- [Estándar de redacción de ideologías](/metodologia/ideology-enrichment) → v1.1.0 (campos completos, pipeline de enriquecimiento).
- [Cómo agregar una figura política](/metodologia/add-politician) → v1.2.0 (assignments y fuentes obligatorias).
- [Enriquecimiento de perfiles](/metodologia/data-enrichment) → v1.0.0 (NUEVO).

---

## 2026-04-23 (tarde) — Giro al universo ideológico completo

Recalibración importante del propósito del proyecto. El filtro por país introducido por la mañana ([ADR-002](/metodologia/adr-002-grid-por-pais)) eliminaba la diversidad ideológica que el proyecto busca enseñar — distributismo, mutualismo, comunismo chino y otras 80+ corrientes quedaban invisibles. Tras revisión del propósito educativo, **se decide mostrar el universo completo de 135 corrientes** y anclar cada actor al centroide de su ideología declarada.

### Cambios

- Grid de 46 → **135 celdas** visibles. El YAML mantiene `applicable_to_country.co` como metadata informativa, no como filtro.
- Las coordenadas de partidos y figuras ahora se anclan al **centroide de la ideología declarada**:
  - Partidos → `ideologies[0]` (ideología principal)
  - Figuras → `ideologySelf` para self, `ideologyEvidenced` para evidenced.
- Los `dimensionScores` se conservan como evidencia auditable pero ya no determinan la coord visual.
- Verificación: 23/23 partidos y 220/220 puntos de figuras caen en su celda declarada.

### Documentos afectados

- [Cómo funciona el mapa](/metodologia/how-it-works) → v3.0.0 (universo completo, listas extensas por cuadrante).
- [Cómo asignamos ideología a cada figura](/metodologia/ideology-classification) → v2.1.0 (sección "Universo ideológico completo").
- [ADR-003 — Grid completo educativo](/metodologia/adr-003-grid-completo-educativo) → v1.0.0 (NUEVO, supersede ADR-002).
- [ADR-002 — Grid curado por país](/metodologia/adr-002-grid-por-pais) → marcado como **Superseded**.

---

## 2026-04-23 (mañana) — Auditoría de ideologías y mejoras del compass

Hito grande del proyecto. Se cerraron seis fases de trabajo que llevaron el dataset a coherencia interna y se introdujeron herramientas de validación. Las adiciones al catálogo (3 ideologías nuevas, subdivisión de authoritarian-capitalism, movimientos de cuadrante) se conservan en la versión actual.

### Cambios en el grid de ideologías

- **Filtro por país.** El catálogo global tenía ~131 ideologías de la referencia *Political Compass* (Sionismo, Juche, Kuomintangismo, Maoísmo, Fordismo). El generador ahora filtra por `applicable_to_country.co` y produce un grid de ~46 celdas con referente real en Colombia.
- **Tres ideologías agregadas** que faltaban en el catálogo global pero son centrales en Colombia:
  - **Teología de la Liberación** (auth_left) — Camilo Torres, Golconda, Comunidades Eclesiales de Base.
  - **Comunalismo Indígena** (lib_left) — CRIC, ONIC, resguardos, Minga.
  - **Populismo de Derecha** (auth_right) — Liga de Gobernantes (Rodolfo Hernández) y sectores del uribismo de base.
- **Subdivisión de Capitalismo Autoritario** (auth_right inferior) en cuatro sub-celdas: *Clientelismo/Cacicazgo* (Casa Char), *Desarrollismo* (Vargas Lleras), *Derecha Securitaria* (Pinzón) y *Capitalismo Autoritario* (referencia teórica reducida).
- **Movimientos de cuadrante.** *Democracia Cristiana* pasó de auth_left a auth_right (los partidos cristianos colombianos son socio-conservadores, no socialistas-cristianos europeos). *Tecnocracia* pasó de auth_left a lib_right (Fajardo, Galán son centro técnico, no estatistas).

### Cambios en la asignación de figuras y partidos

- 23 partidos colombianos recalibrados con coordenadas auditadas contra fuentes primarias.
- 110 políticos con `dimensionScores` reanalizados por agentes IA dimensión por dimensión, con justificación dimensional para cada uno.
- Se introdujo el [validador de coherencia automática](/metodologia/data-validation) entre coordenada y `dimensionScores`, que ahora corre como red de seguridad permanente.

### Bug histórico documentado

El clasificador automático (Claude API) en su versión inicial asignaba ocasionalmente coordenadas extremas (`x = ±9`) a figuras cuyos `dimensionScores` eran moderados. Esto producía partidos colombianos visualmente sobre celdas como *Sionismo* o *Kuomintangismo* sin que el array de ideologías declaradas dijera nada parecido. El bug se corrigió en dos pasadas: primero matemática (ajuste de scores a coord), después semántica (4 agentes IA recalcularon los scores con análisis fino dimensión por dimensión).

El validador detecta el patrón y lo emite como warning para que no vuelva a ocurrir silenciosamente.

### Documentos actualizados

- [Cómo funciona el mapa](/metodologia/how-it-works) → v2.0.0 (grid curado, proceso clasificación + auditoría + validación).
- [Cómo posicionamos figuras en el compass](/metodologia/compass-scoring) → v1.3.0 (validador automático).
- [Cómo asignamos ideología a cada figura](/metodologia/ideology-classification) → v2.0.0 (grid por país, ideologías agregadas, movimientos de cuadrante, validador).
- [Validación del dataset](/metodologia/data-validation) → v1.0.0 (NUEVO).

---

## 2026-04-15 — Trazabilidad por asignación

Cada asignación de ideología pasa a tener su propia justificación + lista de fuentes. Sin fuentes no hay asignación; el schema lo valida.

- [Cómo asignamos ideología a cada figura](/metodologia/ideology-classification) → v1.0.0 → v1.1.0 (sin límite de distancia self↔evidenced).
- [Cómo posicionamos figuras en el compass](/metodologia/compass-scoring) → v1.2.0 (asignación de label se separa del cálculo de coordenadas).
- [Cómo agregar una figura política](/metodologia/add-politician) → v1.1.0.
- [Fuentes de datos](/metodologia/data-sources) → v1.2.0.

## 2026-04-12 — Distinción autopercibida vs evidenciada

Clarificación de fuentes:
- **Posición autopercibida** se construye exclusivamente desde fuentes propias del actor (sitio oficial, Wikipedia, plataforma de campaña).
- **Posición evidenciada** es análisis propio del proyecto sobre acciones documentadas (votaciones, decretos, ejecución presupuestal). No se copian etiquetas de medios.

- [Cómo posicionamos figuras en el compass](/metodologia/compass-scoring) → v1.0.0 → v1.1.0.

## 2026-04-11 — Apertura del proyecto

Primer release público de la metodología y del dataset.

- [Cómo funciona el mapa](/metodologia/how-it-works) → v1.0.0.

## 2026-04-10 — Versión inicial de los documentos base

- [Cómo posicionamos figuras en el compass](/metodologia/compass-scoring) → v1.0.0.
- [Estándar de incoherencias](/metodologia/incoherence-standard) → v1.0.0.
- [Cómo agregar un nuevo país](/metodologia/add-country) → v1.0.0.
- [Cómo agregar una figura política](/metodologia/add-politician) → v1.0.0.
- [Fuentes de datos](/metodologia/data-sources) → v1.0.0.
