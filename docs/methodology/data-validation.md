# Validación automática del dataset

> **Versión:** 1.0.0  ·  **Última actualización:** 2026-04-23

## Propósito

Detectar incoherencias internas entre `compassEvidenced.x|y` y el promedio ponderado de `dimensionScores` en cada actor político del dataset. Sirve como red de seguridad contra:

1. **Bugs del clasificador automático** — históricamente Claude API asignó coordenadas extremas (`x = ±9`) a políticos cuyos `dimensionScores` eran moderados. El validador hace visible esa contradicción.
2. **Drift tras correcciones manuales** — cuando un revisor humano reposiciona la coord en el compás pero no recalibra los scores en correspondencia, el dataset queda internamente inconsistente.
3. **Errores de tipeo o de etl** — números mal copiados, signos invertidos.

## Cómo funciona

`scripts/validate_dataset.py` recorre los 8 archivos de actores en `packages/data/colombia/` y, para cada uno con `compassEvidenced.dimensionScores`:

1. Calcula el **promedio ponderado en X** con los pesos por tipo de cargo (mismos que `classify_entity.py`):
   - `president`: `fiscalPolicy=0.30, marketPosition=0.25, socialPolicy=0.25, tradePolicy=0.20`
   - `senator/representative/governor/mayor/candidate`: `fiscalPolicy=0.20, marketPosition=0.25, socialPolicy=0.25, tradePolicy=0.30`
2. Calcula el **promedio ponderado en Y**:
   - Todos los tipos: `civilRights=0.30, securityApproach=0.25, socialRights=0.25, powerConcentration=0.20`
3. Si `|x_reportado − x_promedio| > umbral` o `|y_reportado − y_promedio| > umbral`, **emite un warning**.

El umbral por defecto es **3.0 unidades** (en una escala de -10 a +10). Una desviación de 3 implica que la coord asignada y los scores cuentan historias muy distintas sobre el mismo actor.

## Uso

```bash
# Validación con umbral default (3.0)
python scripts/validate_dataset.py

# Más estricto (umbral 2.0)
python scripts/validate_dataset.py --threshold 2.0

# Output JSON machine-readable (para CI o post-procesamiento)
python scripts/validate_dataset.py --json > validation-report.json
```

**Exit code:**
- `0` — sin warnings (dataset coherente)
- `1` — al menos un warning (CI-ready)

No requiere dependencias externas: solo Python stdlib.

## Política frente a un warning

Cada warning describe una desviación pero **no la corrige**. La interpretación correcta depende del caso:

| Diagnóstico | Síntoma | Acción correcta |
|---|---|---|
| Bug del LLM original | scores diversos y bien justificados, pero coord extrema (`x=±9`) | Mover la coord al centroide de la celda real implicada por los scores |
| Drift por corrección manual | la coord fue parchada en una fase de auditoría humana, los scores quedaron sin actualizar | Recalibrar scores con `scripts/fix_validation_warnings.py` (ver abajo) |
| Inconsistencia genuina | el actor tiene un comportamiento contradictorio en distintas dimensiones — los scores son extremos pero el promedio queda en el centro | No es un error; documentar la divergencia en la `justification` |

## Fix automático (cuando aplica)

Para casos de drift por corrección manual — **donde la coord es la verdad post-auditoría y los scores son los obsoletos** — existe `scripts/fix_validation_warnings.py`. Suma un delta uniforme a los scores X o Y para que el promedio ponderado coincida con la coord reportada, con clamp `[-10, +10]`.

```bash
# Dry-run (no escribe archivos, solo reporta lo que cambiaría)
python scripts/fix_validation_warnings.py --dry-run

# Aplicar el fix
python scripts/fix_validation_warnings.py
```

**Limitación importante:** este fix garantiza coherencia matemática (el promedio cuadra con la coord), pero **no necesariamente fidelidad ideológica fina por dimensión**. Si los scores originales reflejaban un análisis detallado por dimensión (ej. `securityApproach=9` para un autoritario fuerte) y la coord parchada es moderada, el fix bajará todos los scores Y uniformemente, perdiendo el detalle. Para análisis ideológico de detalle por dimensión, los casos así requieren revisión humana específica.

Para el rendering visual del compás esto no afecta nada — solo se usa la coord `(x, y)`. Pero si en el futuro se quiere usar `dimensionScores` directamente (ej. radar charts por figura), conviene hacer pasada manual.

## Integración con `classify_entity.py`

El clasificador del pipeline ETL (`packages/etl/src/classify_entity.py`) incluye desde la versión actual un chequeo en línea: cada vez que clasifica un actor, calcula el delta entre `x|y` reportado y el promedio ponderado. Si supera `VERIFICATION_THRESHOLD = 3.0`:

- Agrega `_verification.warnings: [...]` al objeto.
- Emite `⚠️  INCOHERENCIA en <nombre>: ...` a stderr.
- Marca `_hasVerificationWarnings: true` a nivel raíz.

Esto detecta el bug en el momento de generar el dato, no después. La próxima clasificación masiva no requerirá auditoría post-hoc.

## Reportes históricos

Los reportes JSON guardados en `docs/data-validation/` documentan el estado del dataset en momentos clave:

- `2026-04-23-validation-report.json` — primer corrida del validador. 110 políticos, 44 warnings (40% del dataset).
- `2026-04-23-validation-report-after-fix.json` — tras aplicar `fix_validation_warnings.py`. 110 políticos, 0 warnings.

Estos archivos son auditables y permiten reconstruir el razonamiento detrás de cada commit de corrección.
