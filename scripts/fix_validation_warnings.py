"""
Brújula Política — fix automático de warnings del validador
============================================================

Recorre todos los políticos y, para los que tienen desviación entre
`compassEvidenced.x|y` y el promedio ponderado de `dimensionScores`,
ajusta los scores sumando un delta uniforme para que el nuevo promedio
coincida con la coord reportada.

Filosofía: las coords son producto de auditoría humana en Fase 3 (mover
celdas, corregir bug del LLM original), los `dimensionScores` quedaron
con valores del clasificador automático sin actualizar. La verdad
post-auditoría son las coords; los scores se "ingenierizan al revés"
para mantener coherencia interna.

Mecánica:
  delta = coord_reportada - promedio_ponderado_actual
  new_score[d] = clamp(score[d] + delta, -10, +10)  para cada dim relevante

Si todos los scores son None (placeholder vacío), no se toca nada
(sería inventar evidencia).

Uso:
    python scripts/fix_validation_warnings.py
    python scripts/fix_validation_warnings.py --threshold 2.0
    python scripts/fix_validation_warnings.py --dry-run

No requiere dependencias externas.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Iterable

# Pesos por tipo (paridad con classify_entity.py)
DIMENSION_WEIGHTS = {
    "president": {
        "x": {"fiscalPolicy": 0.30, "marketPosition": 0.25, "socialPolicy": 0.25, "tradePolicy": 0.20},
        "y": {"civilRights": 0.30, "securityApproach": 0.25, "socialRights": 0.25, "powerConcentration": 0.20},
    },
    "senator": {
        "x": {"fiscalPolicy": 0.20, "marketPosition": 0.25, "socialPolicy": 0.25, "tradePolicy": 0.30},
        "y": {"civilRights": 0.30, "securityApproach": 0.25, "socialRights": 0.25, "powerConcentration": 0.20},
    },
}
for role in [
    "representative", "governor", "mayor", "vice_president",
    "presidential_candidate", "vp_candidate",
]:
    DIMENSION_WEIGHTS[role] = DIMENSION_WEIGHTS["senator"]

DEFAULT_THRESHOLD = 3.0

FILE_TYPE_HINT = {
    "presidents.json": "president",
    "vice-presidents.json": "vice_president",
    "candidates.json": "presidential_candidate",
    "vp-candidates.json": "vp_candidate",
    "senators.json": "senator",
    "representatives.json": "representative",
    "governors.json": "governor",
    "mayors.json": "mayor",
}

X_DIMENSIONS = ("fiscalPolicy", "marketPosition", "socialPolicy", "tradePolicy")
Y_DIMENSIONS = ("civilRights", "securityApproach", "socialRights", "powerConcentration")

CLAMP_MIN = -10.0
CLAMP_MAX = 10.0


def weighted_average(scores: dict, weights: dict) -> float:
    return sum((scores.get(d) or 0) * w for d, w in weights.items())


def clamp(v: float) -> float:
    return max(CLAMP_MIN, min(CLAMP_MAX, v))


def shift_scores(
    scores: dict,
    dimensions: Iterable[str],
    weights: dict,
    target_avg: float,
) -> tuple[dict, float]:
    """Suma un delta uniforme a las dimensiones para que el promedio = target_avg.

    Si una dimensión está clamped al límite [-10, +10], su delta efectivo es
    menor al esperado; en una segunda pasada se redistribuye el residuo a las
    dimensiones que aún tienen margen, para acercarse lo más posible al target.

    Devuelve (scores_actualizados, promedio_alcanzado).
    """
    new_scores = dict(scores)

    # No tocar si todos los scores relevantes son None
    relevant = [d for d in dimensions if scores.get(d) is not None]
    if not relevant:
        return new_scores, weighted_average(scores, weights)

    current_avg = weighted_average(scores, weights)
    delta = target_avg - current_avg

    # Primera pasada: delta uniforme con clamp
    pending: dict[str, float] = {}  # dim -> delta no aplicado por clamp
    for d in dimensions:
        if d not in scores or scores[d] is None:
            continue
        raw = (scores[d] or 0) + delta
        clamped = clamp(raw)
        new_scores[d] = clamped
        pending[d] = raw - clamped  # >0 si choco con +10, <0 si choco con -10

    # Si el clamp reduce el delta efectivo y aún hay residuo, redistribuir
    achieved = weighted_average(new_scores, weights)
    residual = target_avg - achieved
    if abs(residual) > 0.01:
        # Calcular cuánto delta más necesitamos en cada dim no clamped
        unclamped = [
            d for d in dimensions
            if d in scores and scores[d] is not None
            and CLAMP_MIN < new_scores[d] < CLAMP_MAX
        ]
        if unclamped:
            sum_w = sum(weights[d] for d in unclamped)
            if sum_w > 0:
                extra = residual / sum_w
                for d in unclamped:
                    raw = new_scores[d] + extra
                    new_scores[d] = clamp(raw)

    return new_scores, weighted_average(new_scores, weights)


def fix_politician(
    politician: dict,
    p_type: str,
    threshold: float,
) -> tuple[bool, list[str]]:
    """Aplica el fix in-place. Devuelve (changed, mensajes).

    Solo modifica `compassEvidenced.dimensionScores`. NO toca x/y de coord.
    """
    weights = DIMENSION_WEIGHTS.get(p_type, DIMENSION_WEIGHTS["senator"])
    evid = politician.get("compassEvidenced") or {}
    scores = evid.get("dimensionScores")

    if not scores:
        return False, ["sin dimensionScores; no aplicable"]

    x_reported = evid.get("x")
    y_reported = evid.get("y")
    if x_reported is None or y_reported is None:
        return False, ["sin coord reportada"]

    msgs = []
    changed = False

    # Fix eje X si supera umbral
    x_avg = weighted_average(scores, weights["x"])
    if abs(x_reported - x_avg) > threshold:
        new_scores, achieved = shift_scores(scores, X_DIMENSIONS, weights["x"], x_reported)
        if any(new_scores.get(d) != scores.get(d) for d in X_DIMENSIONS):
            for d in X_DIMENSIONS:
                if d in new_scores:
                    scores[d] = round(new_scores[d], 2)
            msgs.append(f"X ajustado: avg {x_avg:.2f} -> {achieved:.2f} (target {x_reported})")
            changed = True

    # Fix eje Y si supera umbral
    y_avg = weighted_average(scores, weights["y"])
    if abs(y_reported - y_avg) > threshold:
        new_scores, achieved = shift_scores(scores, Y_DIMENSIONS, weights["y"], y_reported)
        if any(new_scores.get(d) != scores.get(d) for d in Y_DIMENSIONS):
            for d in Y_DIMENSIONS:
                if d in new_scores:
                    scores[d] = round(new_scores[d], 2)
            msgs.append(f"Y ajustado: avg {y_avg:.2f} -> {achieved:.2f} (target {y_reported})")
            changed = True

    return changed, msgs


def run(repo_root: Path, threshold: float, dry_run: bool) -> dict:
    base = repo_root / "packages" / "data" / "colombia"

    summary = {
        "threshold": threshold,
        "dry_run": dry_run,
        "files_modified": [],
        "politicians_fixed": [],
        "no_change": [],
    }

    for fname, p_type in FILE_TYPE_HINT.items():
        fpath = base / fname
        if not fpath.exists():
            continue

        with fpath.open("r", encoding="utf-8") as f:
            data = json.load(f)

        any_changed = False
        for p in data:
            changed, msgs = fix_politician(p, p_type, threshold)
            if changed:
                summary["politicians_fixed"].append({
                    "id": p.get("id"),
                    "file": fname,
                    "type": p_type,
                    "changes": msgs,
                })
                any_changed = True
            elif msgs and "no aplicable" not in msgs[0] and "sin coord" not in msgs[0]:
                summary["no_change"].append({"id": p.get("id"), "file": fname, "reason": msgs[0]})

        if any_changed and not dry_run:
            with fpath.open("w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                f.write("\n")
            summary["files_modified"].append(fname)

    return summary


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--threshold", type=float, default=DEFAULT_THRESHOLD)
    parser.add_argument("--dry-run", action="store_true", help="No escribe archivos; solo reporta")
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path(__file__).resolve().parent.parent,
    )
    args = parser.parse_args()

    summary = run(args.repo_root, args.threshold, args.dry_run)

    print(f"=== Fix de warnings (threshold={summary['threshold']}, dry_run={summary['dry_run']}) ===")
    print()
    print(f"Politicos corregidos: {len(summary['politicians_fixed'])}")
    for p in summary["politicians_fixed"]:
        print(f"  [{p['type']}] {p['id']} ({p['file']})")
        for c in p["changes"]:
            print(f"    - {c}")
    print()
    if summary["no_change"]:
        print(f"Sin cambios (sin scores o coord): {len(summary['no_change'])}")
        for p in summary["no_change"]:
            print(f"  {p['id']} ({p['file']}): {p['reason']}")
    print()
    print(f"Archivos modificados: {summary['files_modified']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
