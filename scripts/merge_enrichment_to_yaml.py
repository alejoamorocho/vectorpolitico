"""
Merge del enriquecimiento de las 135 ideologías al YAML fuente.

Carga 6 archivos JSON con campos enriquecidos (longDescription,
historicalContext, contemporaryRelevance, commonCriticisms, keyThinkers,
historicalExamples, wikipediaUrl) y los aplica a cada child del YAML
manteniendo la estructura del treemap (cuadrantes, familias, weight).

NO toca: id, name, nameEn, weight, description (corta original).
SÍ agrega/sobrescribe: los 7 campos enriquecidos.

Uso:
    python scripts/merge_enrichment_to_yaml.py [--dry-run]
"""

from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parent.parent
TMP = REPO / "tmp" / "enrichment"
YAML_PATH = REPO / "packages" / "data" / "ideologies.source.yaml"

# Archivos persistidos por agentes (auth_right A y B), formato wrap
TOOL_RESULTS_DIR = Path("C:/Users/aamor/.claude/projects/C--Proyectos-VectorPolitico/410bc753-9c63-4eef-9aa3-461b83605093/tool-results")
AUTH_RIGHT_A = TOOL_RESULTS_DIR / "toolu_01Lfe4jon421BGa7AoRia8D5.json"
AUTH_RIGHT_B = TOOL_RESULTS_DIR / "toolu_01MfehxU2XxkSYTfF8th4t38.json"

ENRICH_FIELDS = [
    "longDescription",
    "historicalContext",
    "contemporaryRelevance",
    "commonCriticisms",
    "keyThinkers",
    "historicalExamples",
    "wikipediaUrl",
]

# Posibles typos de campos (resolver en el merge)
FIELD_ALIASES = {
    "contemporanyRelevance": "contemporaryRelevance",
    "contemporanyrelevance": "contemporaryRelevance",
    "contempoaryRelevance": "contemporaryRelevance",
    "ccontemporaryRelevance": "contemporaryRelevance",
}


def normalize_historical_example(item) -> str:
    """historicalExamples puede venir como string o como dict {caso/case, pais/country, años/years}.
    Normalizar a string `"caso (pais, años)"`."""
    if isinstance(item, str):
        return item
    if isinstance(item, dict):
        # Soportar varias claves (en español o inglés)
        caso = item.get("caso") or item.get("case") or item.get("nombre") or item.get("name") or ""
        pais = item.get("pais") or item.get("país") or item.get("country") or ""
        anios = item.get("años") or item.get("años") or item.get("anios") or item.get("years") or item.get("year") or ""
        partes_meta = []
        if pais:
            partes_meta.append(str(pais))
        if anios:
            partes_meta.append(str(anios))
        if caso and partes_meta:
            return f"{caso} ({', '.join(partes_meta)})"
        if caso:
            return str(caso)
        # Fallback: serializar
        return json.dumps(item, ensure_ascii=False)
    return str(item)


def normalize_thinker(item) -> str:
    """keyThinkers puede venir como string o como dict {name, ...}. Normalizar a string."""
    if isinstance(item, str):
        return item
    if isinstance(item, dict):
        return str(item.get("name") or item.get("nombre") or json.dumps(item, ensure_ascii=False))
    return str(item)


def normalize_entry(entry: dict) -> dict:
    """Resuelve typos de field names y normaliza listas anidadas."""
    out = {}
    for k, v in entry.items():
        canonical = FIELD_ALIASES.get(k, k)
        if canonical == "historicalExamples" and isinstance(v, list):
            v = [normalize_historical_example(it) for it in v]
        elif canonical == "keyThinkers" and isinstance(v, list):
            v = [normalize_thinker(it) for it in v]
        out[canonical] = v
    return out


def load_simple_json(path: Path) -> list[dict]:
    """Carga archivo JSON simple `{"ideologies": [...]}`."""
    with path.open("r", encoding="utf-8") as f:
        d = json.load(f)
    return [normalize_entry(e) for e in d.get("ideologies", [])]


def load_wrapped_json(path: Path) -> list[dict]:
    """Carga JSON envuelto por tool-result `[{"type":"text","text":"```json\\n{...}```"}]`."""
    with path.open("r", encoding="utf-8") as f:
        wrap = json.load(f)
    text = wrap[0]["text"]
    s = text.find("{")
    e = text.rfind("}")
    obj = json.loads(text[s:e + 1])
    return [normalize_entry(en) for en in obj.get("ideologies", [])]


def load_all_enrichment() -> dict[str, dict]:
    """Carga las 135 entradas y las indexa por id."""
    by_id: dict[str, dict] = {}
    for p in [
        TMP / "auth_left.json",
        TMP / "lib_left_a.json",
        TMP / "lib_left_b.json",
        TMP / "lib_right.json",
    ]:
        for entry in load_simple_json(p):
            by_id[entry["id"]] = entry
    for p in [AUTH_RIGHT_A, AUTH_RIGHT_B]:
        for entry in load_wrapped_json(p):
            by_id[entry["id"]] = entry
    return by_id


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    enrichment = load_all_enrichment()
    print(f"[1/3] Cargadas {len(enrichment)} ideologías enriquecidas.")

    # Cargar YAML
    with YAML_PATH.open("r", encoding="utf-8") as f:
        source = yaml.safe_load(f)

    enriched_count = 0
    missing_in_yaml = []
    children_yaml_ids = set()

    # Recorrer los children del YAML y aplicar el enriquecimiento
    for q_name, q_data in source.get("quadrants", {}).items():
        for fam in q_data.get("families", []):
            for child in fam.get("children", []):
                cid = child.get("id")
                if cid:
                    children_yaml_ids.add(cid)
                if cid in enrichment:
                    e = enrichment[cid]
                    for field in ENRICH_FIELDS:
                        if field in e and e[field] not in (None, "", []):
                            child[field] = e[field]
                    enriched_count += 1

    # Reportar IDs que estaban en enrichment pero NO en el YAML
    for eid in enrichment:
        if eid not in children_yaml_ids:
            missing_in_yaml.append(eid)

    print(f"[2/3] Enriquecidos {enriched_count} children del YAML.")
    if missing_in_yaml:
        print(f"      Avisos: {len(missing_in_yaml)} ids del enrichment NO existen en YAML:")
        for x in missing_in_yaml:
            print(f"        - {x}")

    # IDs en YAML sin enrichment
    yaml_without_enrich = [c for c in children_yaml_ids if c not in enrichment]
    if yaml_without_enrich:
        print(f"      Avisos: {len(yaml_without_enrich)} children del YAML sin enrichment.")

    if args.dry_run:
        print("[3/3] Dry-run: no se escribió el YAML.")
        return 0

    # Escribir YAML preservando estructura
    # Usar yaml.dump con allow_unicode + default_flow_style=False
    with YAML_PATH.open("w", encoding="utf-8") as f:
        yaml.dump(
            source,
            f,
            allow_unicode=True,
            default_flow_style=False,
            sort_keys=False,
            width=100,
        )

    print(f"[3/3] YAML actualizado: {YAML_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
