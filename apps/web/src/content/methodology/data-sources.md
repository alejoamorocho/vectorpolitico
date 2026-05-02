---
title: Fuentes de datos — Colombia
description: Catálogo de fuentes primarias aceptadas para cada tipo de figura política en Colombia, con cobertura temporal y nivel de confiabilidad.
order: 30
section: data
version: 1.2.0
lastUpdated: 2026-04-15
authors:
  - ssi-co
relatedDocs:
  - compass-scoring
  - ideology-classification
---

## Principio

Toda información en Brújula Política debe provenir de **fuentes primarias verificables**. Las fuentes secundarias (periodismo, análisis académico) se aceptan solo como apoyo contextual, nunca como única base de un posicionamiento o una incoherencia.

## Tabla de fuentes por tipo

| Tipo de dato | Fuente | Cobertura | Confiabilidad |
|---|---|---|---|
| Votaciones Congreso | [CongresoVisible](https://congresovisible.uniandes.edu.co/) (Uniandes) | 2002 — presente | Alta |
| Resultados electorales | [Registraduría Nacional](https://www.registraduria.gov.co/) | 1990 — presente | Alta |
| Planes de gobierno | [CNE](https://www.cne.gov.co/) | 2002 — presente | Alta |
| Ejecución presupuestal | [Contraloría General](https://www.contraloria.gov.co/) | 2010 — presente | Alta |
| Declaraciones de bienes | [SIGEP II](https://www.funcionpublica.gov.co/) | 2014 — presente | Alta |
| Datos abiertos | [datos.gov.co](https://www.datos.gov.co/) | Varios | Alta |
| Noticias | [GDELT 2.0](https://www.gdeltproject.org/) | 2013 — presente | Media (requiere cross-check) |
| Decretos presidenciales | [SUIN-Juriscol](https://www.suin-juriscol.gov.co/) | Histórico | Alta |

## Reglas de fuentes por tipo de posición compass

### Para `compassSelfPerceived` (Autopercepción)

Solo se aceptan fuentes que representen la voz del político o partido: página web oficial, Wikipedia en español, programa de gobierno registrado ante CNE/Registraduría, y perfil institucional (Senado, Cámara, etc.). No se usan medios de comunicación como fuente de autopercepción.

### Para `compassEvidenced` (Posición evidenciada)

Solo se aceptan fuentes de evidencia primaria sobre acciones concretas (CongresoVisible, Contraloría, SUIN-Juriscol, etc.). La justificación debe ser análisis propio del proyecto — no se copian etiquetas ni caracterizaciones de medios.

## Fuentes NO aceptadas como base de posicionamiento

- **Medios de comunicación** como fuente única para compassSelfPerceived o compassEvidenced
- **Redes sociales** (Twitter/X, Facebook, Instagram) como fuente primaria
- **Blogs de opinión** o columnas que etiquetan ideológicamente
- **Fuentes anónimas**
- **Capturas de pantalla sin URL verificable**
- **Análisis de think tanks con sesgo ideológico explícito** (se aceptan con cross-check de fuente primaria)

Los medios SÍ se aceptan como fuentes de incoherencias (hechos verificables con URL archivada) y como contexto complementario.

## Fuentes para asignación de ideología (v2)

Desde la metodología v2 (2026-04-15), cada asignación de ideología a una figura se documenta con justificación y fuentes. Ver `ideology-classification` para el detalle completo.

### Para `ideologySelfAssignment.sources`

Mismas reglas que `compassSelfPerceived.sources`: página web oficial, Wikipedia en español, programa de gobierno CNE/Registraduría, estatutos/plataforma, perfil institucional. NO se aceptan medios ni redes sociales como fuente primaria.

### Para `ideologyEvidencedAssignment.sources`

Mismas reglas que `compassEvidenced.sources`: CongresoVisible, SUIN-Juriscol/Diario Oficial, Contraloría, Registraduría, sentencias. Los medios pueden complementar hechos verificables, nunca la etiqueta ideológica.

### Validación automática

El schema Zod y Pydantic exige justificación de al menos 20 caracteres y al menos 1 fuente por asignación. Si los campos legacy (`ideologySelf`, `ideologyEvidenced`) están presentes, su `ideologyId` debe coincidir con el del `Assignment` correspondiente.

## Metadata obligatoria de ideologías y partidos

Para que el lector pueda verificar por sí mismo qué significa cada etiqueta y cada partido, se exige:

### `ideologies.json` (126 ideologías)

Obligatorio: campos base del schema más `wikipediaUrl` (enlace a Wikipedia en español preferente) y `externalLinks[]` con al menos 1 fuente académica o enciclopédica (Stanford Encyclopedia of Philosophy, Britannica, JSTOR, libros de referencia). Recomendado: `longDescription`, `historicalContext`, `keyThinkers`, `historicalExamples`, `relatedIdeologies`.

### `parties.json` (23 partidos)

Obligatorio: campos base más `websiteUrl` (sitio oficial verificado), `sources[]` con al menos 1 fuente externa (CNE, Registraduría, estatutos archivados, análisis académico) y `compassPosition` con `justification`, `sources[]` y `confidence`. Recomendado: `foundedYear`, `logoUrl`, `ideologies[]`, `incoherences[]`.

### Por qué

Sin esta metadata, cuando el lector hace clic en una ideología o partido ve una etiqueta sin referencia externa. Con ella, puede verificar el significado en Wikipedia, leer fuentes académicas y validar el sitio oficial del partido. Trazabilidad completa.

## Proceso de archivado

Toda URL citada en Brújula Política debe archivarse en [Wayback Machine](https://web.archive.org/) antes de ser incluida. Esto garantiza permanencia incluso si el sitio original cambia o desaparece.

```bash
# Ejemplo: archivar una URL
curl -X POST https://web.archive.org/save/https://ejemplo.com/articulo
```

En el futuro integraremos el archivado automático vía S3-compatible API de Internet Archive.
