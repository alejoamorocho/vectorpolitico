"""
Reposiciona partidos y políticos colombianos al centroide de sus ideologías
declaradas en el grid completo (135 celdas).

Política:
- **Partidos**: `compassPosition` = promedio de centroides de `ideologies[]`.
- **Políticos** (presidents, senators, etc.):
    * `compassSelfPerceived.{x,y}` = centroide de `ideologySelf` (si existe).
    * `compassEvidenced.{x,y}` = centroide de `ideologyEvidenced` (si existe).

Justificación: en el modelo educativo del proyecto (universo ideológico
completo de 135 corrientes), las coordenadas son **decisión simbólica** —
cada figura cae exactamente en la celda de su ideología declarada para que
el usuario pueda leer el mapa visualmente sin ambigüedad. Los
`dimensionScores` se conservan como evidencia auditable del análisis
dimensional pero no determinan la coord visual.

Uso:
    python scripts/reposition_actors_full_grid.py
    python scripts/reposition_actors_full_grid.py --dry-run
"""

from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path


def reposition_parties(parties: list[dict], by_id: dict, dry_run: bool) -> tuple[list, list]:
    """Reposiciona cada partido al centroide exacto de su ideología principal.

    La ideología principal es `ideologies[0]`. Promediar todas las ideologías
    declaradas era atractivo pero produce coords que caen entre celdas (ej. el
    promedio de [christian-democracy, traditionalist, social-gospel] cae sobre
    `constitutional-monarchism` aunque ninguna es esa). Para preservar el
    propósito educativo (cada partido en SU celda) usamos `ideologies[0]`.
    """
    changes, skipped = [], []
    for p in parties:
        ideos = p.get("ideologies") or []
        if not ideos:
            skipped.append((p["id"], "sin ideologies[]"))
            continue

        # Buscar la primera ideología que exista en el grid
        primary = None
        for iid in ideos:
            if iid in by_id:
                primary = iid
                break

        if primary is None:
            skipped.append((p["id"], f"ninguna ideología existe en grid: {ideos}"))
            continue

        ide = by_id[primary]
        new_x = round(ide["x"], 2)
        new_y = round(ide["y"], 2)

        cur = p.get("compassPosition", {})
        old_x = cur.get("x")
        old_y = cur.get("y")
        if old_x == new_x and old_y == new_y:
            continue

        changes.append({
            "id": p["id"],
            "primary": primary,
            "ideologies": ideos,
            "old": (old_x, old_y),
            "new": (new_x, new_y),
        })
        p["compassPosition"]["x"] = new_x
        p["compassPosition"]["y"] = new_y
    return changes, skipped


def reposition_politicians(data: list[dict], by_id: dict, fname: str) -> tuple[list, list]:
    """Reposiciona compassSelfPerceived y compassEvidenced de cada político."""
    changes, skipped = [], []
    for p in data:
        pid = p["id"]
        any_change = False
        record = {"id": pid, "file": fname, "self": None, "evid": None}

        # Self
        ideo_self = p.get("ideologySelf") or (p.get("ideologySelfAssignment") or {}).get("ideologyId")
        if ideo_self and ideo_self in by_id:
            ide = by_id[ideo_self]
            new_x, new_y = round(ide["x"], 2), round(ide["y"], 2)
            self_pos = p.setdefault("compassSelfPerceived", {})
            old = (self_pos.get("x"), self_pos.get("y"))
            if old != (new_x, new_y):
                self_pos["x"] = new_x
                self_pos["y"] = new_y
                record["self"] = {"old": old, "new": (new_x, new_y), "ideo": ideo_self}
                any_change = True
        elif ideo_self:
            skipped.append((pid, f"ideologySelf '{ideo_self}' no en grid"))

        # Evidenced
        ideo_evid = p.get("ideologyEvidenced") or (p.get("ideologyEvidencedAssignment") or {}).get("ideologyId")
        if ideo_evid and ideo_evid in by_id:
            ide = by_id[ideo_evid]
            new_x, new_y = round(ide["x"], 2), round(ide["y"], 2)
            evid_pos = p.setdefault("compassEvidenced", {})
            old = (evid_pos.get("x"), evid_pos.get("y"))
            if old != (new_x, new_y):
                evid_pos["x"] = new_x
                evid_pos["y"] = new_y
                record["evid"] = {"old": old, "new": (new_x, new_y), "ideo": ideo_evid}
                any_change = True
        elif ideo_evid:
            skipped.append((pid, f"ideologyEvidenced '{ideo_evid}' no en grid"))

        if any_change:
            changes.append(record)
    return changes, skipped


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    repo = Path(__file__).resolve().parent.parent
    grid_path = repo / "packages" / "data" / "ideologies.json"
    base = repo / "packages" / "data" / "colombia"

    with grid_path.open("r", encoding="utf-8") as f:
        grid = json.load(f)
    by_id = {ide["id"]: ide for ide in grid}
    print(f"Grid cargado: {len(grid)} celdas\n")

    # Partidos
    parties_path = base / "parties.json"
    with parties_path.open("r", encoding="utf-8") as f:
        parties = json.load(f)
    p_changes, p_skipped = reposition_parties(parties, by_id, args.dry_run)
    print(f"=== Partidos: {len(p_changes)} reposicionados, {len(p_skipped)} saltados ===")
    if not args.dry_run and p_changes:
        with parties_path.open("w", encoding="utf-8") as f:
            json.dump(parties, f, ensure_ascii=False, indent=2)
            f.write("\n")

    # Políticos por archivo
    politician_files = [
        "presidents.json", "vice-presidents.json", "candidates.json",
        "vp-candidates.json", "senators.json", "representatives.json",
        "governors.json", "mayors.json",
    ]
    total_pol_changes = 0
    total_pol_skipped = []
    for fname in politician_files:
        fpath = base / fname
        if not fpath.exists():
            continue
        with fpath.open("r", encoding="utf-8") as f:
            data = json.load(f)
        changes, skipped = reposition_politicians(data, by_id, fname)
        total_pol_changes += len(changes)
        total_pol_skipped.extend(skipped)
        if not args.dry_run and changes:
            with fpath.open("w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                f.write("\n")
        print(f"  {fname}: {len(changes)} con cambios")

    print(f"\n=== Políticos: {total_pol_changes} con cambios totales, {len(total_pol_skipped)} saltados ===")
    if total_pol_skipped:
        for sid, reason in total_pol_skipped[:10]:
            print(f"  - {sid}: {reason}")
        if len(total_pol_skipped) > 10:
            print(f"  ... y {len(total_pol_skipped) - 10} más")

    return 0


if __name__ == "__main__":
    sys.exit(main())
