---
title: Cómo asignamos ideología a cada figura
description: Metodología v2 para asignar ideología con trazabilidad. Regla de proximidad geométrica flexible con justificación documentada y fuentes verificables para cada asignación.
order: 15
section: compass
version: 2.1.0
lastUpdated: 2026-04-23
authors:
  - ssi-co
relatedDocs:
  - compass-scoring
  - data-sources
---

## Principio rector

Cada figura termina con una etiqueta ideológica (ej. `social-democracy`, `liberal-conservatism`). Esa etiqueta **debe ser consecuencia** de su posición en el compás, no una decisión previa.

Dos campos distintos, ambos con fuentes:

- `ideologySelfAssignment` — la ideología que mejor representa lo que la figura **dice ser** (derivada de `compassSelfPerceived`).
- `ideologyEvidencedAssignment` — la ideología que mejor representa lo que las acciones muestran (derivada de `compassEvidenced`).

Cada asignación va con una justificación escrita y al menos una fuente verificable. **Sin fuentes no hay asignación** — el schema Zod y Pydantic lo rechaza.

## La regla de proximidad (flexible con justificación)

Cada ideología en `ideologies.json` tiene un centro `(x, y)` y unas dimensiones `(width, height)` que definen su "caja" en el compás.

**Regla por defecto:** asignar la ideología cuyo centro esté más cerca (distancia euclidiana) del punto de la figura, dando preferencia a ideologías del mismo cuadrante.

**Excepción justificada:** se puede asignar una ideología distinta a la más cercana si:

- la figura se identifica explícitamente con esa etiqueta en una fuente propia, o
- hay evolución ideológica documentada (ej. ex-combatiente, cambio de partido con declaración pública), o
- la ideología describe mejor la familia política aun cuando su posición numérica la haya movido (ej. socialliberal que queda en lib-der)

Cuando se usa la excepción, la justificación debe **nombrar el motivo y citar la fuente**.

### Sin límite de distancia entre self y evidenced

**No existe límite artificial** de distancia entre `ideologySelfAssignment` e `ideologyEvidencedAssignment`. Si la evidencia muestra que un político gobierna desde una ideología opuesta a la que declara, eso se refleja tal cual — hacer visible esa divergencia es precisamente el propósito de Brújula Política.

Lo único obligatorio es el **"por qué"**: a mayor distancia entre self y evidenced, más robusta debe ser la justificación y las fuentes de la posición evidenciada.

## Fuentes requeridas por tipo de asignación

### `ideologySelfAssignment.sources`

Representan la voz de la figura:

- página web oficial del político, campaña o partido
- Wikipedia en español
- programa de gobierno registrado en CNE/Registraduría
- estatutos/plataforma programática del partido
- perfil institucional (Senado, Cámara, Alcaldía, Gobernación)

**No aceptadas:** medios de comunicación, redes sociales como fuente primaria, blogs de opinión, think tanks sin cross-check.

### `ideologyEvidencedAssignment.sources`

Evidencia primaria sobre acciones:

- CongresoVisible (votaciones en el Congreso)
- SUIN-Juriscol / Diario Oficial (decretos, actos administrativos)
- Contraloría (ejecución presupuestal)
- Registraduría (resultados electorales, coaliciones)
- sentencias judiciales, informes oficiales, datos de planes de desarrollo

Los medios pueden complementar como fuentes de hechos verificables, **nunca como etiqueta ideológica**.

## Estructura en el JSON

```json
{
  "id": "ejemplo-politico",
  "ideologies": ["social-democracy", "progressivism"],
  "ideologySelf": "social-democracy",
  "ideologyEvidenced": "social-democracy",
  "ideologySelfAssignment": {
    "ideologyId": "social-democracy",
    "justification": "Se autodefine como socialdemócrata en su sitio oficial y plataforma 2022. Su posición auto-percibida (x=-3.2, y=-2.8) cae dentro del rectángulo de social-democracy.",
    "sources": [
      { "url": "https://sitio-oficial.co/quien-soy", "outlet": "Sitio oficial", "date": "2024-01-15" },
      { "url": "https://es.wikipedia.org/wiki/...", "outlet": "Wikipedia", "date": "2024-01-15" }
    ]
  },
  "ideologyEvidencedAssignment": {
    "ideologyId": "social-democracy",
    "justification": "Análisis metodológico del proyecto: votaciones en CongresoVisible (2022-2024) muestran apoyo sistemático a reforma tributaria progresiva, reforma laboral y derechos sociales. Posición resultante coincide con el centro de social-democracy.",
    "sources": [
      { "url": "https://congresovisible.uniandes.edu.co/...", "outlet": "CongresoVisible", "date": "2024-12-01" },
      { "url": "https://www.suin-juriscol.gov.co/...", "outlet": "SUIN-Juriscol", "date": "2024-06-01" }
    ]
  }
}
```

### Compatibilidad con campos legacy

Los campos `ideologySelf` e `ideologyEvidenced` (string) se mantienen por compatibilidad. Si están presentes ambos, sus `ideologyId` deben coincidir — el schema lo valida.

El campo `ideologies: string[]` sigue como lista de etiquetas tangenciales que no son la principal.

## Proceso paso a paso

1. **Calcular `compassEvidenced`** con la metodología de scoring, fuentes primarias, confianza calibrada.
2. **Calcular `compassSelfPerceived`** desde sitio oficial, Wikipedia, plataforma.
3. **Asignar `ideologyEvidenced`** buscando en `ideologies.json` la ideología del mismo cuadrante cuyo centro esté más cerca de la posición evidenciada.
4. **Asignar `ideologySelf`** con la misma lógica sobre la posición auto-percibida, con preferencia a etiquetas que la figura use.
5. **Documentar divergencia.** Si `ideologySelf` ≠ `ideologyEvidenced`, explicar en la justificación qué evidencia causa la diferencia. A mayor distancia, más detallada la justificación y más fuentes.
6. **Escribir justificaciones** citando al menos 1 fuente por cada `Assignment`.
7. **Validar con Zod/Pydantic.** Sin justificación ≥20 caracteres o sin fuente, falla.

## Qué NO hacer

- **No asignar ideología antes de calcular el compás.** La ideología es consecuencia, no premisa.
- **No asignar ideologías sin justificación escrita.** Toda asignación requiere explicar por qué. A mayor distancia entre self y evidenced, más detallada la justificación — pero el salto en sí no está prohibido si la evidencia lo sustenta.
- **No usar ideologías que no existan en `ideologies.json`.** Si falta una, agregarla primero (con `wikipediaUrl`, `externalLinks`, `description`).
- **No omitir fuentes.** Sin fuentes = no se asigna.

## Metadata obligatoria de ideologías y partidos

Para que un usuario pueda verificar por sí mismo qué significa cada ideología:

### En `ideologies.json`
- `wikipediaUrl` — enlace directo a Wikipedia (ES preferente)
- `externalLinks[]` — al menos 1 fuente académica/enciclopédica
- `description` detallada

### En `parties.json`
- `websiteUrl` — sitio oficial verificado
- `sources[]` — al menos 1 fuente externa (CNE, Registraduría, análisis)
- `compassPosition` con justificación, fuentes y confianza

## Universo ideológico completo (no se filtra por país)

El catálogo `ideologies.source.yaml` mantiene el set completo de la referencia global de Political Compass — **135 ideologías** que cubren todo el espacio político del mundo: desde extremos teóricos (Hive Mind Collectivism, IngSoc) hasta corrientes con actores reales locales (democracia cristiana, socialdemocracia), pasando por corrientes que ningún partido colombiano sigue pero que son parte del repertorio educativo global (Juche, Sionismo, Maoísmo, Distributismo, Mutualismo, Anarco-capitalismo).

El propósito del mapa es **educativo**: mostrarle al usuario la riqueza del espectro ideológico para que pueda ubicar las posiciones colombianas dentro de ese universo amplio. Por eso el grid renderiza siempre **las 135 celdas completas** — no se filtra por país.

```bash
python -m src.generate_ideologies        # grid completo (recomendado)
python -m src.generate_ideologies --country=co   # opcional: filtra a las aplicables a CO
```

El bloque `applicable_to_country.co` del YAML se conserva como **metadata informativa** — útil para análisis y para listas internas, pero no se usa por defecto en la generación visual.

### Cómo se ubica cada partido y figura en el grid completo

Dado que el grid muestra el universo completo, las posiciones de los actores colombianos se asignan así:

- **Partidos**: cada partido se ubica exactamente en el centroide de su `ideologies[0]` — la ideología principal declarada en el JSON. Esto garantiza que el partido caiga visualmente en SU celda, no entre celdas, y permita al usuario leer el mapa sin ambigüedad.
- **Figuras políticas**: cada figura tiene dos posiciones — su `compassSelfPerceived` se ubica en el centroide de `ideologySelf`, y su `compassEvidenced` en el centroide de `ideologyEvidenced`. La flecha entre ambos puntos sigue siendo el índice de coherencia.
- **`dimensionScores`**: se conservan en el JSON como evidencia auditable del análisis dimensional (8 dimensiones evaluadas con justificación), pero ya no determinan la coordenada visual. Esto desacopla el análisis dimensional fino del rendering simbólico.

### Adiciones específicas para enriquecer el catálogo (Fases 1.5 y 2.0)

Tres ideologías agregadas para cubrir vacíos del catálogo global:

- **`liberation-theology`** (auth_left) — Camilo Torres, Grupo Golconda, Comunidades Eclesiales de Base. Cristianismo de izquierda con compromiso de transformación estructural.
- **`indigenous-communalism`** (lib_left) — CRIC, ONIC, resguardos, Minga. Sistema de gobierno propio con propiedad colectiva y reciprocidad económica.
- **`right-populism`** (auth_right) — Liga de Gobernantes (Rodolfo Hernández), sectores del uribismo de base. Movilización personalista anti-establecimiento.

Y tres subdivisiones de la celda `authoritarian-capitalism` (que ocupaba toda la franja inferior auth_right sin discriminar perfiles muy distintos):

- **`clientelism-cacicazgo`** (auth_right inferior, x bajo) — Casa Char, gamonalismo, redes patrimoniales locales.
- **`developmentalism`** (auth_right inferior, x medio) — Vargas Lleras, pragmatismo CEPAL, infraestructura.
- **`securitarian-right`** (auth_right inferior, x medio-alto) — Pinzón, uribismo post-conflicto moderado.

Y dos movimientos de cuadrante para corregir mis-clasificaciones:

- **`christian-democracy`**: auth_left → auth_right (los partidos cristianos colombianos son social-conservadores, no socialistas-cristianos europeos).
- **`technocracy`**: auth_left → lib_right (proyectos como Fajardo o Galán son centro tecnócrata, no estatistas autoritarios).

## Validación de coherencia automática

Tras la auditoría humana descrita arriba, se introdujo un validador automático para detectar incoherencias internas entre las dimensiones evaluadas y la posición resultante:

```bash
python scripts/validate_dataset.py
python scripts/validate_dataset.py --threshold 2.0
python scripts/validate_dataset.py --json > out.json
```

El script recorre los políticos y reporta cuando `|compassEvidenced.x − promedio_ponderado(dimensionScores_x)| > umbral`. Sirve para detectar:

1. **Bug de asignación del LLM** (caso histórico): coords extremas que contradicen los scores que el propio modelo generó. Ej. político con scores moderados pero `x = ±9`.
2. **Drift tras correcciones manuales**: cuando un agente humano reposiciona la coord pero olvida actualizar los scores, el promedio queda desactualizado.
3. **Inconsistencias estructurales** del pipeline ETL.

El generador `classify_entity.py` ahora también incluye este chequeo en tiempo real: emite warning a stderr y agrega `_hasVerificationWarnings: true` al output cuando detecta desviación.

## Historial de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0.0 | 2026-04-15 | Versión inicial. Introducción de `ideologySelfAssignment`, `ideologyEvidencedAssignment`, regla de proximidad flexible con justificación, requisito de fuentes por asignación. |
| 1.1.0 | 2026-04-15 | Se elimina el límite de ~6 unidades entre self y evidenced. Lo que importa es la justificación documentada, no un tope numérico artificial. |
| 2.0.0 | 2026-04-23 | Grid curado por país (filtro de ~131 a ~46). Tres ideologías nuevas, subdivisión de authoritarian-capitalism, movimientos de cuadrante. Validador automático. *Nota: superseded en v2.1.0 — el filtro por país se vuelve metadata informativa, no comportamiento por defecto.* |
| 2.1.0 | 2026-04-23 | **Giro al universo ideológico completo (135 celdas).** El grid muestra todas las corrientes globales para propósito educativo. Las posiciones de partidos y figuras se anclan al centroide de su ideología declarada (`ideologies[0]` para partidos, `ideologySelf`/`ideologyEvidenced` para figuras). Los `dimensionScores` se conservan como evidencia auditable pero ya no determinan la coord visual. Detalle en [ADR-003](/metodologia/adr-003-grid-completo). Las adiciones de v2.0.0 (liberation-theology, indigenous-communalism, right-populism, subdivisión de auth_right inferior, movimientos de cuadrante) se mantienen. |
