---
title: Validación del dataset
description: Cómo verificamos que las coordenadas del compás son coherentes con la evidencia documentada — un validador automático que corre como red de seguridad sobre todos los datos.
order: 25
section: compass
version: 2.0.0
lastUpdated: 2026-04-23
authors:
  - ssi-co
relatedDocs:
  - compass-scoring
  - ideology-classification
---

## ¿Por qué validar?

Cada figura política tiene tres elementos relacionados:

1. Una **etiqueta evidenciada** (`ideologyEvidenced`) — la corriente que el proyecto le asigna como mejor descripción de su comportamiento.
2. Ocho **dimensionScores** — análisis dimensión por dimensión con justificación y fuentes.
3. Una **coordenada visual** `compassEvidenced.{x, y}` — el centroide exacto de la celda de la etiqueta evidenciada.

Bajo el modelo vigente ([ADR-003](/metodologia/adr-003-grid-completo-educativo)) la coord visual es derivada automáticamente de la etiqueta — no necesita validarse contra los scores porque por construcción cae en el centroide. Lo que **sí** debe validarse es que la **etiqueta asignada sea coherente con los scores**: si los scores promediados apuntan a un cuadrante o zona muy distinta de la celda etiquetada, alguien se contradice consigo mismo.

## Cómo funciona

El script `scripts/validate_dataset.py` recorre los 8 archivos de actores en `packages/data/colombia/` y, para cada uno con `compassEvidenced.dimensionScores`:

1. Calcula el **promedio ponderado en X** con los pesos definidos en [Cómo posicionamos figuras](/metodologia/compass-scoring) — el `(x_avg, y_avg)` numérico que el análisis dimensional sugiere.
2. Calcula el **promedio ponderado en Y**.
3. Obtiene el centroide `(x_label, y_label)` de la celda de `ideologyEvidenced`.
4. Si la distancia entre `(x_avg, y_avg)` y `(x_label, y_label)` supera **3.0 unidades** (en escala de -10 a +10), emite un warning: la etiqueta y los scores divergen demasiado.

Una desviación de 3 implica que la etiqueta asignada y los scores cuentan historias distintas sobre la misma figura.

## Tres causas típicas de un warning

| Diagnóstico | Síntoma | Acción correcta |
|---|---|---|
| **Etiqueta `ideologyEvidenced` mal asignada** | scores robustos apuntan a un cuadrante (ej. `(x_avg, y_avg) = (-6, -3)` en lib-left) pero la etiqueta asignada está en otro (ej. `traditionalist-conservatism` en auth-right) | Cambiar `ideologyEvidenced` a la celda más cercana al `(x_avg, y_avg)` calculado |
| **Scores desactualizados** | una auditoría humana corrigió la etiqueta tras nueva evidencia, pero los scores quedaron como eran antes de esa corrección | Recalibrar los `dimensionScores` con fuentes nuevas para que reflejen la posición actual del actor |
| **Inconsistencia genuina** | el actor tiene comportamiento contradictorio entre dimensiones — los scores extremos individuales se cancelan en el promedio y producen un punto que no encaja con ninguna etiqueta clara | No es error: la justificación textual debe documentar la divergencia y la elección de etiqueta |

## El proceso en los datos del proyecto

Cuando se aplicó por primera vez el validador sobre los 110 políticos colombianos, **44 figuras tenían warnings** (40% del dataset). El análisis caso por caso reveló dos patrones predominantes:

- El clasificador automático había asignado coordenadas extremas (`x = ±9`) a figuras con scores moderados, especialmente para senadores de Alianza Verde y candidatos sin trayectoria larga.
- Las auditorías humanas previas habían reposicionado políticos en el mapa pero los `dimensionScores` no se habían recalibrado en correspondencia.

La solución se aplicó en dos pasadas:

1. **Pasada matemática automática** (`scripts/fix_validation_warnings.py`): para cada warning, se ajustaron los scores con un delta uniforme — coords como verdad, scores como variable de ajuste. Cero warnings tras la pasada.
2. **Pasada semántica con IA** (`scripts/apply_semantic_scores.py`): cuatro agentes IA paralelos reanalizaron los 110 políticos dimensión por dimensión basándose en evidencia pública (Seguridad Democrática para Uribe, Acuerdo de Paz para Santos, Paz Total para Petro, etc.). En 3 casos los scores semánticos contradijeron las coords previas — ahí la coord se ajustó al promedio semántico.

## Compromiso del proyecto

Cualquier figura que ingrese al dataset debe pasar `validate_dataset.py` con cero warnings antes del merge. Si el validador reporta una incoherencia, hay tres caminos válidos:

- Justificar la divergencia en `compassEvidenced.justification` (con fuentes que respalden por qué scores y coord cuentan historias distintas pero ambas reales).
- Recalibrar la coord al promedio de scores (si los scores son sólidos).
- Recalibrar los scores a la coord (si la coord viene de auditoría humana documentada).

Lo único **no válido** es publicar la incoherencia sin explicación. Toda figura visible en el compás tiene su `(x, y)` justificable contra los scores que el proyecto le asignó.

## Reportes auditables

Los reportes JSON en `docs/data-validation/` documentan el estado del dataset en momentos clave. Cualquier persona puede correr el validador localmente y comparar contra el último reporte para verificar la coherencia del dataset publicado.

```bash
python scripts/validate_dataset.py
python scripts/validate_dataset.py --threshold 2.0  # más estricto
python scripts/validate_dataset.py --json > out.json
```

El script no requiere dependencias externas — solo Python stdlib.

## Historial de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0.0 | 2026-04-23 | Versión inicial. Validador automático con threshold 3.0, fix matemático y aplicador de análisis semántico. Reportes históricos en `docs/data-validation/`. |
