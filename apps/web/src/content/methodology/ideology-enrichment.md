---
title: Estándar de redacción de ideologías
description: Cómo redactamos las descripciones, contexto histórico, pensadores clave, ejemplos y críticas de cada una de las 135 corrientes ideológicas del catálogo. Estándar editorial para mantener consistencia, neutralidad y rigor académico.
order: 35
section: data
version: 1.1.0
lastUpdated: 2026-06-22
authors:
  - ssi-co
relatedDocs:
  - data-sources
  - ideology-classification
---

## Por qué un estándar

Cada celda del compás es un panel editorial que el usuario abre al hacer click. Para que sea **educativo y confiable** la información debe ser:

- **Consistente** — todas las celdas tienen los mismos campos y la misma estructura, sin importar si son corrientes mayoritarias o exóticas teóricas.
- **Neutral** — describimos cada corriente en sus propios términos, sin caracterizaciones polémicas. La crítica va en su propia sección, separada de la descripción.
- **Auditable** — toda afirmación factual (fechas, libros, líderes históricos) debe poder verificarse con fuentes secundarias estándar (Wikipedia ES/EN, Stanford Encyclopedia of Philosophy, Britannica).
- **Útil al lector** — quien llega a la celda debe poder responder: "¿Qué es esto?", "¿De dónde viene?", "¿Quién lo defiende?", "¿Dónde se ha aplicado?", "¿Por qué importa hoy?", "¿Qué críticas recibe?".

## Fuente de verdad: `ideologies.json`

El catálogo vive en `packages/data/ideologies.json`, que es la **fuente de verdad**. El layout del grid (posiciones `x`, `y`, `width`, `height`) se originó con un generador de treemap a partir de `packages/data/ideologies.source.yaml` (`pnpm generate:ideologies`), pero las posiciones y el contenido editorial se afinaron después directamente en el JSON.

> **Importante para colaboradores:** el contenido editorial (descripciones, contexto, críticas, fuentes) se edita **directamente en `ideologies.json`**. El generador sigue disponible para recalcular el auto-layout, y desde junio de 2026 **preserva** todos los campos editoriales del JSON existente al regenerar, de modo que no borra este trabajo; aun así, recalcula las posiciones, por lo que solo debe usarse de forma deliberada.

## Campos por ideología

| Campo | Estado | Descripción |
|---|---|---|
| `id` | obligatorio | Slug kebab-case único (ej. `democratic-socialism`). |
| `name` | obligatorio | Nombre en español (ej. `Socialismo democrático`). |
| `nameEn` | opcional | Nombre en inglés (ej. `Democratic Socialism`). |
| `x`, `y`, `width`, `height` | obligatorio | Posición y tamaño de la celda en el grid (en el YAML se controla con `weight`; el generador los calcula). |
| `quadrant`, `color` | obligatorio | Cuadrante y color de familia. |
| `description` | obligatorio | Descripción corta — 2 a 4 oraciones. Se muestra en el tooltip y al inicio del panel. |
| `longDescription` | **completo (135/135)** | Descripción extensa — 3 a 8 párrafos. Aparece en el panel detallado. |
| `historicalContext` | **completo (135/135)** | Origen histórico, fechas clave, momentos fundacionales. |
| `contemporaryRelevance` | **completo (135/135)** | Por qué importa hoy, dónde se aplica o discute, casos contemporáneos. Menciona América Latina/Colombia cuando aplica. |
| `commonCriticisms` | **completo (135/135)** | Críticas más frecuentes desde otros campos del espectro. Se redacta neutralmente: "los críticos sostienen…", no "esto es malo porque…". |
| `keyThinkers` | completo (135/135) | Lista de pensadores y autores clave. |
| `historicalExamples` | completo (135/135) | Lista de casos históricos o regímenes asociados (con país y años cuando aplique). |
| `relatedIdeologies` | **completo (135/135)** | IDs de otras corrientes afines (validados contra el catálogo). |
| `wikipediaUrl` | **completo (135/135)** | URL directa de Wikipedia (preferentemente español), verificada. |
| `externalLinks` | **completo (135/135)** | Enlaces externos curados y verificados ("Lecturas sugeridas" en el panel de detalle). Independientes de los 6 enlaces estandarizados que el mapa genera automáticamente desde el nombre en el modal del compass. |

Tras el enriquecimiento de junio de 2026, **las 135 corrientes tienen todos estos campos completos** con contenido investigado y fuentes verificadas.

## Estilo editorial

### Tono

Neutral, pedagógico, riguroso. Pensado para un lector general curioso, no para un especialista. Evitar:

- Adjetivos cargados que no añadan información ("totalitaria opresiva", "izquierdista radical extremo").
- Caricaturas o reducciones polémicas.
- Voz pasiva genérica cuando hay un sujeto claro.
- Anglicismos cuando hay equivalente español aceptado.

Preferir:

- Frases cortas y claras.
- Ejemplos concretos con fecha y lugar.
- Citas indirectas a obras clave de la corriente.
- Cuando un término del catálogo es polémico (ej. "fascismo"), describirlo desde sus propios postulados sin endosarlos ni atacarlos.

### Estructura de `description` (corta)

Una a tres oraciones que respondan: **¿Qué es?** + **¿Cuál es su tesis económica/política central?**

Ejemplo bueno:

> *Distributismo*: Doctrina socioeconómica de inspiración católica que propone la dispersión amplia de la propiedad productiva entre familias, cooperativas y comunidades pequeñas. Rechaza tanto la concentración capitalista como el control estatal socialista.

### Estructura de `longDescription` (extensa)

Cuatro a ocho párrafos breves. Estructura sugerida:

1. **Tesis central**. Qué propone la corriente, en sus propios términos.
2. **Origen histórico**. Cuándo, dónde, en respuesta a qué.
3. **Principales pensadores y obras**. Quiénes la formularon y con qué textos.
4. **Aplicaciones históricas**. Dónde se ha intentado, con qué resultado.
5. **Variantes internas**. Subtendencias o derivaciones notables.
6. **Posición en el compás**. Por qué se ubica en este cuadrante y no en otro.

### Estructura de `historicalContext`

Línea de tiempo en prosa, no bullets. Mencionar siglos, eventos fundacionales, transformaciones clave. Concluir con el estado actual de la corriente.

### Estructura de `contemporaryRelevance`

¿Sigue teniendo presencia? ¿Dónde? ¿Quién la defiende hoy? ¿En qué debates aparece? Si la corriente es teórica/histórica sin actor contemporáneo, decirlo abiertamente.

### Estructura de `commonCriticisms`

Las críticas más frecuentes desde otras corrientes del compás. Redactadas como reportaje, no como adhesión. Forma:

> *"Los críticos liberales sostienen que…"*
> *"Desde el campo libertario se argumenta que…"*
> *"Pensadores socialdemócratas señalan que…"*

No: *"Esto está mal porque…"* o *"En realidad…"*.

## Fuentes aceptadas

Para datos factuales (fechas, autores, regímenes asociados):

- **Wikipedia (ES y EN)** — referencia general aceptada para datos básicos.
- **Stanford Encyclopedia of Philosophy** — para corrientes de fundamentación filosófica.
- **Britannica** — para datos históricos contrastados.
- **Internet Archive** — para textos primarios disponibles digitalmente.
- **Diccionarios filosóficos** (Cambridge Dictionary of Philosophy, Routledge Encyclopedia of Philosophy) cuando aplique.

Para corrientes contemporáneas o latinoamericanas:

- **Bibliotecas universitarias** (Uniandes, UNAM, USP) y revistas indexadas.
- **Artículos académicos peer-reviewed** consultables en Google Scholar.
- **Documentos primarios del proyecto político** cuando es una corriente con organización formal viva.

**No aceptadas como fuente única:**

- Blogs de opinión sin curaduría editorial.
- Redes sociales como única fuente factual.
- Sitios partidistas que solo presentan la corriente desde una óptica adherente.
- Medios de comunicación con fuerte sesgo declarado, salvo para citar la posición de ese medio explícitamente.

## Validación

Toda entrada debe pasar:

1. **Schema Zod** (build de Astro). Campos requeridos presentes, longitudes mínimas y máximas, tipos correctos. Sin esto el build falla.
2. **Revisión humana** antes del merge. Al menos un colaborador adicional verifica que la redacción cumple este estándar.
3. **Coherencia con el cuadrante**. La descripción debe ser consistente con la posición `(x, y)` de la celda. Si la celda está en `auth_right` superior, la descripción no puede ser de una corriente moderada centro.

## Proceso de enriquecimiento en lote

El enriquecimiento masivo de junio de 2026 (las 135 corrientes) siguió un pipeline reproducible de investigación + verificación adversarial:

1. **Una entidad por agente.** Cada ideología se asigna a un agente de investigación que recibe el dato actual + este estándar editorial.
2. **Investigación con fuentes reales.** El agente busca en la web y **verifica cada URL** (debe responder) antes de incluirla; produce el contenido en español neutral.
3. **Salida aislada.** Cada agente escribe su resultado en un archivo individual (`scripts/enrich/out/ideologies/<id>.json`), lo que evita conflictos de escritura en paralelo.
4. **Verificación adversarial.** Un segundo agente, independiente, revisa con escepticismo cada perfil: ¿fuentes reales y accesibles?, ¿tono neutral?, ¿`relatedIdeologies` válidos?, ¿algún dato sin respaldo? Corrige lo que haga falta.
5. **Merge determinista + validación.** Un script (`scripts/enrich/merge-ideologies.cjs`) fusiona el contenido sobre `ideologies.json` preservando el layout y los campos protegidos, y `scripts/enrich/validate.cjs` valida las 135 entradas contra el schema Zod antes del commit.

Toda afirmación factual debe seguir siendo auditable con las fuentes citadas; el tono neutral y la separación entre descripción y crítica son innegociables.

## Historial de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.1.0 | 2026-06-22 | Las 135 corrientes quedan con `longDescription`, `historicalContext`, `contemporaryRelevance`, `commonCriticisms`, `relatedIdeologies`, `wikipediaUrl` y `externalLinks` completos y verificados. Se documenta el pipeline de investigación + verificación adversarial y la preservación del contenido editorial en `generate:ideologies`. Aclarado que `ideologies.json` es la fuente de verdad. |
| 1.0.0 | 2026-04-23 | Versión inicial. Estándar establecido durante el enriquecimiento masivo de las 135 corrientes del catálogo. |
