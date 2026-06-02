"""
Reemplaza las justificaciones genéricas/plantilla por texto honesto y único.

Problemas detectados:
- 33+ figuras comparten una justificación evidenciada IDÉNTICA que afirma
  falsamente "se ha verificado coherencia entre posición declarada y
  acciones legislativas concretas" / "análisis de votaciones en
  CongresoVisible" — un placeholder, no análisis real.
- Las justificaciones autopercibidas-plantilla tienen coordenadas viejas
  embebidas en el texto (ej. "(x=4.1, y=3.4)") que ya no corresponden.

Solución: detectar las plantillas por firma y regenerarlas con un texto
HONESTO por figura, basado en su partido e ideología declarada, que NO
pretende un análisis de votaciones que no se hizo. Las justificaciones
genuinas (no-plantilla) se conservan intactas.

Uso: python scripts/fix_generic_justifications.py [--dry-run]
"""

from __future__ import annotations
import argparse
import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
BASE = REPO / "packages" / "data" / "colombia"
GRID = REPO / "packages" / "data" / "ideologies.json"
PARTIES = REPO / "packages" / "data" / "colombia" / "parties.json"
FILES = ["presidents", "vice-presidents", "candidates", "vp-candidates",
         "senators", "representatives", "governors", "mayors"]

# Firmas que identifican una justificación-plantilla (no análisis real)
EVID_TEMPLATE_SIGNS = [
    "Posicionamiento basado en an", "Se ha verificado coherencia entre posici",
    "análisis de votaciones en CongresoVisible, iniciativas legislativas",
]
SELF_TEMPLATE_SIGNS = [
    "se presenta como miembro del",
]
COORD_RE = re.compile(r"\(x=[-\d.]+,?\s*y=[-\d.]+\)")


def has_sign(text: str, signs: list[str]) -> bool:
    return any(s in text for s in signs)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    grid = {i["id"]: i for i in json.loads(GRID.read_text(encoding="utf-8"))}
    parties = {p["id"]: p for p in json.loads(PARTIES.read_text(encoding="utf-8"))}

    def iname(iid: str) -> str:
        return grid.get(iid, {}).get("name", iid)

    def pname(pid: str | None) -> str | None:
        if not pid:
            return None
        return parties.get(pid, {}).get("name")

    self_fixed = evid_fixed = 0
    for fp in FILES:
        path = BASE / f"{fp}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        changed = False
        for p in data:
            name = p.get("fullName") or p.get("displayName") or p["id"]
            party = pname(p.get("party"))
            iself = p.get("ideologySelf")
            ievid = p.get("ideologyEvidenced")
            sp = p.get("compassSelfPerceived") or {}
            ep = p.get("compassEvidenced") or {}

            # ── Self ──
            sj = sp.get("justification", "")
            if iself and (has_sign(sj, SELF_TEMPLATE_SIGNS) or COORD_RE.search(sj)):
                miembro = f", de {party}," if party else ""
                sp["justification"] = (
                    f"{name}{miembro} se presenta públicamente alineado con "
                    f"«{iname(iself)}», según su discurso, plataforma y afiliación. "
                    f"Esta es su posición autopercibida —lo que declara ser— y no "
                    f"necesariamente coincide con la evidenciada por sus acciones."
                )
                self_fixed += 1
                changed = True

            # ── Evidenced ──
            ej = ep.get("justification", "")
            if ievid and has_sign(ej, EVID_TEMPLATE_SIGNS):
                conf = ep.get("confidence", "low")
                conf_txt = {
                    "high": "Posición respaldada por trayectoria pública amplia y registro consistente.",
                    "medium": "Posición derivada de su trayectoria pública y afiliación; evidencia parcial.",
                    "low": "Posición preliminar derivada de su afiliación partidaria y discurso; aún sin auditoría detallada de votaciones.",
                }.get(conf, "")
                ep["justification"] = (
                    f"Posición evidenciada de {name}, derivada de su trayectoria "
                    f"política, afiliación{' a ' + party if party else ''} y registro "
                    f"público disponible. Mejor descrita como «{iname(ievid)}». "
                    f"{conf_txt} Una auditoría sistemática de votaciones (CongresoVisible) "
                    f"y decretos profundizará esta ubicación."
                )
                evid_fixed += 1
                changed = True

        if changed and not args.dry_run:
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Justificaciones self regeneradas:  {self_fixed}")
    print(f"Justificaciones evidenced regeneradas: {evid_fixed}")
    if args.dry_run:
        print("Dry-run: nada escrito.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
