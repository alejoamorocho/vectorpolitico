"""Sincroniza JSONs validados de packages/data/** a Cloudflare D1.

Genera un archivo SQL con INSERT ... ON CONFLICT DO UPDATE y lo ejecuta
vía `wrangler d1 execute`. Es idempotente — puede correrse múltiples
veces sin crear duplicados.

Uso:
    python -m src.sync_to_d1 --env staging --dir ../data/colombia
    python -m src.sync_to_d1 --env production --dir ../data/colombia --dry-run
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

from .models import Entity, Ideology, Party

ENTITY_FILES = {
    "presidents.json",
    "vice-presidents.json",
    "candidates.json",
    "vp-candidates.json",
    "senators.json",
    "representatives.json",
    "governors.json",
    "mayors.json",
}


def _escape_sql(value: str | None) -> str:
    if value is None:
        return "NULL"
    return "'" + value.replace("'", "''") + "'"


def _dimension_score(v: float) -> str:
    return f"{v:.3f}"


def _ideology_to_sql(i: Ideology) -> str:
    thinkers = json.dumps(i.keyThinkers or [], ensure_ascii=False)
    examples = json.dumps(i.historicalExamples or [], ensure_ascii=False)
    return (
        "INSERT INTO ideologies (id, name, name_en, x, y, width, height, quadrant, color, description, key_thinkers, historical_examples) "
        f"VALUES ({_escape_sql(i.id)}, {_escape_sql(i.name)}, {_escape_sql(i.nameEn)}, "
        f"{i.x}, {i.y}, {i.width}, {i.height}, {_escape_sql(i.quadrant)}, {_escape_sql(i.color)}, "
        f"{_escape_sql(i.description)}, {_escape_sql(thinkers)}, {_escape_sql(examples)}) "
        "ON CONFLICT(id) DO UPDATE SET "
        "name=excluded.name, name_en=excluded.name_en, x=excluded.x, y=excluded.y, "
        "width=excluded.width, height=excluded.height, quadrant=excluded.quadrant, "
        "color=excluded.color, description=excluded.description, "
        "key_thinkers=excluded.key_thinkers, historical_examples=excluded.historical_examples;"
    )


def _party_to_sql(p: Party) -> str:
    ideologies = json.dumps(p.ideologies, ensure_ascii=False)
    return (
        "INSERT INTO parties (id, country, name, full_name, color, logo_url, founded_year, dissolved_year, description, ideologies, last_updated) "
        f"VALUES ({_escape_sql(p.id)}, {_escape_sql(p.country)}, {_escape_sql(p.name)}, "
        f"{_escape_sql(p.fullName)}, {_escape_sql(p.color)}, {_escape_sql(str(p.logoUrl) if p.logoUrl else None)}, "
        f"{p.foundedYear or 'NULL'}, {p.dissolvedYear or 'NULL'}, {_escape_sql(p.description)}, "
        f"{_escape_sql(ideologies)}, {_escape_sql(p.lastUpdated.isoformat())}) "
        "ON CONFLICT(id) DO UPDATE SET "
        "name=excluded.name, full_name=excluded.full_name, color=excluded.color, "
        "description=excluded.description, ideologies=excluded.ideologies, "
        "last_updated=excluded.last_updated;"
    )


def _entity_to_sql(e: Entity) -> list[str]:
    """Retorna una lista de statements (entidad + períodos + incoherencias)."""
    stmts: list[str] = []
    ideologies = json.dumps(e.ideologies, ensure_ascii=False)

    stmts.append(
        "INSERT INTO entities (id, country, type, full_name, display_name, photo_url, party_id, "
        "self_x, self_y, self_justification, self_sources, "
        "evidenced_x, evidenced_y, evidenced_justification, evidenced_sources, evidenced_confidence, "
        "fiscal_policy, market_position, social_policy, trade_policy, "
        "civil_rights, security_approach, social_rights, power_concentration, "
        "ideologies, bio, last_updated) "
        f"VALUES ({_escape_sql(e.id)}, {_escape_sql(e.country)}, {_escape_sql(e.type)}, "
        f"{_escape_sql(e.fullName)}, {_escape_sql(e.displayName)}, "
        f"{_escape_sql(str(e.photoUrl) if e.photoUrl else None)}, "
        f"{_escape_sql(e.party)}, "
        f"{e.compassSelfPerceived.x}, {e.compassSelfPerceived.y}, "
        f"{_escape_sql(e.compassSelfPerceived.justification)}, "
        f"{_escape_sql(json.dumps([s.model_dump(mode='json') for s in e.compassSelfPerceived.sources], ensure_ascii=False))}, "
        f"{e.compassEvidenced.x}, {e.compassEvidenced.y}, "
        f"{_escape_sql(e.compassEvidenced.justification)}, "
        f"{_escape_sql(json.dumps([s.model_dump(mode='json') for s in e.compassEvidenced.sources], ensure_ascii=False))}, "
        f"{_escape_sql(e.compassEvidenced.confidence)}, "
        f"{_dimension_score(e.compassEvidenced.dimensionScores.fiscalPolicy)}, "
        f"{_dimension_score(e.compassEvidenced.dimensionScores.marketPosition)}, "
        f"{_dimension_score(e.compassEvidenced.dimensionScores.socialPolicy)}, "
        f"{_dimension_score(e.compassEvidenced.dimensionScores.tradePolicy)}, "
        f"{_dimension_score(e.compassEvidenced.dimensionScores.civilRights)}, "
        f"{_dimension_score(e.compassEvidenced.dimensionScores.securityApproach)}, "
        f"{_dimension_score(e.compassEvidenced.dimensionScores.socialRights)}, "
        f"{_dimension_score(e.compassEvidenced.dimensionScores.powerConcentration)}, "
        f"{_escape_sql(ideologies)}, {_escape_sql(e.bio)}, "
        f"{_escape_sql(e.lastUpdated.isoformat())}) "
        "ON CONFLICT(id) DO UPDATE SET "
        "self_x=excluded.self_x, self_y=excluded.self_y, "
        "evidenced_x=excluded.evidenced_x, evidenced_y=excluded.evidenced_y, "
        "evidenced_confidence=excluded.evidenced_confidence, "
        "last_updated=excluded.last_updated;"
    )

    # Reemplazar períodos (delete + insert para idempotencia)
    stmts.append(f"DELETE FROM periods WHERE entity_id = {_escape_sql(e.id)};")
    for p in e.periods:
        stmts.append(
            "INSERT INTO periods (entity_id, role, start_date, end_date, region, elected_with) "
            f"VALUES ({_escape_sql(e.id)}, {_escape_sql(p.role)}, "
            f"{_escape_sql(p.startDate.isoformat())}, "
            f"{_escape_sql(p.endDate.isoformat() if p.endDate else None)}, "
            f"{_escape_sql(p.region)}, {p.electedWith if p.electedWith is not None else 'NULL'});"
        )

    return stmts


def generate_sql(data_dir: Path, ideologies_path: Path) -> str:
    """Genera todas las statements SQL a aplicar."""
    all_stmts: list[str] = ["BEGIN TRANSACTION;"]

    # 1. Ideologías
    if ideologies_path.exists():
        with ideologies_path.open("r", encoding="utf-8") as f:
            items = json.load(f)
        for raw in items:
            ide = Ideology.model_validate(raw)
            all_stmts.append(_ideology_to_sql(ide))

    # 2. Partidos
    parties_file = data_dir / "parties.json"
    if parties_file.exists():
        with parties_file.open("r", encoding="utf-8") as f:
            items = json.load(f)
        for raw in items:
            p = Party.model_validate(raw)
            all_stmts.append(_party_to_sql(p))

    # 3. Entidades
    for fname in ENTITY_FILES:
        fpath = data_dir / fname
        if not fpath.exists():
            continue
        with fpath.open("r", encoding="utf-8") as f:
            items = json.load(f)
        for raw in items:
            e = Entity.model_validate(raw)
            all_stmts.extend(_entity_to_sql(e))

    all_stmts.append("COMMIT;")
    return "\n".join(all_stmts)


def apply_with_wrangler(sql_file: Path, db_name: str, env: str | None) -> int:
    """Ejecuta el archivo SQL via wrangler d1 execute."""
    cmd = [
        "wrangler",
        "d1",
        "execute",
        db_name,
        "--remote",
        f"--file={sql_file}",
    ]
    if env:
        cmd.extend(["--env", env])
    print(f"Ejecutando: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=Path(__file__).resolve().parent.parent.parent / "apps" / "api")
    return result.returncode


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--env", choices=["staging", "production"], required=True)
    parser.add_argument("--dir", type=Path, required=True, help="Directorio con los JSON")
    parser.add_argument("--ideologies", type=Path, default=None)
    parser.add_argument("--dry-run", action="store_true", help="Solo generar el SQL, no aplicar")
    parser.add_argument("--output", type=Path, default=Path("./sync.sql"))
    args = parser.parse_args()

    ideologies_path = args.ideologies or (args.dir.parent / "ideologies.json")

    sql = generate_sql(args.dir, ideologies_path)
    args.output.write_text(sql, encoding="utf-8")
    print(f"[OK]  SQL generado en {args.output} ({len(sql.splitlines())} statements)")

    if args.dry_run:
        print("[DRY-RUN] No se aplica a D1")
        return 0

    db_name = "brujula-politica" if args.env == "production" else "brujula-politica-staging"
    env_flag = None if args.env == "production" else "staging"
    return apply_with_wrangler(args.output, db_name, env_flag)


if __name__ == "__main__":
    sys.exit(main())
