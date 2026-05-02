"""
Aplica `dimensionScores` semánticamente analizados por 4 agentes IA
a los archivos correspondientes. NO toca compassEvidenced.x/y.

Datos hardcoded del output de los agentes A (presidents+VP+vp-candidates)
y D (representatives+governors+mayors). Los agentes B (candidates) y C
(senators) ya aplicaron sus cambios directamente al archivo.

Uso:
    python scripts/apply_semantic_scores.py
"""

from __future__ import annotations
import json
import sys
from pathlib import Path

# ── Output del Agente A: presidents + VP + vp-candidates ────────────────
SCORES_A = {
    # presidents.json
    "cesar-gaviria": {"fiscalPolicy": 7, "marketPosition": 8, "socialPolicy": 5, "tradePolicy": 9, "civilRights": -2, "securityApproach": 3, "socialRights": 1, "powerConcentration": 2},
    "ernesto-samper": {"fiscalPolicy": 2, "marketPosition": 3, "socialPolicy": -1, "tradePolicy": 5, "civilRights": 3, "securityApproach": 5, "socialRights": -1, "powerConcentration": 6},
    "andres-pastrana": {"fiscalPolicy": 7, "marketPosition": 7, "socialPolicy": 5, "tradePolicy": 7, "civilRights": 3, "securityApproach": 6, "socialRights": 6, "powerConcentration": 4},
    "alvaro-uribe": {"fiscalPolicy": 6, "marketPosition": 8, "socialPolicy": 5, "tradePolicy": 9, "civilRights": 7, "securityApproach": 9, "socialRights": 7, "powerConcentration": 8},
    "juan-manuel-santos": {"fiscalPolicy": 5, "marketPosition": 6, "socialPolicy": 4, "tradePolicy": 8, "civilRights": -1, "securityApproach": 3, "socialRights": 1, "powerConcentration": 3},
    "ivan-duque": {"fiscalPolicy": 6, "marketPosition": 7, "socialPolicy": 5, "tradePolicy": 6, "civilRights": 6, "securityApproach": 7, "socialRights": 5, "powerConcentration": 5},
    "gustavo-petro": {"fiscalPolicy": -6, "marketPosition": -5, "socialPolicy": -7, "tradePolicy": -3, "civilRights": -4, "securityApproach": -4, "socialRights": -6, "powerConcentration": 5},
    # vice-presidents.json
    "marta-lucia-ramirez": {"fiscalPolicy": 5, "marketPosition": 7, "socialPolicy": 5, "tradePolicy": 7, "civilRights": 4, "securityApproach": 5, "socialRights": 7, "powerConcentration": 3},
    "francia-marquez": {"fiscalPolicy": -5, "marketPosition": -4, "socialPolicy": -7, "tradePolicy": -3, "civilRights": -5, "securityApproach": -2, "socialRights": -7, "powerConcentration": 0},
    # vp-candidates.json
    "angela-maria-robledo": {"fiscalPolicy": -5, "marketPosition": -5, "socialPolicy": -6, "tradePolicy": -3, "civilRights": -7, "securityApproach": -5, "socialRights": -7, "powerConcentration": -2},
    "juan-carlos-pinzon": {"fiscalPolicy": 5, "marketPosition": 6, "socialPolicy": 4, "tradePolicy": 7, "civilRights": 3, "securityApproach": 8, "socialRights": 3, "powerConcentration": 4},
    "clara-lopez-obregon": {"fiscalPolicy": -3, "marketPosition": -3, "socialPolicy": -4, "tradePolicy": -2, "civilRights": -4, "securityApproach": -3, "socialRights": -5, "powerConcentration": -1},
    "marelen-castillo": {"fiscalPolicy": 4, "marketPosition": 4, "socialPolicy": 2, "tradePolicy": 3, "civilRights": 1, "securityApproach": 3, "socialRights": 2, "powerConcentration": 2},
    "rodrigo-lara-sanchez": {"fiscalPolicy": 4, "marketPosition": 4, "socialPolicy": 2, "tradePolicy": 3, "civilRights": 2, "securityApproach": 4, "socialRights": 1, "powerConcentration": 2},
    "nelson-alarcon": {"fiscalPolicy": -7, "marketPosition": -6, "socialPolicy": -7, "tradePolicy": -4, "civilRights": -1, "securityApproach": -2, "socialRights": -2, "powerConcentration": 1},
    "maria-consuelo-del-rio": {"fiscalPolicy": -4, "marketPosition": -4, "socialPolicy": -5, "tradePolicy": -3, "civilRights": -4, "securityApproach": -2, "socialRights": -5, "powerConcentration": -1},
    "aida-quilcue": {"fiscalPolicy": -6, "marketPosition": -6, "socialPolicy": -7, "tradePolicy": -7, "civilRights": -4, "securityApproach": -3, "socialRights": -5, "powerConcentration": -2},
    "luz-maria-zapata": {"fiscalPolicy": -2, "marketPosition": -1, "socialPolicy": -2, "tradePolicy": -1, "civilRights": -3, "securityApproach": -1, "socialRights": -2, "powerConcentration": -2},
    "adriana-ramirez": {"fiscalPolicy": 5, "marketPosition": 6, "socialPolicy": 4, "tradePolicy": 5, "civilRights": -2, "securityApproach": 2, "socialRights": -1, "powerConcentration": 0},
    "luisa-fernanda-villegas": {"fiscalPolicy": 7, "marketPosition": 7, "socialPolicy": 5, "tradePolicy": 6, "civilRights": 5, "securityApproach": 7, "socialRights": 5, "powerConcentration": 5},
    "juan-daniel-oviedo": {"fiscalPolicy": 5, "marketPosition": 6, "socialPolicy": 4, "tradePolicy": 5, "civilRights": 0, "securityApproach": 3, "socialRights": 0, "powerConcentration": 2},
}

# ── Output del Agente D: representatives + governors + mayors ───────────
SCORES_D = {
    # representatives.json
    "katherine-miranda": {"fiscalPolicy": 2, "marketPosition": 2, "socialPolicy": -2, "tradePolicy": 3, "civilRights": -5, "securityApproach": -1, "socialRights": -4, "powerConcentration": -2},
    "alirio-uribe-munoz": {"fiscalPolicy": -3, "marketPosition": -2, "socialPolicy": -3, "tradePolicy": -2, "civilRights": -2, "securityApproach": -1, "socialRights": -2, "powerConcentration": 1},
    "catherine-juvinao": {"fiscalPolicy": 8, "marketPosition": 9, "socialPolicy": 8, "tradePolicy": 10, "civilRights": -2, "securityApproach": 0, "socialRights": -2, "powerConcentration": -1},
    "jennifer-pedraza": {"fiscalPolicy": -2, "marketPosition": -2, "socialPolicy": -3, "tradePolicy": -1, "civilRights": -1, "securityApproach": 0, "socialRights": -2, "powerConcentration": -1},
    "gabriel-becerra": {"fiscalPolicy": -4, "marketPosition": -4, "socialPolicy": -5, "tradePolicy": 0, "civilRights": -4, "securityApproach": 1, "socialRights": -4, "powerConcentration": 1},
    # governors.json
    "andres-julian-rendon": {"fiscalPolicy": 5, "marketPosition": 7, "socialPolicy": 5, "tradePolicy": 7, "civilRights": 1, "securityApproach": 6, "socialRights": 2, "powerConcentration": 2},
    "carlos-amaya": {"fiscalPolicy": -1, "marketPosition": 0, "socialPolicy": -3, "tradePolicy": 0, "civilRights": -4, "securityApproach": -2, "socialRights": -4, "powerConcentration": -2},
    "dilian-francisca-toro": {"fiscalPolicy": 3, "marketPosition": 3, "socialPolicy": 2, "tradePolicy": 2, "civilRights": 1, "securityApproach": 3, "socialRights": 2, "powerConcentration": 4},
    "eduardo-verano": {"fiscalPolicy": 8, "marketPosition": 8, "socialPolicy": 8, "tradePolicy": 9, "civilRights": -2, "securityApproach": -1, "socialRights": -2, "powerConcentration": 1},
    "henry-gutierrez-caldas": {"fiscalPolicy": -2, "marketPosition": -2, "socialPolicy": -3, "tradePolicy": -1, "civilRights": -2, "securityApproach": -1, "socialRights": -2, "powerConcentration": 2},
    "jorge-rey": {"fiscalPolicy": 4, "marketPosition": 5, "socialPolicy": 4, "tradePolicy": 5, "civilRights": 0, "securityApproach": 2, "socialRights": 1, "powerConcentration": 1},
    "juvenal-diaz-santander": {"fiscalPolicy": 3, "marketPosition": 3, "socialPolicy": 3, "tradePolicy": 4, "civilRights": 1, "securityApproach": 4, "socialRights": 2, "powerConcentration": 3},
    "luis-alfonso-escobar-narino": {"fiscalPolicy": -2, "marketPosition": -2, "socialPolicy": -3, "tradePolicy": -2, "civilRights": -2, "securityApproach": -1, "socialRights": -2, "powerConcentration": 2},
    "octavio-guzman": {"fiscalPolicy": 8, "marketPosition": 9, "socialPolicy": 9, "tradePolicy": 9, "civilRights": -1, "securityApproach": -1, "socialRights": -1, "powerConcentration": 1},
    "rafaela-cortes-meta": {"fiscalPolicy": -1, "marketPosition": 0, "socialPolicy": -3, "tradePolicy": 0, "civilRights": -3, "securityApproach": -1, "socialRights": -3, "powerConcentration": 0},
    "rodrigo-villalba-huila": {"fiscalPolicy": -5, "marketPosition": -5, "socialPolicy": -5, "tradePolicy": -4, "civilRights": -3, "securityApproach": 0, "socialRights": -2, "powerConcentration": 1},
    "uribe-gobernador": {"fiscalPolicy": 1, "marketPosition": 0, "socialPolicy": 0, "tradePolicy": 0, "civilRights": 8, "securityApproach": 9, "socialRights": 7, "powerConcentration": 6},
    "william-villamizar-nortesantander": {"fiscalPolicy": 3, "marketPosition": 3, "socialPolicy": 3, "tradePolicy": 4, "civilRights": 1, "securityApproach": 4, "socialRights": 2, "powerConcentration": 3},
    "yamil-arana-bolivar": {"fiscalPolicy": -1, "marketPosition": -1, "socialPolicy": -3, "tradePolicy": 0, "civilRights": -2, "securityApproach": -1, "socialRights": -2, "powerConcentration": 1},
    # mayors.json
    "alejandro-eder": {"fiscalPolicy": 5, "marketPosition": 8, "socialPolicy": 5, "tradePolicy": 9, "civilRights": 0, "securityApproach": 4, "socialRights": 1, "powerConcentration": 3},
    "alex-char": {"fiscalPolicy": 3, "marketPosition": 4, "socialPolicy": 0, "tradePolicy": 2, "civilRights": 2, "securityApproach": 5, "socialRights": 1, "powerConcentration": 5},
    "alexander-baquero-villavicencio": {"fiscalPolicy": 4, "marketPosition": 5, "socialPolicy": 4, "tradePolicy": 5, "civilRights": 2, "securityApproach": 5, "socialRights": 2, "powerConcentration": 4},
    "carlos-fernando-galan": {"fiscalPolicy": 2, "marketPosition": 3, "socialPolicy": 2, "tradePolicy": 3, "civilRights": -3, "securityApproach": 3, "socialRights": -2, "powerConcentration": -1},
    "claudia-lopez": {"fiscalPolicy": -2, "marketPosition": -1, "socialPolicy": -4, "tradePolicy": 0.5, "civilRights": -2, "securityApproach": 1, "socialRights": -2, "powerConcentration": -1},
    "dumek-turbay": {"fiscalPolicy": 8, "marketPosition": 9, "socialPolicy": 8, "tradePolicy": 10, "civilRights": -1, "securityApproach": 0, "socialRights": -1, "powerConcentration": 1},
    "federico-gutierrez-medellin": {"fiscalPolicy": 4, "marketPosition": 5, "socialPolicy": 4, "tradePolicy": 5, "civilRights": 3, "securityApproach": 6, "socialRights": 5, "powerConcentration": 1},
    "jaime-andres-beltran": {"fiscalPolicy": 7, "marketPosition": 8, "socialPolicy": 8, "tradePolicy": 10, "civilRights": 3, "securityApproach": 3, "socialRights": 4, "powerConcentration": 4},
    "jairo-yanez-cucuta": {"fiscalPolicy": 3, "marketPosition": 3, "socialPolicy": 3, "tradePolicy": 4, "civilRights": 1, "securityApproach": 4, "socialRights": 2, "powerConcentration": 3},
    "johana-aranda-ibague": {"fiscalPolicy": 4, "marketPosition": 5, "socialPolicy": 3, "tradePolicy": 4, "civilRights": 2, "securityApproach": 5, "socialRights": 2, "powerConcentration": 3},
    "jorge-ivan-ospina": {"fiscalPolicy": -3, "marketPosition": -2, "socialPolicy": -4, "tradePolicy": 0, "civilRights": -3, "securityApproach": 0, "socialRights": -3, "powerConcentration": 0},
    "mauricio-salazar-pereira": {"fiscalPolicy": 4, "marketPosition": 5, "socialPolicy": 4, "tradePolicy": 5, "civilRights": 3, "securityApproach": 5, "socialRights": 3, "powerConcentration": 2},
    "petro-alcalde-bogota": {"fiscalPolicy": -5, "marketPosition": -5, "socialPolicy": -6, "tradePolicy": -9, "civilRights": 5, "securityApproach": 2, "socialRights": -2, "powerConcentration": 5},
}

FILE_FOR_ID: dict[str, str] = {}
ALL_SCORES = {**SCORES_A, **SCORES_D}


def main() -> int:
    base = Path(__file__).resolve().parent.parent / "packages" / "data" / "colombia"
    files_to_process = [
        "presidents.json",
        "vice-presidents.json",
        "vp-candidates.json",
        "representatives.json",
        "governors.json",
        "mayors.json",
    ]

    applied = 0
    not_found = []

    for fname in files_to_process:
        fpath = base / fname
        if not fpath.exists():
            print(f"[skip] {fname} no existe")
            continue
        with fpath.open("r", encoding="utf-8") as f:
            data = json.load(f)
        changed = False
        for p in data:
            pid = p.get("id")
            if pid in ALL_SCORES:
                new_scores = ALL_SCORES[pid]
                evid = p.setdefault("compassEvidenced", {})
                evid["dimensionScores"] = {**evid.get("dimensionScores", {}), **new_scores}
                changed = True
                applied += 1
                FILE_FOR_ID[pid] = fname
        if changed:
            with fpath.open("w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                f.write("\n")
            print(f"[ok] {fname} actualizado")

    expected_ids = set(ALL_SCORES.keys())
    found_ids = set(FILE_FOR_ID.keys())
    missing = expected_ids - found_ids
    if missing:
        print(f"[warn] IDs no encontrados en archivos: {missing}")

    print(f"\nTotal aplicados: {applied}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
