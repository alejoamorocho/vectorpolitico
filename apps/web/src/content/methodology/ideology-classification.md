---
title: Cómo asignamos ideología a cada figura
description: Metodología v2 para asignar ideología con trazabilidad. Regla de proximidad geométrica flexible con justificación documentada y fuentes verificables para cada asignación.
order: 15
section: compass
version: 2.2.0
lastUpdated: 2026-04-23
authors:
  - ssi-co
relatedDocs:
  - compass-scoring
  - data-sources
---

## Principio rector

Cada figura tiene **dos etiquetas ideológicas distintas**, una por cada pregunta sobre ella:

- `ideologySelf` — la corriente que mejor representa lo que la figura **dice ser** (deriva del análisis de su discurso público).
- `ideologyEvidenced` — la corriente que mejor representa lo que sus **acciones revelan** (deriva del análisis dimensional de votaciones, decretos, ejecución presupuestal y demás evidencia primaria).

Cada asignación se acompaña de una justificación escrita y al menos una fuente verificable, en los campos `ideologySelfAssignment` e `ideologyEvidencedAssignment` del JSON. **Sin fuentes no hay asignación** — el schema Zod y Pydantic lo rechaza.

Bajo el modelo vigente ([ADR-003](/metodologia/adr-003-grid-completo-educativo)) **las coordenadas visuales** de cada figura derivan automáticamente de las etiquetas:

- `compassSelfPerceived.{x, y}` = centroide exacto de la celda de `ideologySelf`.
- `compassEvidenced.{x, y}` = centroide exacto de la celda de `ideologyEvidenced`.

Esto significa que **la etiqueta determina la posición visual**, no al revés. La etiqueta sigue derivándose del análisis (discursivo para la self, dimensional para la evidenced) pero el píxel donde se dibuja la figura es derivado simbólicamente. Esto garantiza que cada figura caiga en el corazón de su celda y el mapa sea legible sin ambigüedad.

## Cómo se asigna `ideologySelf` (autopercibida)

El análisis para esta etiqueta es **discursivo**, no dimensional. Se lee lo que la figura declara en sus propios canales (sitio oficial, programa de gobierno, plataforma del partido, perfil en Wikipedia ES) y se elige del catálogo de 135 corrientes la celda que mejor describe ese discurso.

Cuando una figura se autodefine explícitamente con un término del catálogo (ej. "soy socialdemócrata"), la etiqueta es directa. Cuando no, se infiere del lenguaje, las propuestas y las referencias intelectuales que cita. La justificación debe nombrar exactamente qué frases o documentos sustentan la etiqueta.

## Cómo se asigna `ideologyEvidenced` (evidenciada)

El proceso tiene dos pasos:

### 1. Scoring dimensional con fuentes primarias

Para cada figura se evalúan las **8 dimensiones del compás** (4 económicas + 4 sociales — ver [compass-scoring](/metodologia/compass-scoring)) en escala -10 a +10, con:

- justificación textual por dimensión que cite acciones concretas (votación específica, decreto firmado, partida ejecutada);
- fuentes primarias por dimensión (CongresoVisible, SUIN-Juriscol, Contraloría, Diario Oficial, Registraduría).

Estos `dimensionScores` quedan guardados en `compassEvidenced.dimensionScores` y son auditables. Son la **base evidencial** del análisis evidenciado.

### 2. Elección de la celda con la regla de proximidad

A partir de los scores se calcula `(x_avg, y_avg)` (promedio ponderado). Ese punto numérico apoya la elección de etiqueta:

**Regla por defecto** — asignar la ideología cuyo centroide esté más cerca (distancia euclidiana) del `(x_avg, y_avg)`, dando preferencia a celdas del mismo cuadrante.

**Excepción justificada** — se puede asignar una etiqueta distinta a la más cercana si:

- la figura se identifica explícitamente con esa etiqueta en una fuente propia,
- hay evolución ideológica documentada (ex-combatiente, cambio de partido con declaración pública),
- la etiqueta describe mejor la familia política aunque el `(x_avg, y_avg)` numérico esté ligeramente desplazado.

Cuando se usa la excepción, la justificación textual debe nombrar el motivo y citar la fuente.

Una vez elegida la etiqueta, la **coordenada visual** `compassEvidenced.{x, y}` se asigna automáticamente al centroide exacto de esa celda — no al `(x_avg, y_avg)` numérico crudo. El [validador de coherencia](/metodologia/data-validation) chequea que el desplazamiento entre `(x_avg, y_avg)` y el centroide no supere 3 unidades; si supera, la etiqueta debe revisarse.

### Sin límite de distancia entre self y evidenced

**No existe límite artificial** de distancia entre `ideologySelf` e `ideologyEvidenced`. Si la evidencia muestra que un político gobierna desde una ideología opuesta a la que declara, eso se refleja tal cual — hacer visible esa divergencia es precisamente el propósito de Brújula Política.

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

1. **Recopilar evidencia primaria** del actor:
   - Para self: sitio oficial, Wikipedia, plataforma del partido, programa de gobierno.
   - Para evidenced: votaciones (CongresoVisible), decretos (SUIN-Juriscol), ejecución (Contraloría), nombramientos, coaliciones.
2. **Asignar `ideologySelf`** desde el análisis discursivo: ¿con qué corriente del catálogo de 135 se identifica la figura en sus propias palabras?
3. **Calcular los 8 `dimensionScores`** del análisis evidenciado, con justificación + fuentes primarias por dimensión.
4. **Calcular `(x_avg, y_avg)`** numérico como pista del cuadrante y zona donde el comportamiento ubica al actor.
5. **Asignar `ideologyEvidenced`** aplicando la regla de proximidad (con excepción justificada cuando aplique).
6. **Coordenadas visuales** se asignan automáticamente: `compassSelfPerceived` = centroide de `ideologySelf`; `compassEvidenced` = centroide de `ideologyEvidenced`.
7. **Documentar divergencia self↔evidenced** en la justificación. A mayor distancia, más detallada y con más fuentes.
8. **Escribir justificaciones** citando al menos 1 fuente por cada `Assignment`.
9. **Validar con Zod/Pydantic** (sin justificación ≥20 caracteres o sin fuente, falla) y con `validate_dataset.py` (que la etiqueta evidenciada sea coherente con los `dimensionScores`).

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
