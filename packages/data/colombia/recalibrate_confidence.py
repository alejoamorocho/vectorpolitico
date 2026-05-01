"""Recalibrar el campo confidence en compassEvidenced (y compassPosition para partidos)
según la rúbrica volumen + diversidad de evidencia aprobada por el owner.

Rúbrica:
  Señales:
    S = # fuentes primarias únicas en compassEvidenced
    I = # incoherencias documentadas (con proposal + action)
    Y = años de actividad pública (sumados de periods)
    R = # roles distintos ejercidos (unicidad de role en periods)

  Puntaje ponderado:
    score = min(S, 6) * 2          # hasta 12 pts
          + min(I, 5) * 3          # hasta 15 pts
          + min(Y, 15)             # hasta 15 pts
          + min(R - 1, 4) * 2      # hasta 8 pts por multirol
          + ejecutivo_bonus        # 6 pts si ejerció presidencia/gobernación/alcaldía completada

  Rangos:
    high   >= 28
    medium 15 – 27
    low    <  15

Los partidos usan una variante:
    score = min(S, 6) * 2
          + min(I, 5) * 3
          + min(años_existencia, 20) * 0.5
          + bonus_representacion (6 si tiene representación legislativa actual)

Uso: python3 recalibrate_confidence.py
"""
from __future__ import annotations

import json
from datetime import date
from pathlib import Path

BASE = Path(__file__).parent
TODAY = date(2026, 4, 15)

ENTITY_FILES = [
    "presidents.json",
    "candidates.json",
    "senators.json",
    "representatives.json",
    "governors.json",
    "mayors.json",
]


def years_from_periods(periods: list[dict]) -> float:
    total = 0.0
    for p in periods or []:
        start = p.get("startDate")
        end = p.get("endDate") or TODAY.isoformat()
        if not start:
            continue
        try:
            sd = date.fromisoformat(start)
            ed = date.fromisoformat(end)
        except ValueError:
            continue
        total += max(0, (ed - sd).days / 365.25)
    return total


def unique_roles(periods: list[dict]) -> int:
    return len({p.get("role") for p in periods or [] if p.get("role")})


def has_completed_executive_term(periods: list[dict]) -> bool:
    for p in periods or []:
        if p.get("role") in {"president", "governor", "mayor"} and p.get("endDate"):
            try:
                if date.fromisoformat(p["endDate"]) < TODAY:
                    return True
            except ValueError:
                continue
    return False


def compute_score_entity(entity: dict) -> tuple[int, str]:
    evidenced = entity.get("compassEvidenced", {}) or {}
    sources = evidenced.get("sources", []) or []
    incoh = entity.get("incoherences", []) or []
    periods = entity.get("periods", []) or []

    S = len(sources)
    I = len(incoh)
    Y = years_from_periods(periods)
    R = unique_roles(periods)

    score = 0
    score += min(S, 6) * 2
    score += min(I, 5) * 3
    score += int(min(Y, 15))
    score += min(max(R - 1, 0), 4) * 2
    exec_bonus = 6 if has_completed_executive_term(periods) else 0
    score += exec_bonus

    if score >= 28:
        confidence = "high"
    elif score >= 15:
        confidence = "medium"
    else:
        confidence = "low"
    return score, confidence


def compute_score_party(party: dict) -> tuple[int, str]:
    pos = party.get("compassPosition", {}) or {}
    sources = pos.get("sources", []) or []
    incoh = party.get("incoherences", []) or []

    S = len(sources)
    I = len(incoh)
    founded = party.get("foundingYear") or party.get("founded") or None
    years_ex = 0.0
    if founded:
        try:
            years_ex = TODAY.year - int(str(founded)[:4])
        except Exception:
            years_ex = 0.0

    # representación legislativa: si tiene figuras con role senator/representative en la fecha actual.
    has_rep = bool(party.get("currentSeats") or party.get("legislativeSeats"))

    score = 0
    score += min(S, 6) * 2
    score += min(I, 5) * 3
    score += int(min(years_ex, 20) * 0.5)
    if has_rep:
        score += 6

    if score >= 22:
        confidence = "high"
    elif score >= 12:
        confidence = "medium"
    else:
        confidence = "low"
    return score, confidence


def main():
    print("=== Recalibrando confidence con rúbrica volumen+diversidad ===\n")
    before_totals = {"high": 0, "medium": 0, "low": 0}
    after_totals = {"high": 0, "medium": 0, "low": 0}

    for fname in ENTITY_FILES:
        fpath = BASE / fname
        data = json.loads(fpath.read_text(encoding="utf-8"))
        changed = 0
        dist = {"high": 0, "medium": 0, "low": 0}
        for ent in data:
            prev = (ent.get("compassEvidenced", {}) or {}).get("confidence", "low")
            before_totals[prev] = before_totals.get(prev, 0) + 1
            score, new_conf = compute_score_entity(ent)
            if prev != new_conf:
                ent["compassEvidenced"]["confidence"] = new_conf
                changed += 1
            dist[new_conf] += 1
            after_totals[new_conf] += 1
        fpath.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{fname}: {len(data)} entidades, {changed} cambios → {dist}")

    # Parties (compassPosition, not compassEvidenced)
    pfile = BASE / "parties.json"
    parties = json.loads(pfile.read_text(encoding="utf-8"))
    pchanged = 0
    pdist = {"high": 0, "medium": 0, "low": 0}
    for p in parties:
        prev = (p.get("compassPosition", {}) or {}).get("confidence")
        score, new_conf = compute_score_party(p)
        if "compassPosition" in p:
            if prev != new_conf:
                p["compassPosition"]["confidence"] = new_conf
                pchanged += 1
            pdist[new_conf] += 1
    pfile.write_text(json.dumps(parties, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"parties.json: {len(parties)} partidos, {pchanged} cambios → {pdist}")

    print("\n=== Distribución post-recalibración ===")
    print(f"Entidades: {after_totals}")
    print(f"Partidos:  {pdist}")


if __name__ == "__main__":
    main()
