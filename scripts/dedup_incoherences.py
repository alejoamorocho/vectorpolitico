"""
Deduplica incoherencias casi-idénticas dentro de cada figura política.

Los agentes que generaron las incoherencias produjeron a veces varias
entradas sobre el MISMO tema con redacción ligeramente distinta (ej.
petro-alcalde tiene 3 sobre las ciclorrutas/500 km). Este script las
fusiona: agrupa por similitud del texto de la promesa (Jaccard de tokens
normalizados) y conserva una sola por grupo — la de mayor severidad y
con acción más detallada.

Uso: python scripts/dedup_incoherences.py [--dry-run]
"""

from __future__ import annotations
import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
BASE = REPO / "packages" / "data" / "colombia"
FILES = ["presidents", "vice-presidents", "candidates", "vp-candidates",
         "senators", "representatives", "governors", "mayors"]

SEVERITY_RANK = {"low": 0, "medium": 1, "high": 2}
STOP = set("de la el los las y en a para con por un una que del al su sus".split())
SIM_THRESHOLD = 0.38  # Jaccard de tokens >= 0.5 => mismo tema


def norm_tokens(text: str) -> set[str]:
    t = unicodedata.normalize("NFD", text.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    t = re.sub(r"[0-9]+", "", t)             # quitar números (500 km vs 120 km)
    t = re.sub(r"[^a-z\s]", " ", t)
    toks = [w for w in t.split() if w not in STOP and len(w) > 2]
    return set(toks)


def jaccard(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def proposal_text(inc: dict) -> str:
    p = inc.get("proposal")
    if isinstance(p, dict):
        return p.get("text", "")
    return str(p or inc.get("promise", ""))


def action_len(inc: dict) -> int:
    a = inc.get("action")
    if isinstance(a, dict):
        return len(a.get("text", ""))
    return len(str(a or ""))


def dedup(incoherences: list[dict]) -> tuple[list[dict], int]:
    """Devuelve (lista_deduplicada, num_removidas)."""
    kept: list[dict] = []
    kept_tokens: list[set[str]] = []
    removed = 0
    for inc in incoherences:
        toks = norm_tokens(proposal_text(inc))
        match_idx = -1
        for i, kt in enumerate(kept_tokens):
            if jaccard(toks, kt) >= SIM_THRESHOLD:
                match_idx = i
                break
        if match_idx == -1:
            kept.append(inc)
            kept_tokens.append(toks)
        else:
            removed += 1
            # Conservar la "mejor": mayor severidad, luego acción más detallada
            cur = kept[match_idx]
            cur_score = (SEVERITY_RANK.get(cur.get("severity", "low"), 0), action_len(cur))
            new_score = (SEVERITY_RANK.get(inc.get("severity", "low"), 0), action_len(inc))
            if new_score > cur_score:
                kept[match_idx] = inc
                kept_tokens[match_idx] = toks
    return kept, removed


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    total_removed = 0
    for fp in FILES:
        path = BASE / f"{fp}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        changed = False
        for p in data:
            inc = p.get("incoherences") or []
            if len(inc) < 2:
                continue
            deduped, removed = dedup(inc)
            if removed > 0:
                p["incoherences"] = deduped
                total_removed += removed
                changed = True
                print(f"  {fp}/{p['id']}: {len(inc)} -> {len(deduped)} (-{removed})")
        if changed and not args.dry_run:
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"\nTotal incoherencias duplicadas removidas: {total_removed}")
    if args.dry_run:
        print("Dry-run: nada escrito.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
