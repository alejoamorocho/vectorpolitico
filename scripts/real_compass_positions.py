"""
Asigna a cada ideología su posición REAL en el political compass.

Problema: el treemap auto-layout empaca cada familia como una fila que ocupa
todo el ancho del cuadrante, así que la X de cada celda refleja orden de
empaque, no posición económica real (social-democracy quedaba en x=-7 cuando
es centro-izquierda ~-3; minarchism quedaba al centro cuando es extrema
derecha ~+8).

Solución: post-procesar ideologies.json sobrescribiendo (x, y) con
coordenadas curadas del political compass estándar (politicalcompass.org /
polcompball), y dar a cada celda un tamaño uniforme moderado. El resultado es
un "scatter" de celdas en sus posiciones reales — cada ideología donde un
lector informado la ubicaría.

Eje X (económico): -10 izquierda (estado/colectivo) .. +10 derecha (mercado).
Eje Y (social):    -10 libertario .. +10 autoritario.

Uso: python scripts/real_compass_positions.py [--dry-run]
"""

from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
JSON_PATH = REPO / "packages" / "data" / "ideologies.json"

# Tamaño uniforme de celda (unidades de data). El grid es 20x20 (-10..10).
TILE_W = 1.9
TILE_H = 1.7

# Posiciones reales (x, y) por ideología. Curadas según el political compass.
POS: dict[str, tuple[float, float]] = {
    # ───────────── AUTH-LEFT (x<0, y>0) ─────────────
    "hive-mind-collectivism": (-9.0, 9.3),
    "ingsocism": (-7.0, 9.4),
    "eco-fascism": (4.5, 9.6),  # etnonacionalismo autoritario -> auth-right extremo
    "stalinism": (-7.5, 8.6),
    "maoism": (-8.5, 8.2),
    "leninism": (-7.8, 7.6),
    "trotskyism": (-8.6, 7.0),
    "juche": (-6.5, 9.2),
    "anti-revisionism": (-8.2, 7.8),
    "ho-chi-minh-thought": (-7.6, 7.4),
    "dengism": (-3.5, 6.8),  # mercado + partido único
    "titoism": (-6.0, 6.0),
    "castroism": (-7.4, 7.2),
    "chavism": (-6.6, 6.4),
    "orthodox-marxism": (-8.4, 5.5),
    "national-bolshevism": (-4.0, 8.8),
    "strasserism": (-2.5, 8.6),
    "monarcho-communism": (-5.0, 8.5),
    "posadism": (-7.0, 6.6),
    "socialist-transhumanism": (-5.5, 5.0),
    "fully-automated-luxury-communism": (-6.5, 4.0),
    "state-capitalism": (-2.0, 6.5),
    "baathism": (-3.0, 7.6),
    "mugabeism": (-2.6, 8.0),
    "conservative-socialism": (-3.2, 5.6),
    "social-gospel": (-3.8, 3.6),
    "futurism": (-1.5, 7.0),
    "liberation-theology": (-5.2, 3.2),
    "collectivism": (-6.0, 4.6),
    "left-populism": (-5.6, 3.0),
    "distributism": (-2.2, 2.6),  # tercera vía católica, cerca del centro
    "labourism": (-3.6, 2.0),
    "kleptocracy-left": (-4.5, 7.2),

    # ───────────── AUTH-RIGHT (x>0, y>0) ─────────────
    "kraterocracy": (8.5, 9.4),
    "ghengis-khanism": (6.5, 9.5),
    "corporate-autocracy": (9.2, 7.5),
    "absolute-monarchism": (5.0, 9.2),
    "fascism": (5.5, 8.8),
    "nazism": (7.0, 9.0),
    "neo-nazism": (7.6, 8.6),
    "esoteric-fascism": (6.0, 8.4),
    "vichyism": (5.0, 8.0),
    "neo-fascism": (6.6, 8.0),
    "islamic-theocracy": (3.5, 9.0),
    "christian-theocracy": (3.0, 8.4),
    "hindu-theocracy": (3.8, 8.6),
    "buddhist-theocracy": (2.5, 8.0),
    "clientelism-cacicazgo": (2.2, 4.6),
    "developmentalism": (3.0, 3.4),
    "securitarian-right": (4.6, 4.4),
    "authoritarian-capitalism": (6.5, 5.5),
    "imperialism": (7.5, 6.6),
    "colonialism": (7.0, 7.2),
    "aristocracy": (5.6, 7.0),
    "fordism": (4.0, 5.0),
    "feudalism": (3.2, 7.8),
    "elective-monarchism": (3.6, 6.2),
    "constitutional-monarchism": (3.0, 4.0),
    "senatorialism": (4.2, 5.6),
    "paleo-conservatism": (4.4, 5.0),
    "pinochetism": (7.8, 7.0),
    "progressive-conservatism": (2.6, 3.0),
    "nationalist-conservatism": (5.0, 5.4),
    "traditionalist-conservatism": (4.0, 4.4),
    "neo-conservatism": (6.0, 4.8),
    "eco-conservatism": (2.4, 3.8),
    "liberal-conservatism": (5.2, 2.6),
    "zionism": (5.5, 6.0),
    "kuomintangism": (4.6, 6.6),
    "christian-democracy": (2.0, 2.2),
    "right-populism": (5.8, 3.6),

    # ───────────── LIB-LEFT (x<0, y<0) ─────────────
    "democratic-socialism": (-5.0, -2.2),
    "social-democracy": (-3.0, -1.6),  # centro-izquierda (corrige "muy a la izquierda")
    "progressivism": (-3.4, -2.8),
    "welfarism": (-2.4, -1.0),
    "labour-social-democracy": (-3.8, -1.2),
    "luxemburgism": (-6.6, -2.0),
    "left-communism": (-7.6, -2.6),
    "council-communism": (-7.8, -3.4),
    "classical-marxism": (-7.0, -1.6),
    "democratic-confederalism": (-6.0, -5.0),
    "bookchin-communalism": (-6.6, -5.6),
    "syndicalism": (-6.2, -3.0),
    "market-socialism": (-2.0, -2.4),  # socialismo con mercado, cerca centro
    "indigenous-communalism": (-5.4, -4.2),
    "environmentalism": (-2.6, -3.6),
    "eco-socialism": (-5.6, -4.0),
    "green-politics": (-3.0, -4.0),
    "technological-primitivism": (-7.0, -6.5),
    "gandhism": (-3.2, -6.0),
    "mandelism": (-3.0, -2.0),
    "libertarian-socialism": (-6.4, -5.2),
    "anarcho-communism": (-8.0, -6.6),
    "anarcho-syndicalism": (-7.4, -6.2),
    "anarcho-collectivism": (-7.0, -6.0),
    "anarcho-feminism": (-6.0, -7.0),
    "queer-anarchism": (-5.4, -7.4),
    "eco-anarchism": (-6.8, -7.6),
    "religious-anarchism": (-4.6, -6.8),
    "anarcho-pacifism": (-5.0, -8.0),
    "situationism": (-5.8, -6.4),
    "minarcho-socialism": (-3.6, -7.0),
    "mutualism": (-2.4, -5.4),  # Proudhon: mercado + anti-capital, cerca centro-izq

    # ───────────── LIB-RIGHT (x>0, y<0) ─────────────
    "classical-liberalism": (3.6, -2.4),
    "social-liberalism": (2.0, -2.8),
    "democratic-liberalism": (2.6, -2.0),
    "nordic-liberalism": (1.6, -3.2),
    "liberal-corporatism": (3.0, -1.0),
    "neo-liberalism": (6.0, -2.0),
    "neoclassical-liberalism": (5.0, -2.6),
    "general-capitalism": (5.4, -1.4),
    "minarchism": (8.0, -6.0),  # extrema derecha libertaria (corrige "casi en el centro")
    "anarcho-capitalism": (9.4, -8.0),
    "objectivism": (8.6, -5.0),
    "voluntaryism": (9.0, -7.0),
    "agorism": (9.5, -8.8),
    "hoppeanism": (8.8, -4.0),  # paleolibertario, menos libertario socialmente
    "paleo-libertarianism": (7.6, -3.4),
    "national-libertarianism": (6.8, -3.0),
    "libertarian-conservatism": (6.4, -2.4),
    "techno-libertarianism": (7.0, -5.5),
    "georgism": (3.4, -4.6),  # impuesto a la tierra, heterodoxo
    "green-libertarianism": (4.0, -5.6),
    "neo-libertarianism": (6.6, -4.6),
    "dark-enlightenment": (8.0, -1.0),  # reaccionario, poco libertario
    "consequentialism-libright": (5.6, -4.0),
    "pink-capitalism": (4.4, -3.0),
    "christian-libertarianism": (5.0, -1.6),
    "individualist-anarchism": (7.2, -7.2),
    "fiscal-conservatism": (5.0, -0.8),
    "third-way": (2.2, -0.8),  # centro
    "national-liberalism": (4.6, -1.2),
    "capitalist-transhumanism": (7.4, -4.2),
    "centrelism": (1.2, -0.6),  # centro casi puro
    "technocracy": (2.8, -1.2),  # centro técnico
}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))

    ids_json = {i["id"] for i in data}
    ids_pos = set(POS.keys())
    missing_pos = ids_json - ids_pos       # en JSON pero sin posición curada
    extra_pos = ids_pos - ids_json         # posición curada pero no en JSON

    if missing_pos:
        print(f"[WARN] {len(missing_pos)} ideologías del JSON sin posición curada:")
        for x in sorted(missing_pos):
            print(f"   - {x}")
    if extra_pos:
        print(f"[INFO] {len(extra_pos)} posiciones curadas que no están en el JSON (ignoradas):")
        for x in sorted(extra_pos):
            print(f"   - {x}")

    # Colores por cuadrante (consistentes con quadrant-colors.ts)
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

    applied = 0
    requad = 0
    for ide in data:
        pos = POS.get(ide["id"])
        if pos is None:
            continue
        x, y = pos
        ide["x"] = x
        ide["y"] = y
        ide["width"] = TILE_W
        ide["height"] = TILE_H
        # Recalcular cuadrante y color según la posición real
        q = quad_of(x, y)
        if ide.get("quadrant") != q:
            requad += 1
        ide["quadrant"] = q
        ide["color"] = QUAD_COLOR[q]
        applied += 1
    print(f"Cuadrantes recalculados (cambiaron): {requad}")

    print(f"\nPosiciones aplicadas: {applied}/{len(data)}")

    if args.dry_run:
        print("Dry-run: JSON no escrito.")
        return 0

    JSON_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"[OK] {JSON_PATH} actualizado.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
