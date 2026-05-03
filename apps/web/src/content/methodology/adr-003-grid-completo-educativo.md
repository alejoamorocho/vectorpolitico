---
title: ADR-003 — Grid ideológico completo + actores anclados a su ideología
description: Decisión de mostrar las 135 corrientes ideológicas globales sin filtrar por país y anclar cada partido y figura al centroide exacto de su ideología declarada. Supersede ADR-002.
order: 82
section: adr
version: 1.0.0
lastUpdated: 2026-04-23
authors:
  - ssi-co
relatedDocs:
  - ideology-classification
  - how-it-works
  - adr-002-grid-por-pais
---

> **Estado:** Aceptado · **Fecha:** 2026-04-23 (tarde) · **Supersede:** [ADR-002](/metodologia/adr-002-grid-por-pais)

## Contexto

[ADR-002](/metodologia/adr-002-grid-por-pais) decidió filtrar el catálogo global de ~131 ideologías a las ~46 aplicables al contexto colombiano para evitar que partidos cayeran sobre celdas absurdas (Sionismo, Kuomintangismo, Teocracia hindú). Tras revisión del propósito del proyecto, esa decisión resultó **demasiado agresiva** para los objetivos educativos.

El proyecto busca **mostrarle a la gente la enorme variedad de ideologías políticas que existen en el mundo** — no solo las que tienen partido vigente en Colombia. Filtrar a 46 ocultaba precisamente la riqueza del espectro que el proyecto quiere enseñar:

- **Distributismo** (corriente católica social) — sin partido en Colombia, pero relevante teóricamente.
- **Mutualismo** (Proudhon) — sin actor formal local pero parte del repertorio anarquista global.
- **Maoísmo, Dengismo** (comunismo chino) — referencias internacionales que ningún partido colombiano sigue pero que son clave para entender el espectro auth-left global.
- **Sionismo, Juche, Kuomintangismo** — etiquetas de contextos nacionales específicos pero útiles como referencia comparativa.

El usuario expresó explícitamente que el proyecto debe mostrar esa diversidad aunque ningún político la siga, y que los actores colombianos pueden ubicarse "cerca" o "dentro" de cualquiera de estas ideologías globales.

## Decisión

**Restaurar el grid completo a 135 celdas** y cambiar el modelo de posicionamiento de actores.

### Grid

- El generador (`packages/etl/src/generate_ideologies.py`) corre **sin** `--country=co` por defecto, produciendo el grid global completo de 135 celdas.
- La flag `--country=co` se conserva como modo opcional pero **no se usa en la generación de producción**.
- El bloque `applicable_to_country.co` del YAML pasa de "filtro obligatorio" a **"metadata informativa"**: documenta qué corrientes tienen actor real en Colombia hoy, útil para análisis textual o listas internas, pero no afecta la visualización.

### Posicionamiento de actores

- **Partidos**: `compassPosition.{x, y}` se asigna al centroide exacto de la ideología principal `ideologies[0]`. Esto garantiza que el partido caiga visualmente en SU celda declarada.
- **Figuras políticas**:
  - `compassSelfPerceived.{x, y}` se asigna al centroide de `ideologySelf`.
  - `compassEvidenced.{x, y}` se asigna al centroide de `ideologyEvidenced`.
  - La flecha que une los dos puntos sigue siendo el índice de coherencia.
- Los `dimensionScores` (8 dimensiones evaluadas con justificación textual) **se conservan en el JSON** como evidencia auditable del análisis dimensional, pero ya no determinan la coordenada visual. El proyecto desacopla análisis dimensional fino (datos) de rendering simbólico (mapa).

## Consecuencias

**Positivas**

- El usuario ve **toda la variedad ideológica del mundo** al recorrer el mapa — el propósito educativo del proyecto se cumple.
- Cada actor cae en una celda **legible y coherente** con su ideología declarada (no en celdas absurdas ni entre celdas).
- 23/23 partidos y 220/220 puntos de figuras pasan validación: cada coord cae en la celda de su ideología declarada.
- El framework sigue siendo replicable a otros países: cada país añade su `applicable_to_country.<código>` para análisis local sin cambiar la visualización.
- Los `dimensionScores` siguen siendo auditables y permiten futuras visualizaciones (radar charts por figura, comparaciones dimensión por dimensión).

**Negativas**

- Se pierde el detalle dimensional fino en la coord visual: dos actores con la misma ideología caen exactamente en el mismo punto del centroide, aunque sus scores dimensionales sean distintos. Mitigación: los `dimensionScores` están disponibles como datos para vistas alternativas.
- El mapa muestra 135 celdas en cada cuadrante — más denso visualmente. Mitigación: smart labels zoom-aware (Astro decide qué celda muestra label completo, truncado o solo color según zoom).
- Algunas figuras pueden tener `ideologyEvidenced` que no refleja perfectamente cada dimensión específica de su comportamiento — el ancla simbólica suaviza diferencias finas.

## Alternativas consideradas

- **Mantener filtro por país (ADR-002)**. Rechazada por sacrificar el propósito educativo.
- **Grid completo + coord = promedio de centroides de todas las ideologías declaradas**. Rechazada porque el promedio puede caer en celdas absurdas que no son ninguna de las declaradas (ej. promedio de [christian-democracy, traditionalist, social-gospel] cae en `constitutional-monarchism` en el grid actual).
- **Grid completo + coord = promedio ponderado de dimensionScores (modelo previo)**. Rechazada porque produce el bug histórico de figuras cayendo en celdas absurdas alrededor de su posición numérica (Centro Democrático → Sionismo).
- **Grid completo + coord = ideología principal del array (decisión actual)**. Aceptada por simplicidad, claridad visual y coherencia con la metodología.

## Referencias

- Implementación: commits del 2026-04-23 (tarde).
- Doc relacionada: [Cómo asignamos ideología](/metodologia/ideology-classification) v2.1.0.
- Doc relacionada: [Cómo funciona el mapa](/metodologia/how-it-works) v3.0.0.
- Supersede: [ADR-002](/metodologia/adr-002-grid-por-pais).
- Script de aplicación: `scripts/reposition_actors_full_grid.py`.
