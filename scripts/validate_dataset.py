"""
Brújula Política — validador de coherencia del dataset
======================================================

Recorre todos los JSON de políticos y verifica que `compassEvidenced.x` y
`compassEvidenced.y` son consistentes con el promedio ponderado de
`dimensionScores`. Si la desviación supera VERIFICATION_THRESHOLD, reporta
el caso como warning.

Uso:
    python scripts/validate_dataset.py
    python scripts/validate_dataset.py --threshold 2.0   # umbral más estricto
    python scripts/validate_dataset.py --json            # output como JSON

No requiere dependencias externas (solo stdlib). Pesos de dimensiones
copiados de packages/etl/src/classify_entity.py para mantener paridad.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from collections import Counter

# Pesos por tipo de actor (copiado de classify_entity.py)
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
# Otros tipos heredan los pesos de senator
for role in [
    "representative", "governor", "mayor", "vice_president",
    "presidential_candidate", "vp_candidate",
]:
    DIMENSION_WEIGHTS[role] = DIMENSION_WEIGHTS["senator"]

DEFAULT_THRESHOLD = 3.0

# Mapa de archivos → tipo de actor (para inferir pesos cuando type no está)
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


def weighted_average(scores: dict, weights: dict) -> float:
    """Calcula el promedio ponderado de un set de dimensiones.

    Si una dimensión es None, su contribución es 0 (peso desperdiciado).
    """
    if not scores:
        return 0.0
    return sum((scores.get(dim) or 0) * w for dim, w in weights.items())


def load_ideologies_grid(repo_root: Path) -> list[dict]:
    """Carga el grid actual para resolver `find_cell` por punto."""
    path = repo_root / "packages" / "data" / "ideologies.json"
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def find_cell(x: float | None, y: float | None, grid: list[dict]) -> str:
    """Devuelve el id de la celda del grid que contiene (x, y), o 'FUERA'."""
    if x is None or y is None:
        return "SIN_COORDS"
    for ide in grid:
        x0 = ide["x"] - ide["width"] / 2
        x1 = ide["x"] + ide["width"] / 2
        y0 = ide["y"] - ide["height"] / 2
        y1 = ide["y"] + ide["height"] / 2
        if x0 <= x <= x1 and y0 <= y <= y1:
            return ide["id"]
    return "FUERA"


def analyze_politician(politician: dict, file_hint: str, grid: list[dict], threshold: float) -> dict:
    """Analiza un solo político y devuelve el reporte de su coherencia.

    Estructura del reporte:
        {
            "id": str,
            "type": str,
            "warnings": [str, ...],
            "self": {"x", "y", "cell"} | None,
            "evidenced": {"x", "y", "cell", "x_avg", "y_avg", "x_delta", "y_delta"} | None,
        }
    """
    pid = politician.get("id", "<sin id>")
    p_type = politician.get("type") or FILE_TYPE_HINT.get(file_hint, "senator")
    weights = DIMENSION_WEIGHTS.get(p_type, DIMENSION_WEIGHTS["senator"])

    report: dict = {"id": pid, "type": p_type, "warnings": []}

    # compassSelfPerceived (no se valida contra dimensionScores; solo reporta celda)
    self_pos = politician.get("compassSelfPerceived") or {}
    if self_pos.get("x") is not None and self_pos.get("y") is not None:
        report["self"] = {
            "x": self_pos["x"],
            "y": self_pos["y"],
            "cell": find_cell(self_pos["x"], self_pos["y"], grid),
        }

    # compassEvidenced — aquí sí validamos
    evid = politician.get("compassEvidenced") or {}
    scores = evid.get("dimensionScores") or {}
    if evid.get("x") is None or evid.get("y") is None:
        report["evidenced"] = None
        return report

    x_reported = evid["x"]
    y_reported = evid["y"]
    x_avg = weighted_average(scores, weights["x"])
    y_avg = weighted_average(scores, weights["y"])
    x_delta = abs(x_reported - x_avg)
    y_delta = abs(y_reported - y_avg)

    report["evidenced"] = {
        "x": x_reported,
        "y": y_reported,
        "cell": find_cell(x_reported, y_reported, grid),
        "x_avg": round(x_avg, 2),
        "y_avg": round(y_avg, 2),
        "x_delta": round(x_delta, 2),
        "y_delta": round(y_delta, 2),
    }

    # Sin scores (todos None) no podemos validar — reporta como info, no warning
    has_scores = any(v is not None for v in scores.values())
    if not has_scores:
        report["warnings"].append("dimensionScores vacío; no se puede validar consistencia.")
        return report

    if x_delta > threshold:
        report["warnings"].append(
            f"x={x_reported} se desvía {x_delta:.2f} del promedio ponderado "
            f"de scores ({x_avg:.2f}). Umbral: {threshold}."
        )
    if y_delta > threshold:
        report["warnings"].append(
            f"y={y_reported} se desvía {y_delta:.2f} del promedio ponderado "
            f"de scores ({y_avg:.2f}). Umbral: {threshold}."
        )

    return report


def run(repo_root: Path, threshold: float) -> dict:
    """Recorre los 8 archivos de políticos y produce el reporte completo."""
    grid = load_ideologies_grid(repo_root)
    base = repo_root / "packages" / "data" / "colombia"

    all_reports: list[dict] = []
    by_file: dict[str, list[dict]] = {}

    for fname in FILE_TYPE_HINT:
        fpath = base / fname
        if not fpath.exists():
            continue
        with fpath.open("r", encoding="utf-8") as f:
            data = json.load(f)
        file_reports = [analyze_politician(p, fname, grid, threshold) for p in data]
        by_file[fname] = file_reports
        all_reports.extend(file_reports)

    # Stats agregadas
    total = len(all_reports)
    with_warnings = [r for r in all_reports if r["warnings"]]
    cells_self: Counter[str] = Counter()
    cells_evid: Counter[str] = Counter()
    for r in all_reports:
        if "self" in r:
            cells_self[r["self"]["cell"]] += 1
        if r.get("evidenced"):
            cells_evid[r["evidenced"]["cell"]] += 1

    return {
        "threshold": threshold,
        "summary": {
            "total_politicians": total,
            "with_warnings": len(with_warnings),
            "no_warnings": total - len(with_warnings),
            "cells_distribution_self": dict(cells_self.most_common()),
            "cells_distribution_evidenced": dict(cells_evid.most_common()),
        },
        "warnings": [
            {
                "id": r["id"],
                "type": r["type"],
                "issues": r["warnings"],
                "evidenced": r.get("evidenced"),
            }
            for r in with_warnings
        ],
        "by_file_counts": {fname: len(reps) for fname, reps in by_file.items()},
    }


def print_human(report: dict) -> None:
    """Imprime el reporte en formato legible por humanos."""
    s = report["summary"]
    print()
    print(f"=== Validación de dataset (threshold={report['threshold']}) ===")
    print(f"Total políticos analizados: {s['total_politicians']}")
    print(f"  con warnings: {s['with_warnings']}")
    print(f"  sin warnings: {s['no_warnings']}")
    print()
    print("Por archivo:")
    for fname, n in report["by_file_counts"].items():
        print(f"  {fname:<30} {n}")
    print()
    print("Top celdas (compassEvidenced):")
    for cell, n in list(s["cells_distribution_evidenced"].items())[:10]:
        print(f"  {cell:<32} {n}")
    print()
    if report["warnings"]:
        print(f"=== {len(report['warnings'])} warnings ===")
        for w in report["warnings"]:
            print(f"\n  [{w['type']}] {w['id']}")
            for issue in w["issues"]:
                print(f"    - {issue}")
            if w.get("evidenced"):
                e = w["evidenced"]
                print(
                    f"    (cae en {e['cell']}; reportado x={e['x']} y={e['y']}; "
                    f"avg x={e['x_avg']} y={e['y_avg']})"
                )
    else:
        print("[OK] Ningún político supera el umbral. Dataset coherente.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--threshold",
        type=float,
        default=DEFAULT_THRESHOLD,
        help=f"Umbral de desviación que dispara warning (default: {DEFAULT_THRESHOLD})",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output como JSON en stdout (machine-readable)",
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path(__file__).resolve().parent.parent,
        help="Ruta al root del monorepo",
    )
    args = parser.parse_args()

    report = run(args.repo_root, args.threshold)

    if args.json:
        json.dump(report, sys.stdout, ensure_ascii=False, indent=2)
        print()
    else:
        print_human(report)

    # Exit code 0 si pasa, 1 si hay warnings (para CI futuro)
    return 0 if not report["warnings"] else 1


if __name__ == "__main__":
    sys.exit(main())
