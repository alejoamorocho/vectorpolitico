---
title: Estándar de redacción de ideologías
description: Cómo redactamos las descripciones, contexto histórico, pensadores clave, ejemplos y críticas de cada una de las 135 corrientes ideológicas del catálogo. Estándar editorial para mantener consistencia, neutralidad y rigor académico.
order: 35
section: data
version: 1.0.0
lastUpdated: 2026-04-23
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

## Campos del JSON por ideología

Cada entrada del catálogo (`packages/data/ideologies.source.yaml` que se compila a `ideologies.json`) tiene estos campos:

| Campo | Obligatorio | Descripción |
|---|---|---|
| `id` | sí | Slug kebab-case único (ej. `democratic-socialism`). |
| `name` | sí | Nombre en español (ej. `Socialismo democrático`). |
| `nameEn` | sí | Nombre en inglés (ej. `Democratic Socialism`). |
| `weight` | sí | Peso visual en el grid (1-5, controla tamaño de la celda). |
| `description` | sí | Descripción corta — 2 a 4 oraciones, 200-400 caracteres. Lo que se muestra en el tooltip y al inicio del panel. |
| `longDescription` | recomendado | Descripción extensa — 4 a 8 párrafos. Aparece en el panel detallado. |
| `historicalContext` | recomendado | Origen histórico, fechas clave, momentos fundacionales. |
| `contemporaryRelevance` | recomendado | Por qué importa hoy, dónde se aplica o discute, casos contemporáneos. |
| `commonCriticisms` | recomendado | Críticas más frecuentes desde otros campos del espectro. Se redacta neutralmente: "los críticos sostienen…", no "esto es malo porque…". |
| `keyThinkers` | recomendado | Lista de pensadores y autores clave (3-7 nombres). |
| `historicalExamples` | recomendado | Lista de casos históricos o regímenes asociados (con país y años cuando aplique). |
| `relatedIdeologies` | opcional | IDs de otras corrientes cercanas en el grid. |
| `wikipediaUrl` | opcional | URL directa de Wikipedia (preferentemente español). |
| `externalLinks` | opcional | Lista de enlaces externos curados. Si está vacío, el sitio genera 6 enlaces estandarizados (Wikipedia ES/EN, Stanford, Britannica, Internet Archive, Google Scholar) automáticamente desde el nombre. |

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

## Proceso de enriquecimiento

Cuando se enriquece el catálogo en lote (como el enriquecimiento masivo del 2026-04-23):

1. **Distribuir las ideologías** en lotes manejables por cuadrante.
2. **Brief consistente** a cada redactor (humano o agente IA): este estándar + plantilla de campos.
3. **Revisión cruzada**: cada lote es revisado por una persona distinta del redactor.
4. **Schema check**: pasar el YAML por `pnpm generate:ideologies` para que Pydantic + Zod validen toda entrada antes del merge.
5. **Spot check editorial**: muestreo aleatorio del 10-20% para verificar tono y consistencia.

## Historial de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0.0 | 2026-04-23 | Versión inicial. Estándar establecido durante el enriquecimiento masivo de las 135 corrientes del catálogo. |
