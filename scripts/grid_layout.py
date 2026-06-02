"""
Layout de grilla LIMPIA (mosaico sin huecos ni solapes) para las ideologías,
ordenado por significado: filas = eje autoritario/libertario (Y), columnas =
eje económico izquierda/derecha (X).

Problema con el scatter de posiciones reales: celdas de tamaño fijo en
coordenadas reales se SUPERPONEN en zonas densas (un desastre visual).

Solución: mantener las posiciones reales SOLO para ORDENAR, y luego acomodar
las celdas en una grilla regular que llena cada cuadrante sin huecos:
  - Se ordenan las celdas del cuadrante por Y (autoritario arriba) y X.
  - Se reparten en R filas; cada fila ocupa todo el ancho del cuadrante
    dividido entre el número de celdas de esa fila (mosaico perfecto).
  - El eje vertical refleja autoritario↔libertario; el horizontal,
    izquierda↔derecha económica.

Lee las posiciones reales de real_compass_positions.POS para el orden.

Uso: python scripts/grid_layout.py [--dry-run]
"""

from __future__ import annotations
import argparse
import json
import math
import sys
from pathlib import Path

# Importar el dict de posiciones reales (orden de referencia)
sys.path.insert(0, str(Path(__file__).resolve().parent))
from real_compass_positions import POS  # noqa: E402

REPO = Path(__file__).resolve().parent.parent
JSON_PATH = REPO / "packages" / "data" / "ideologies.json"

# Bounds de cada cuadrante (x_min, y_min, x_max, y_max), y crece hacia arriba.
QUAD_BOUNDS = {
    "auth_left":  (-10.0, 0.0, 0.0, 10.0),
    "auth_right": (0.0, 0.0, 10.0, 10.0),
    "lib_left":   (-10.0, -10.0, 0.0, 0.0),
    "lib_right":  (0.0, -10.0, 10.0, 0.0),
}
QUAD_COLOR = {
    "auth_left": "#dc2626",
    "auth_right": "#2563eb",
    "lib_left": "#16a34a",
    "lib_right": "#eab308",
}


def quad_of(x: float, y: float) -> str:
    if y >= 0:
        return "auth_left" if x < 0 else "auth_right"
    return "lib_left" if x < 0 else "lib_right"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    by_id = {i["id"]: i for i in data}

    # Agrupar ideologías por cuadrante (según su posición real curada)
    quads: dict[str, list[str]] = {q: [] for q in QUAD_BOUNDS}
    for iid in by_id:
        pos = POS.get(iid)
        if pos is None:
            # fallback: usar el cuadrante actual del JSON
            q = by_id[iid].get("quadrant", "lib_right")
        else:
            q = quad_of(*pos)
        quads[q].append(iid)

    total = 0
    for q, ids in quads.items():
        x_min, y_min, x_max, y_max = QUAD_BOUNDS[q]
        qw = x_max - x_min
        qh = y_max - y_min
        n = len(ids)
        if n == 0:
            continue

        # Ordenar por Y descendente (más autoritario / menos libertario arriba),
        # luego por X ascendente (más a la izquierda primero).
        def sort_key(iid: str):
            px, py = POS.get(iid, (0.0, 0.0))
            return (-py, px)

        ordered = sorted(ids, key=sort_key)

        # Número de filas: cuadrado lo más posible
        rows = max(1, round(math.sqrt(n)))
        # Repartir n celdas en `rows` filas lo más parejo posible
        base = n // rows
        extra = n % rows
        row_counts = [base + (1 if r < extra else 0) for r in range(rows)]
        # Filas con más celdas arriba (más densidad autoritaria); está bien.

        idx = 0
        # Fila 0 = arriba (y alto). En data y alto = y_max.
        for r in range(rows):
            count = row_counts[r]
            if count == 0:
                continue
            # Banda vertical de esta fila
            cell_h = qh / rows
            # r=0 es la fila superior -> y entre (y_max - cell_h) y y_max
            row_y_top = y_max - r * cell_h
            row_y_bot = row_y_top - cell_h
            cy = (row_y_top + row_y_bot) / 2
            # Repartir el ancho entre las celdas de la fila
            cell_w = qw / count
            row_ids = ordered[idx: idx + count]
            # Dentro de la fila, ordenar por X ascendente (izq -> der)
            row_ids = sorted(row_ids, key=lambda iid: POS.get(iid, (0.0, 0.0))[0])
            for c, iid in enumerate(row_ids):
                left = x_min + c * cell_w
                cx = left + cell_w / 2
                cell = by_id[iid]
                cell["x"] = round(cx, 3)
                cell["y"] = round(cy, 3)
                cell["width"] = round(cell_w, 3)
                cell["height"] = round(cell_h, 3)
                cell["quadrant"] = q
                cell["color"] = QUAD_COLOR[q]
                total += 1
            idx += count

    print(f"Celdas acomodadas en grilla limpia: {total}/{len(data)}")
    for q, ids in quads.items():
        print(f"  {q}: {len(ids)} celdas")

    if args.dry_run:
        print("Dry-run: JSON no escrito.")
        return 0

    JSON_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"[OK] {JSON_PATH} actualizado.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
