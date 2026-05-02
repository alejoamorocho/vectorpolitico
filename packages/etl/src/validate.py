"""Validador de JSONs en packages/data/**.

Usa los modelos Pydantic de `models.py` para validar que cada archivo
cumple el schema. Corre en CI en cada PR que toque packages/data/**.

Uso:
    python -m src.validate <path1> [<path2> ...]

Ejemplos:
    python -m src.validate ../data/colombia ../data/ideologies.json
    python -m src.validate ../data/colombia/presidents.json
"""

from __future__ import annotations

import argparse
import io
import json
import sys
from pathlib import Path

from pydantic import ValidationError

from .models import Entity, Ideology, Party

# Forzar stdout UTF-8 en Windows (cp1252 no soporta muchos caracteres)
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", line_buffering=True)
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", line_buffering=True)

ENTITY_FILES = {
    "presidents.json",
    "vice-presidents.json",
    "presidential_candidates.json",
    "candidates.json",
    "vp-candidates.json",
    "senators.json",
    "representatives.json",
    "governors.json",
    "mayors.json",
}


def _load_json(path: Path) -> object:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _validate_file(path: Path) -> tuple[int, int]:
    """Devuelve (validados_ok, errores)."""
    rel = path.name
    ok = 0
    err = 0

    try:
        data = _load_json(path)
    except json.JSONDecodeError as e:
        print(f"[ERR] {path}: JSON invalido - {e}")
        return 0, 1

    if rel == "ideologies.json":
        if not isinstance(data, list):
            print(f"[ERR] {path}: se esperaba un array")
            return 0, 1
        for i, item in enumerate(data):
            try:
                Ideology.model_validate(item)
                ok += 1
            except ValidationError as e:
                print(f"[ERR] {path}[{i}] ({item.get('id', '?')}):\n{e}")
                err += 1
    elif rel == "parties.json":
        if not isinstance(data, list):
            print(f"[ERR] {path}: se esperaba un array")
            return 0, 1
        for i, item in enumerate(data):
            try:
                Party.model_validate(item)
                ok += 1
            except ValidationError as e:
                print(f"[ERR] {path}[{i}] ({item.get('id', '?')}):\n{e}")
                err += 1
    elif rel in ENTITY_FILES:
        if not isinstance(data, list):
            print(f"[ERR] {path}: se esperaba un array")
            return 0, 1
        for i, item in enumerate(data):
            if not isinstance(item, dict):
                print(f"[ERR] {path}[{i}]: se esperaba un objeto")
                err += 1
                continue
            try:
                Entity.model_validate(item)
                ok += 1
            except ValidationError as e:
                print(f"[ERR] {path}[{i}] ({item.get('id', '?')}):\n{e}")
                err += 1
    else:
        print(f"[SKIP] {path}: archivo desconocido, omitido")
        return 0, 0

    if err == 0:
        print(f"[OK]  {path}: {ok} items validos")
    return ok, err


def _validate_path(path: Path) -> tuple[int, int]:
    if path.is_file():
        return _validate_file(path)
    if path.is_dir():
        total_ok = 0
        total_err = 0
        for f in sorted(path.rglob("*.json")):
            if "node_modules" in f.parts or ".wrangler" in f.parts:
                continue
            ok, err = _validate_file(f)
            total_ok += ok
            total_err += err
        return total_ok, total_err
    print(f"[ERR] No existe: {path}")
    return 0, 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "paths",
        nargs="+",
        type=Path,
        help="Archivos o directorios a validar",
    )
    args = parser.parse_args()

    total_ok = 0
    total_err = 0
    for p in args.paths:
        ok, err = _validate_path(p)
        total_ok += ok
        total_err += err

    print()
    print(f"=== Resumen: {total_ok} validos, {total_err} errores ===")
    return 0 if total_err == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
