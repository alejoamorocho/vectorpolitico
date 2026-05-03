---
title: Cómo posicionamos figuras en el compass
description: Metodología de scoring del compass político — fórmulas, pesos y criterios exactos para cada dimensión del eje económico y social.
order: 10
section: compass
version: 2.0.0
lastUpdated: 2026-04-23
authors:
  - ssi-co
relatedDocs:
  - ideology-classification
  - data-sources
  - data-validation
  - incoherence-standard
---

## Principio rector

Toda posición en el compass político debe poder justificarse con **hechos verificables y fuentes primarias**. No publicamos opinión disfrazada de dato.

Cuando la evidencia es insuficiente, lo decimos explícitamente mediante el nivel de confianza. Una posición con confianza `low` es preferible a una inventada.

## Los dos ejes del compass

### Eje X — Económico

```
-10                    0                    +10
Izquierda        Centro económico         Derecha
(Estado, colectivo,               (Mercado, privado,
redistribución)                    acumulación)
```

### Eje Y — Social

```
+10 Autoritario — Control social, tradición, concentración de poder
  0
-10 Libertario — Autonomía individual, progresismo, descentralización
```

## Las dos posiciones por figura — discurso vs hechos

Cada figura política tiene **dos puntos** en el mapa que responden a dos preguntas distintas. El proyecto los mantiene siempre separados para que el lector pueda **comparar lo que la figura dice ser con lo que sus acciones revelan**.

### 🔵 Posición Autopercibida — *qué dice ser*

Lo que la figura declara, promete y se atribuye a sí misma. Se construye **exclusivamente** desde fuentes propias del político o partido — porque la pregunta es "¿cómo se presenta a sí misma al público?" y eso solo puede responderlo lo que ella misma dice:

- Página web oficial del político o campaña.
- Página web oficial del partido.
- Wikipedia en español (referencia neutral de autopercepción pública).
- Programa de gobierno registrado ante el CNE/Registraduría.
- Estatutos y plataforma programática del partido.

**No se usan medios de comunicación** como fuente para la posición autopercibida. Los medios interpretan y etiquetan; la autopercepción debe venir de lo que la figura dice de sí misma en sus propios canales.

A partir de ese análisis discursivo se asigna una etiqueta — la `ideologySelf` (ej. `social-democracy`) — con su justificación textual y al menos una fuente (campos `ideologySelfAssignment` en el JSON). Esa etiqueta apunta a una celda específica del grid de 135 ideologías.

**La coordenada `compassSelfPerceived.{x, y}` es el centroide exacto de la celda de `ideologySelf`.** Es decir, la figura cae visualmente en el corazón de la celda que representa la ideología que declara seguir.

### 🔴 Posición Evidenciada — *qué hacen sus acciones*

Lo que revelan las acciones documentadas. Es **análisis propio del proyecto** — nunca se copian etiquetas o caracterizaciones de medios. Las fuentes son evidencia primaria:

- Votaciones en el Congreso (CongresoVisible).
- Decretos, resoluciones y actos administrativos firmados (SUIN-Juriscol).
- Ejecución presupuestal vs plan (Contraloría).
- Coaliciones formadas en la práctica.
- Nombramientos realizados.
- Registros electorales (Registraduría).

El proceso es:

1. **Scoring dimensional**. Para cada figura se evalúan las **8 dimensiones** del compás (ver tablas más abajo) en escala de -10 a +10, con justificación textual y fuentes por dimensión. Estos `dimensionScores` quedan registrados en el JSON como evidencia auditable. Cada justificación dimensional comienza con "Análisis metodológico del proyecto:" para hacer explícito que es análisis interno, no etiqueta heredada de un medio.

2. **Cálculo de un punto numérico**. El promedio ponderado de los scores produce un par `(x_avg, y_avg)`. Sirve como pista del cuadrante y la zona donde la figura "vive" según sus acciones.

3. **Asignación de la etiqueta `ideologyEvidenced`**. A partir de ese punto numérico se elige la ideología cuya celda en el grid mejor describe el comportamiento. La regla por defecto es proximidad geométrica al centroide; con excepción justificada cuando una etiqueta describe mejor la familia política aunque no sea la más cercana (ver [Asignación de ideología](/metodologia/ideology-classification)). La etiqueta queda con su justificación + fuentes en `ideologyEvidencedAssignment`.

4. **Coordenada visual**. **`compassEvidenced.{x, y}` se asigna al centroide exacto de la celda de `ideologyEvidenced`** — no al `(x_avg, y_avg)` numérico crudo. La figura cae visualmente en el corazón de la celda que el análisis le asignó como etiqueta evidenciada.

> Esta decisión metodológica está documentada en [ADR-003](/metodologia/adr-003-grid-completo-educativo). Desacopla el **análisis dimensional** (los datos auditables que sustentan la etiqueta) del **rendering visual** (un anclaje simbólico que permite leer el mapa sin ambigüedad).

Por qué este modelo:

- El usuario al ver el mapa puede **leer cada punto sin ambigüedad** — cada figura está en el centro de SU celda, no entre celdas.
- El proyecto puede mostrar el universo completo de 135 corrientes ideológicas sin que figuras caigan sobre celdas absurdas (Sionismo, Kuomintangismo) por casualidad numérica.
- La evidencia analítica (los `dimensionScores` con justificación dimensión por dimensión) sigue siendo auditable y permite validar si la etiqueta asignada es defendible.

### Posicionamiento de partidos

Los partidos no tienen un par `self` / `evidenced` separado — son entidades simbólicas con un solo punto. Cada partido declara un array ordenado `ideologies[]` (la principal primero, las complementarias después) en su JSON, con justificación y fuentes en `compassPosition`. **La coordenada del partido es el centroide exacto de `ideologies[0]`** — su ideología principal declarada.

### El delta — índice de coherencia

```
delta = distancia_euclidiana(autopercibida, evidenciada)

delta = 0        → coherencia perfecta
delta = 1-3      → coherencia alta
delta = 4-6      → coherencia media — divergencias notables
delta = 7-10     → coherencia baja — contradicciones significativas
delta > 10       → incoherencia severa
```

## Las 8 dimensiones del scoring evidenciado

El scoring solo aplica al análisis evidenciado. La autopercepción se determina del discurso, no de scoring numérico.

### Dimensiones del Eje X (económico)

| Dimensión | Peso Ejecutivo | Peso Legislativo |
|---|---|---|
| Política fiscal (gasto, impuestos, deuda) | 30% | 20% |
| Posición frente al mercado y empresa privada | 25% | 25% |
| Política social (subsidios, universalismo vs focalización) | 25% | 25% |
| Comercio exterior, TLCs, inversión extranjera | 20% | 30% |

### Dimensiones del Eje Y (social)

| Dimensión | Peso |
|---|---|
| Derechos civiles y libertades individuales | 30% |
| Posición frente a fuerzas de seguridad y orden público | 25% |
| Derechos reproductivos, diversidad, derechos sociales | 25% |
| Concentración de poder, institucionalidad, controles | 20% |

### Scoring por dimensión

Cada dimensión se puntúa de **-10 a +10** basado únicamente en hechos verificables documentados en fuentes primarias. Cada score lleva su justificación textual con citas a la acción concreta.

### Cálculo intermedio que apoya la asignación de etiqueta

```
x_avg = Σ(score_dimensión_i × peso_i)   para las 4 dimensiones del eje X
y_avg = Σ(score_dimensión_i × peso_i)   para las 4 dimensiones del eje Y
```

Ese `(x_avg, y_avg)` **no es la coordenada visual final** — es la pista numérica que apoya al equipo a elegir qué celda del grid asigna como `ideologyEvidenced`. La coord visual final es el centroide exacto de esa celda (ver sección "Posición Evidenciada" arriba).

## Niveles de confianza

| Nivel | Criterio |
|---|---|
| `high` | Votaciones documentadas + acciones verificadas en ≥3 dimensiones de cada eje |
| `medium` | Evidencia parcial (1-2 dimensiones por eje) o solo discurso + 1 acción |
| `low` | Principalmente discurso y propuestas, sin acciones suficientes para contrastar |

La confianza `low` es normal para **candidatos** que no han ejercido cargo.
La confianza `high` es esperable para **expresidentes** y **congresistas con trayectoria**.

## La elipse de incertidumbre

Aunque la figura cae visualmente en el centroide exacto de su celda, ninguna posición política es perfectamente puntual. El compass muestra una **elipse** alrededor de la posición evidenciada que representa el margen de incertidumbre del análisis dimensional:

- Confianza high → elipse pequeña (radio ~0.5)
- Confianza medium → elipse mediana (radio ~1.5)
- Confianza low → elipse grande (radio ~3.0)

La elipse puede extenderse hacia celdas vecinas, lo cual es intelectualmente honesto: una figura con confianza low en una celda concreta puede perfectamente estar en una celda adyacente sin que cambie nada esencial del análisis.

## De la posición a la ideología

El cálculo del compás termina con una coordenada `(x, y)` y un nivel de confianza. **La asignación de la etiqueta ideológica** (por ejemplo, `social-democracy`, `liberal-conservatism`) es un paso separado con su propia metodología: ver `ideology-classification`.

En breve:

- La ideología se deriva de la posición, no al revés.
- Se aplica la regla de proximidad geométrica flexible con justificación documentada.
- Cada asignación (`ideologySelfAssignment`, `ideologyEvidencedAssignment`) requiere justificación textual y al menos una fuente verificable.

## Validación automática

El validador `scripts/validate_dataset.py` chequea que cada figura tenga coherencia entre su `ideologyEvidenced` declarada y sus `dimensionScores` registrados. Específicamente, verifica que el `(x_avg, y_avg)` numérico calculado a partir de los scores **caiga en el cuadrante adecuado y a distancia razonable** del centroide de la celda asignada.

Tres tipos de incoherencia que el validador detecta:

1. **Etiqueta incorrecta**: el `(x_avg, y_avg)` numérico cae claramente en otro cuadrante o muy lejos del centroide de la celda asignada — la etiqueta `ideologyEvidenced` debería revisarse.
2. **Scores desactualizados**: tras una corrección humana de la etiqueta, los `dimensionScores` quedaron sin recalibrar.
3. **Inconsistencia genuina**: el actor tiene comportamiento contradictorio entre dimensiones — los scores extremos individuales se cancelan en el promedio. No es error; se documenta en la justificación textual.

Detalle completo del flujo y reportes históricos en [Validación del dataset](/metodologia/data-validation).

## Historial de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0.0 | 2026-04-10 | Versión inicial. |
| 1.1.0 | 2026-04-12 | Clarificación de fuentes: autopercibida solo de fuentes propias/Wikipedia; evidenciada es análisis propio del proyecto, no etiquetas de medios. |
| 1.2.0 | 2026-04-15 | La asignación de ideología (label) pasa a `ideology-classification` con fuentes obligatorias por asignación. El cálculo del compás (coordenadas x,y) permanece en este documento. |
| 1.3.0 | 2026-04-23 | Se introduce validador automático de coherencia entre coord y `dimensionScores` (umbral default 3.0 unidades). |
| 2.0.0 | 2026-04-23 | **Reescrita la sección "Las dos posiciones por figura"** para reflejar el modelo vigente ([ADR-003](/metodologia/adr-003-grid-completo-educativo)): la coordenada visual de cada figura es el **centroide exacto de la celda de su ideología declarada** (`ideologySelf` para la posición azul, `ideologyEvidenced` para la roja). Los `dimensionScores` y el `(x_avg, y_avg)` numérico siguen siendo el insumo evidencial que apoya la asignación de la etiqueta evidenciada, pero ya no determinan el píxel donde se dibuja la figura. Los partidos se ubican en el centroide de su `ideologies[0]`. |
