"""Generador de ideologies.json a partir de ideologies.source.yaml.

Aplica un algoritmo squarified treemap determinístico por cuadrante:
cada cuadrante del compass (10×10 unidades data) se subdivide en familias
proporcionales al `weight`, y cada familia se subdivide recursivamente en
celdas hijas. El resultado son rectángulos que cubren el cuadrante sin
gaps ni solapes.

Soporta un campo opcional `override: {x, y, width, height}` por celda para
fidelidad al layout de referencia (politicalcompass.org). Los overrides
anulan el auto-layout de esa celda.

Uso:
    python -m src.generate_ideologies
    python -m src.generate_ideologies --input path/to/source.yaml --output path/to/ideologies.json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import yaml
from pydantic import ValidationError

from .models import Ideology

# Rutas por defecto relativas al paquete etl/
_DEFAULT_INPUT = Path(__file__).resolve().parent.parent.parent / "data" / "ideologies.source.yaml"
_DEFAULT_OUTPUT = Path(__file__).resolve().parent.parent.parent / "data" / "ideologies.json"

# Cada cuadrante ocupa un rect 10×10 en coordenadas data
QUADRANT_BOUNDS = {
    # (x_min, y_min, x_max, y_max)  — y crece hacia arriba en data
    "auth_left":  (-10.0,   0.0,  0.0, 10.0),
    "auth_right": (  0.0,   0.0, 10.0, 10.0),
    "lib_left":   (-10.0, -10.0,  0.0,  0.0),
    "lib_right":  (  0.0, -10.0, 10.0,  0.0),
}

MIN_CELL_WIDTH = 0.8
MIN_CELL_HEIGHT = 0.6


# ─── Slice-and-dice treemap ─────────────────────────────────────────────────
#
# Alternativa a squarified treemap. Más simple y determinista: alterna
# dirección de corte en cada nivel. Garantiza cobertura exacta sin gaps
# ni solapamientos, a cambio de rects con aspect ratios menos cuadrados.
# Para un compass con labels, la legibilidad es más importante que el
# aspect ratio perfecto.


def _squarify(
    weights: list[float],
    rect: tuple[float, float, float, float],
    horizontal: bool = True,
) -> list[tuple[float, float, float, float]]:
    """Slice-and-dice treemap determinista.

    Divide el `rect` en tantos rects como `weights` tenga, proporcionales
    al peso. Si `horizontal=True` corta verticalmente (rects apilados
    horizontalmente), si no corta horizontalmente.
    """
    x0, y0, x1, y1 = rect
    total_w = sum(weights)
    if total_w <= 0 or not weights:
        return []

    rects: list[tuple[float, float, float, float]] = []

    if horizontal:
        # Cortar el ancho proporcionalmente — rects apilados lado a lado
        width = x1 - x0
        cx = x0
        for w in weights:
            cw = width * (w / total_w)
            rects.append((cx, y0, cx + cw, y1))
            cx += cw
        # Ajustar última celda para compensar drift por floats
        if rects:
            last = rects[-1]
            rects[-1] = (last[0], last[1], x1, last[3])
    else:
        # Cortar el alto proporcionalmente — rects apilados verticalmente
        height = y1 - y0
        cy = y0
        for w in weights:
            ch = height * (w / total_w)
            rects.append((x0, cy, x1, cy + ch))
            cy += ch
        if rects:
            last = rects[-1]
            rects[-1] = (last[0], last[1], last[2], y1)

    return rects


# ─── Pipeline YAML → ideologies.json ────────────────────────────────────────


def _apply_override(
    default: tuple[float, float, float, float],
    override: dict | None,
) -> tuple[float, float, float, float]:
    """override es {x, y, width, height} con (x,y) como centro de la celda."""
    if not override:
        return default
    cx = float(override["x"])
    cy = float(override["y"])
    w = float(override["width"])
    h = float(override["height"])
    return (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)


def _rect_to_center(rect: tuple[float, float, float, float]) -> tuple[float, float, float, float]:
    """Convierte (x_min, y_min, x_max, y_max) → (center_x, center_y, width, height)."""
    x0, y0, x1, y1 = rect
    return ((x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0)


def _process_quadrant(
    quadrant_key: str,
    quadrant_data: dict,
    allowed_ids: set[str] | None = None,
) -> list[Ideology]:
    bounds = QUADRANT_BOUNDS[quadrant_key]
    color = quadrant_data["color"]
    families = quadrant_data.get("families", [])

    # Filtro por país: elimina children no aplicables; si una familia
    # queda sin children, omite la familia entera.
    if allowed_ids is not None:
        filtered: list[dict] = []
        for f in families:
            kept = [c for c in f.get("children", []) if c["id"] in allowed_ids]
            if kept:
                filtered.append({**f, "children": kept})
        families = filtered

    # Nivel 1: familias apiladas VERTICALMENTE en el cuadrante (franjas horizontales)
    family_weights = [float(f.get("weight", 1)) for f in families]
    family_rects = _squarify(family_weights, bounds, horizontal=False)

    ideologies: list[Ideology] = []

    for fam, fam_rect in zip(families, family_rects, strict=True):
        children = fam.get("children", [])
        child_weights = [float(c.get("weight", 1)) for c in children]
        # Nivel 2: hijas apiladas HORIZONTALMENTE dentro de la franja de la familia
        child_rects = _squarify(child_weights, fam_rect, horizontal=True)

        for child, child_rect in zip(children, child_rects, strict=True):
            final_rect = _apply_override(child_rect, child.get("override"))
            cx, cy, w, h = _rect_to_center(final_rect)

            if w < MIN_CELL_WIDTH or h < MIN_CELL_HEIGHT:
                print(
                    f"⚠️  Celda '{child['id']}' muy pequeña ({w:.2f}×{h:.2f}). "
                    f"Considera aumentar su weight o eliminarla.",
                    file=sys.stderr,
                )

            try:
                ideology = Ideology(
                    id=child["id"],
                    name=child["name"],
                    nameEn=child.get("nameEn"),
                    x=round(cx, 3),
                    y=round(cy, 3),
                    width=round(w, 3),
                    height=round(h, 3),
                    quadrant=quadrant_key,  # type: ignore[arg-type]
                    color=color,
                    description=child["description"].strip(),
                    keyThinkers=child.get("keyThinkers"),
                    historicalExamples=child.get("historicalExamples"),
                )
            except ValidationError as e:
                print(f"❌ Error validando celda '{child['id']}':\n{e}", file=sys.stderr)
                sys.exit(1)

            ideologies.append(ideology)

    return ideologies


def _validate_no_overlaps(ideologies: list[Ideology]) -> None:
    """Verifica que las celdas no se solapen por cuadrante."""
    by_quadrant: dict[str, list[Ideology]] = {}
    for ide in ideologies:
        by_quadrant.setdefault(ide.quadrant, []).append(ide)

    for quadrant, cells in by_quadrant.items():
        for i, a in enumerate(cells):
            ax0 = a.x - a.width / 2
            ax1 = a.x + a.width / 2
            ay0 = a.y - a.height / 2
            ay1 = a.y + a.height / 2
            for b in cells[i + 1 :]:
                bx0 = b.x - b.width / 2
                bx1 = b.x + b.width / 2
                by0 = b.y - b.height / 2
                by1 = b.y + b.height / 2
                # Solapamiento con tolerancia de 0.01 para evitar falsos positivos por floats
                if ax0 < bx1 - 0.01 and ax1 > bx0 + 0.01 and ay0 < by1 - 0.01 and ay1 > by0 + 0.01:
                    print(
                        f"⚠️  Solapamiento detectado en '{quadrant}': "
                        f"{a.id} ↔ {b.id}",
                        file=sys.stderr,
                    )


def generate(input_path: Path, output_path: Path, country: str | None = None) -> int:
    with input_path.open("r", encoding="utf-8") as f:
        source = yaml.safe_load(f)

    if source.get("version") != 1:
        print(f"❌ Version esperada: 1, encontrada: {source.get('version')}", file=sys.stderr)
        return 1

    # Filtro por país si aplica
    allowed_ids: set[str] | None = None
    if country is not None:
        country_map = source.get("applicable_to_country", {}) or {}
        ids = country_map.get(country)
        if ids is None:
            print(
                f"[ERROR] No hay lista de IDs aplicables para pais '{country}' "
                f"en applicable_to_country. Agrega la lista en el YAML.",
                file=sys.stderr,
            )
            return 1
        allowed_ids = set(ids)
        msg = f"[INFO] Filtrando a {len(allowed_ids)} IDs del pais '{country}'\n"
        sys.stdout.buffer.write(msg.encode("utf-8"))

    all_ideologies: list[Ideology] = []
    for quadrant_key in ("auth_left", "auth_right", "lib_left", "lib_right"):
        if quadrant_key not in source["quadrants"]:
            print(f"⚠️  Cuadrante '{quadrant_key}' no definido en el YAML", file=sys.stderr)
            continue
        all_ideologies.extend(_process_quadrant(quadrant_key, source["quadrants"][quadrant_key], allowed_ids))

    _validate_no_overlaps(all_ideologies)

    # Serializar preservando orden estable por (quadrant, y, x)
    all_ideologies.sort(key=lambda i: (i.quadrant, -i.y, i.x))

    output_json = [i.model_dump(mode="json", exclude_none=True) for i in all_ideologies]

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(output_json, f, ensure_ascii=False, indent=2)
        f.write("\n")

    # Usar sys.stdout.buffer.write para evitar errores de cp1252 en Windows
    msg = f"[OK] {len(all_ideologies)} ideologias generadas en {output_path}\n"
    sys.stdout.buffer.write(msg.encode("utf-8"))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=_DEFAULT_INPUT, help="YAML source")
    parser.add_argument("--output", type=Path, default=_DEFAULT_OUTPUT, help="JSON output")
    parser.add_argument(
        "--country",
        type=str,
        default=None,
        help="Codigo ISO del pais para filtrar (ej: 'co'). Si None, genera grid global.",
    )
    args = parser.parse_args()

    return generate(args.input, args.output, country=args.country)


if __name__ == "__main__":
    sys.exit(main())
