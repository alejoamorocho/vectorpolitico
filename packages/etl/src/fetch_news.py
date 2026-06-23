"""Descarga noticias de GDELT 2.0 DOC API para figuras políticas.

GDELT es una API pública (no requiere key) que indexa noticias en tiempo
real de más de 65 idiomas desde 2013. Usamos el endpoint DOC que busca
en titulares y primer párrafo.

Docs: https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/

Uso:
    python -m src.fetch_news --country co
    python -m src.fetch_news --entity gustavo-petro --since 2024-01-01
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path

import httpx
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential

load_dotenv()

USER_AGENT = os.environ.get(
    "USER_AGENT", "brujula-politica/0.1 (+https://github.com/ssi-co/vectorpolitico)"
)

GDELT_DOC_API = "https://api.gdeltproject.org/api/v2/doc/doc"

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "news"


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=30))
def _query_gdelt(query: str, since: str, limit: int = 50) -> list[dict]:
    """Consulta GDELT con retry exponencial.

    GDELT no tiene rate limit documentado oficial pero es agresivo en la
    práctica. Usamos backoff exponencial con tenacity.
    """
    start_dt = datetime.fromisoformat(since)
    start_str = start_dt.strftime("%Y%m%d%H%M%S")
    end_str = datetime.now().strftime("%Y%m%d%H%M%S")

    params = {
        "query": query,
        "mode": "ArtList",
        "format": "json",
        "maxrecords": str(limit),
        "startdatetime": start_str,
        "enddatetime": end_str,
        "sort": "datedesc",
    }
    headers = {"User-Agent": USER_AGENT}

    with httpx.Client(timeout=30.0) as client:
        r = client.get(GDELT_DOC_API, params=params, headers=headers)
        r.raise_for_status()
        try:
            data = r.json()
        except json.JSONDecodeError:
            # GDELT a veces responde HTML en vez de JSON bajo stress
            return []

    articles = data.get("articles", [])
    return articles


def _hash_url(url: str) -> str:
    return hashlib.sha256(url.encode("utf-8")).hexdigest()[:16]


def fetch_for_entity(entity_id: str, display_name: str, since: str) -> int:
    """Descarga y guarda noticias de una figura. Devuelve número guardadas."""
    query = f'"{display_name}" sourcecountry:CO'
    try:
        articles = _query_gdelt(query, since)
    except Exception as e:
        print(f"[ERR] Error consultando GDELT para {entity_id}: {e}", file=sys.stderr)
        return 0

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    out_file = DATA_DIR / f"{entity_id}.json"

    normalized = []
    for a in articles:
        url = a.get("url", "")
        if not url:
            continue
        normalized.append(
            {
                "id": _hash_url(url),
                "entity_id": entity_id,
                "url": url,
                "title": a.get("title", ""),
                "outlet": a.get("domain", ""),
                "source_country": a.get("sourcecountry", ""),
                "language": a.get("language", ""),
                "published_at": a.get("seendate", "")[:10],
                "tone": None,
                "themes": None,
            }
        )

    with out_file.open("w", encoding="utf-8") as f:
        json.dump(normalized, f, ensure_ascii=False, indent=2)

    print(f"[OK]  {entity_id}: {len(normalized)} noticias guardadas en {out_file}")
    return len(normalized)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--country",
        default="colombia",
        help="Nombre del directorio de país bajo packages/data/ (ej. colombia)",
    )
    parser.add_argument("--entity", help="ID específico (opcional)")
    parser.add_argument(
        "--since",
        default=(datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d"),
        help="Fecha desde en formato YYYY-MM-DD",
    )
    args = parser.parse_args()

    data_dir = Path(__file__).resolve().parent.parent.parent / "data" / args.country
    if not data_dir.exists():
        print(f"[ERR] No existe: {data_dir}", file=sys.stderr)
        return 1

    # Cargar lista de figuras a procesar
    entities: list[tuple[str, str]] = []
    for file in data_dir.glob("*.json"):
        if file.name == "parties.json":
            continue
        with file.open("r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                continue
        if not isinstance(data, list):
            continue
        for item in data:
            eid = item.get("id")
            name = item.get("displayName")
            if not eid or not name:
                continue
            if args.entity and eid != args.entity:
                continue
            entities.append((eid, name))

    if not entities:
        print("[ERR] No hay figuras para procesar", file=sys.stderr)
        return 1

    print(f"Procesando {len(entities)} figura(s)...")
    total = 0
    for eid, name in entities:
        total += fetch_for_entity(eid, name, args.since)
        time.sleep(2)  # ser amable con GDELT

    print(f"\n=== {total} noticias totales guardadas ===")
    return 0


if __name__ == "__main__":
    sys.exit(main())
