---
title: Validación del dataset
description: Cómo verificamos que las coordenadas del compás son coherentes con la evidencia documentada — un validador automático que corre como red de seguridad sobre todos los datos.
order: 25
section: compass
version: 1.0.0
lastUpdated: 2026-04-23
authors:
  - ssi-co
relatedDocs:
  - compass-scoring
  - ideology-classification
---

## ¿Por qué validar?

Cada figura política en el compás tiene dos cosas:

1. Una **coordenada** `(x, y)` que la ubica en el mapa visual.
2. Ocho **dimensionScores** que descomponen esa posición por dimensión (política fiscal, mercado, derechos civiles, seguridad, etc.).

La coord debería ser el **promedio ponderado** de los scores. Si no lo es, alguien se contradice consigo mismo: o el análisis dimensional está mal, o la posición visual está mal, o ambos.

El proyecto usa un **validador automático** que detecta estas contradicciones para que ningún punto quede sin justificación documentada por dimensión.

## Cómo funciona

El script `scripts/validate_dataset.py` recorre los 8 archivos de actores en `packages/data/colombia/` y, para cada uno con `compassEvidenced.dimensionScores`:

1. Calcula el **promedio ponderado en X** con los pesos definidos en [Cómo posicionamos figuras](/metodologia/compass-scoring).
2. Calcula el **promedio ponderado en Y** con los pesos sociales.
3. Compara con `compassEvidenced.x` e `y`.
4. Si la desviación supera **3.0 unidades** (en una escala de -10 a +10), emite un **warning**.

Una desviación de 3 implica que la posición asignada y los scores cuentan historias muy distintas sobre la misma figura.

## Tres causas típicas de un warning

| Diagnóstico | Síntoma | Acción correcta |
|---|---|---|
| **Bug del clasificador automático** | scores diversos y bien justificados, pero coord extrema (`x = ±9` cuando el promedio es moderado) | Mover la coord al centroide de la celda real implicada por los scores |
| **Drift por corrección manual** | una auditoría humana movió la coord pero los scores quedaron sin actualizar | Recalibrar scores (sumar delta uniforme a las dimensiones) |
| **Inconsistencia genuina** | el actor tiene comportamiento contradictorio entre dimensiones — los scores extremos individuales se cancelan en el promedio | No es error: documentar la divergencia en la justificación textual |

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
