---
title: Enriquecimiento de perfiles y fuentes
description: Cómo se nutrieron los perfiles de ideologías, partidos y figuras con contenido investigado y fuentes verificadas, y cómo se muestran esas fuentes en el sitio.
order: 36
section: data
version: 1.0.0
lastUpdated: 2026-06-22
authors:
  - ssi-co
relatedDocs:
  - data-sources
  - ideology-enrichment
  - ideology-classification
---

## Qué se enriqueció

En junio de 2026 se completó el contenido de las **268 entidades** del dataset y se hicieron visibles sus fuentes:

- **135 ideologías** — se llenaron los campos que estaban vacíos: `longDescription`, `historicalContext`, `contemporaryRelevance`, `commonCriticisms`, `relatedIdeologies`, `wikipediaUrl` y `externalLinks`.
- **23 partidos** — descripción y justificación del compass ampliadas; `sources[]` curadas y verificadas.
- **110 figuras** — biografía expandida (de ~395 a ~1.394 caracteres en promedio) y fuentes verificadas añadidas a `compassEvidenced.sources`.

El objetivo: que cada perfil esté completo y que **toda afirmación sea rastreable** hasta una fuente real.

## Principios

- **Nada inventado.** Solo hechos verificables. Si un dato es dudoso o no puede respaldarse, se redacta de forma conservadora o se omite.
- **Tono neutral.** Descripción y crítica van separadas. Sin adjetivos cargados ni propaganda. Las críticas se atribuyen a sus fuentes ("los críticos sostienen…").
- **Fuentes reales y verificadas.** Cada URL se comprueba (debe responder) antes de incluirse, con medio (`outlet`) y fecha (`date`).
- **Sin tocar el análisis.** El enriquecimiento amplió contenido y fuentes; **no** alteró las coordenadas del compass, los `dimensionScores` ni las asignaciones ideológicas, que tienen su propia metodología.

## El pipeline

El enriquecimiento masivo siguió un proceso reproducible de **investigación + verificación adversarial**, una entidad por agente:

1. **Investigación.** Un agente recibe el dato actual de la entidad, investiga en la web y produce el contenido en español neutral, verificando cada URL.
2. **Salida aislada.** Cada agente escribe su resultado en un archivo individual (`scripts/enrich/out/<tipo>/<id>.json`), lo que evita conflictos de escritura en paralelo.
3. **Verificación adversarial.** Un segundo agente, independiente, revisa con escepticismo cada perfil: ¿fuentes reales y accesibles?, ¿tono neutral?, ¿referencias (slugs) válidas?, ¿algún dato sin respaldo? Corrige lo necesario. En esta fase se detectaron y arreglaron URLs duplicadas o muertas, cifras no confirmadas y errores factuales del dato original.
4. **Merge determinista.** Un script (`scripts/enrich/merge-*.cjs`) fusiona el contenido sobre los JSON preservando los campos protegidos (posiciones, scores, identificadores).
5. **Validación.** `scripts/enrich/validate.cjs` valida las 268 entidades contra réplicas fieles de los schemas Zod del proyecto antes del commit.

Las herramientas viven en `scripts/enrich/` y son reutilizables para futuras entidades.

## Cómo se muestran las fuentes

Antes de junio de 2026 las fuentes de figuras y partidos existían en los datos pero no se renderizaban. Ahora son visibles:

- **Figuras** (`/figuras/<id>`): sección **"Fuentes"** que agrega y **deduplica** todas las referencias citadas en el perfil — posiciones del compass autopercibido y evidenciado, asignaciones ideológicas e incoherencias — con medio, fecha y copia archivada cuando existe.
- **Partidos** (`/partidos/<id>`): sección **"Fuentes"** desde `sources[]`, enlace al sitio oficial e incoherencias documentadas.
- **Ideologías** (`/ideologias/<id>`): bloques **"Relevancia contemporánea"** y **"Críticas comunes"**, más **"Lecturas sugeridas"** (los `externalLinks` curados).

## Fuente de verdad

La fuente de verdad de los datos es el **JSON** (`packages/data/`). En el caso de las ideologías, el layout del grid se origina con un generador de treemap a partir de `ideologies.source.yaml`, pero el contenido editorial se mantiene directamente en `ideologies.json`. El generador `pnpm generate:ideologies` **preserva** ese contenido editorial al recalcular el layout, de modo que regenerar el mapa no borra el enriquecimiento.

## Reproducibilidad

Todo el dataset pasa la validación Zod en el build de Astro: si un JSON no cumple el schema, el build falla. Esto garantiza que el contenido publicado siempre cumple la estructura documentada en [Fuentes de datos](/metodologia/data-sources) y en [el estándar de redacción de ideologías](/metodologia/ideology-enrichment).
