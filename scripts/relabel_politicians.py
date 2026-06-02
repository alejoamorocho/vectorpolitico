"""
Corrige las etiquetas ideológicas (ideologySelf, ideologyEvidenced) de los
110 políticos colombianos con criterio político real, y reposiciona sus
coordenadas al centroide de cada etiqueta en el grid completo (135 celdas).

Principios:
- self  = lo que la figura dice ser / marca de su partido / discurso.
- evid  = lo que sus acciones revelan. Divergencia realista (celdas
          adyacentes en general); jamás flip izquierda<->derecha salvo
          caso documentado.
- ambas etiquetas existen en el grid.
- la coordenada visual = centroide exacto de la celda de la etiqueta.

Uso: python scripts/relabel_politicians.py [--dry-run]
"""

from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
GRID = REPO / "packages" / "data" / "ideologies.json"
BASE = REPO / "packages" / "data" / "colombia"

# (ideologySelf, ideologyEvidenced) corregidos por figura.
LABELS: dict[str, tuple[str, str]] = {
    # ── presidents ──
    "cesar-gaviria": ("neo-liberalism", "neo-liberalism"),  # apertura 1990, neoliberal claro
    "ernesto-samper": ("social-liberalism", "social-liberalism"),  # liberalismo social "Salto Social"
    "andres-pastrana": ("liberal-conservatism", "liberal-conservatism"),
    "alvaro-uribe": ("neo-conservatism", "nationalist-conservatism"),  # auth-right
    "juan-manuel-santos": ("social-liberalism", "third-way"),  # centro, acuerdo paz
    "ivan-duque": ("neo-conservatism", "liberal-conservatism"),
    "gustavo-petro": ("democratic-socialism", "left-populism"),  # lib-left dice, gobierna con populismo izq
    # ── vice-presidents ──
    "marta-lucia-ramirez": ("christian-democracy", "traditionalist-conservatism"),
    "francia-marquez": ("eco-socialism", "progressivism"),
    # ── candidates ──
    "abelardo-de-la-espriella": ("right-populism", "nationalist-conservatism"),
    "carlos-caicedo-candidato-2026": ("progressivism", "social-democracy"),
    "clara-lopez-candidata-2026": ("social-democracy", "democratic-socialism"),
    "claudia-lopez-candidate": ("progressivism", "social-liberalism"),  # verde centro-izq
    "daniel-quintero": ("progressivism", "left-populism"),  # petrista, NO derecha
    "enrique-gomez-candidato-2022": ("traditionalist-conservatism", "paleo-conservatism"),
    "fico-gutierrez": ("liberal-conservatism", "securitarian-right"),
    "german-vargas-lleras": ("classical-liberalism", "developmentalism"),
    "humberto-de-la-calle-candidato-2018": ("social-liberalism", "social-liberalism"),
    "ingrid-betancourt-candidata-2022": ("green-politics", "social-liberalism"),
    "ivan-cepeda-candidato-2026": ("democratic-socialism", "democratic-socialism"),
    "john-milton-rodriguez-candidato-2022": ("christian-democracy", "christian-democracy"),
    "juan-manuel-galan": ("social-liberalism", "social-liberalism"),
    "luis-gilberto-murillo-candidato-2026": ("environmentalism", "social-liberalism"),
    "luis-perez-candidato-2022": ("liberal-conservatism", "developmentalism"),
    "mauricio-lizcano-candidato-2026": ("social-liberalism", "social-liberalism"),
    "miguel-uribe-londono-candidato-2026": ("neo-conservatism", "liberal-conservatism"),
    "paloma-valencia": ("neo-conservatism", "nationalist-conservatism"),
    "rodolfo-hernandez": ("right-populism", "right-populism"),  # FIX: era libertarian-socialism (absurdo)
    "rodrigo-londono-candidato-2018": ("classical-marxism", "democratic-socialism"),  # excombatiente FARC->transición
    "roy-barreras": ("social-liberalism", "third-way"),
    "sergio-fajardo": ("social-liberalism", "social-liberalism"),  # centro, NO derecha extrema
    "vicky-davila": ("liberal-conservatism", "right-populism"),
    "viviane-morales-candidata-2018": ("christian-democracy", "traditionalist-conservatism"),
    # ── vp-candidates ──
    "angela-maria-robledo": ("progressivism", "progressivism"),
    "juan-carlos-pinzon": ("liberal-conservatism", "securitarian-right"),  # tecnócrata seguridad, no extremo
    "clara-lopez-obregon": ("social-democracy", "social-democracy"),
    "marelen-castillo": ("third-way", "social-liberalism"),  # candidata Liga, no extrema
    "rodrigo-lara-sanchez": ("social-liberalism", "social-liberalism"),
    "nelson-alarcon": ("social-democracy", "democratic-socialism"),  # sindicalista educadores
    "maria-consuelo-del-rio": ("social-democracy", "social-democracy"),
    "aida-quilcue": ("indigenous-communalism", "democratic-socialism"),  # líder indígena CRIC
    "luz-maria-zapata": ("social-liberalism", "social-liberalism"),
    "adriana-ramirez": ("liberal-conservatism", "liberal-conservatism"),
    "luisa-fernanda-villegas": ("nationalist-conservatism", "nationalist-conservatism"),
    "juan-daniel-oviedo": ("social-liberalism", "technocracy"),  # ex-DANE, técnico
    # ── senators ──
    "aida-avella": ("democratic-socialism", "democratic-socialism"),  # UP histórica
    "alexander-lopez-maya": ("democratic-socialism", "democratic-socialism"),  # Polo sindical
    "alvaro-uribe-senador": ("nationalist-conservatism", "nationalist-conservatism"),
    "angelica-lozano": ("progressivism", "progressivism"),  # verde centro-izq, NO derecha
    "antanas-mockus": ("green-politics", "social-liberalism"),  # cultura ciudadana
    "antonio-sanguino": ("social-democracy", "progressivism"),
    "ariel-avila": ("progressivism", "social-democracy"),
    "armando-benedetti-senador": ("social-liberalism", "left-populism"),  # pragmático, hoy petrista
    "claudia-lopez-senadora": ("green-politics", "progressivism"),  # NO derecha
    "david-barguil": ("christian-democracy", "traditionalist-conservatism"),
    "david-luna": ("classical-liberalism", "liberal-conservatism"),  # CR, no technocracy
    "efrain-cepeda": ("liberal-conservatism", "traditionalist-conservatism"),
    "gustavo-bolivar": ("democratic-socialism", "left-populism"),  # petrista
    "gustavo-petro-senador": ("democratic-socialism", "democratic-socialism"),
    "honorio-henriquez": ("neo-conservatism", "nationalist-conservatism"),  # CD
    "humberto-de-la-calle": ("social-liberalism", "social-liberalism"),
    "isabel-zuleta": ("democratic-socialism", "democratic-socialism"),  # líder Ríos Vivos
    "ivan-cepeda": ("democratic-socialism", "democratic-socialism"),
    "ivan-name": ("social-liberalism", "green-politics"),  # verde
    "jonathan-pulido-hernandez": ("progressivism", "progressivism"),  # "Jota Pe", verde NO conservador
    "jorge-robledo": ("democratic-socialism", "social-democracy"),  # Dignidad
    "jose-obdulio-gaviria-senador": ("neo-conservatism", "nationalist-conservatism"),
    "julian-gallo-senador": ("classical-marxism", "democratic-socialism"),  # Comunes excombatiente
    "luis-fernando-velasco": ("social-liberalism", "social-liberalism"),  # liberal
    "maria-fernanda-cabal": ("nationalist-conservatism", "nationalist-conservatism"),  # la más a la derecha
    "maria-jose-pizarro": ("democratic-socialism", "democratic-socialism"),
    "miguel-uribe-turbay": ("liberal-conservatism", "nationalist-conservatism"),  # CD
    "nadia-blel": ("christian-democracy", "traditionalist-conservatism"),
    "paloma-valencia": ("nationalist-conservatism", "nationalist-conservatism"),
    "paola-holguin": ("nationalist-conservatism", "traditionalist-conservatism"),
    "roy-barreras-senador": ("social-liberalism", "left-populism"),  # giró al petrismo
    "temistocles-ortega": ("social-liberalism", "social-liberalism"),
    "wilson-arias": ("democratic-socialism", "democratic-socialism"),  # Polo/Pacto
    # ── representatives ──
    "katherine-miranda": ("progressivism", "progressivism"),  # verde, NO derecha
    "alirio-uribe-munoz": ("democratic-socialism", "democratic-socialism"),  # DDHH
    "catherine-juvinao": ("progressivism", "social-liberalism"),  # verde reformista
    "jennifer-pedraza": ("democratic-socialism", "democratic-socialism"),  # Dignidad, líder estudiantil
    "gabriel-becerra": ("democratic-socialism", "democratic-socialism"),  # UP
    # ── governors ──
    "andres-julian-rendon": ("liberal-conservatism", "nationalist-conservatism"),  # CD Antioquia
    "carlos-amaya": ("green-politics", "social-democracy"),  # verde Boyacá, NO derecha
    "dilian-francisca-toro": ("social-liberalism", "liberal-conservatism"),  # La U Valle
    "eduardo-verano": ("classical-liberalism", "social-liberalism"),  # liberal Atlántico
    "henry-gutierrez-caldas": ("social-liberalism", "social-liberalism"),
    "jorge-rey": ("social-liberalism", "liberal-conservatism"),
    "juvenal-diaz-santander": ("nationalist-conservatism", "nationalist-conservatism"),  # CD
    "luis-alfonso-escobar-narino": ("social-liberalism", "social-democracy"),  # Pacto Nariño
    "octavio-guzman": ("classical-liberalism", "social-liberalism"),
    "rafaela-cortes-meta": ("social-liberalism", "social-liberalism"),  # Verde Oxígeno Meta
    "rodrigo-villalba-huila": ("social-liberalism", "social-liberalism"),  # liberal Huila
    "uribe-gobernador": ("liberal-conservatism", "nationalist-conservatism"),  # Uribe gobernador Antioquia
    "william-villamizar-nortesantander": ("liberal-conservatism", "christian-democracy"),
    "yamil-arana-bolivar": ("social-liberalism", "social-liberalism"),  # Bolívar, NO mezcla rara
    # ── mayors ──
    "alejandro-eder": ("classical-liberalism", "social-liberalism"),  # Cali
    "alex-char": ("classical-liberalism", "liberal-conservatism"),  # Casa Char Barranquilla
    "alexander-baquero-villavicencio": ("neo-conservatism", "traditionalist-conservatism"),
    "carlos-fernando-galan": ("social-liberalism", "social-liberalism"),  # Nuevo Liberalismo Bogotá
    "claudia-lopez": ("progressivism", "social-liberalism"),  # verde, alcaldesa Bogotá
    "dumek-turbay": ("classical-liberalism", "social-liberalism"),  # Cartagena
    "federico-gutierrez-medellin": ("liberal-conservatism", "securitarian-right"),
    "jaime-andres-beltran": ("christian-democracy", "nationalist-conservatism"),  # pastor Bucaramanga
    "jairo-yanez-cucuta": ("liberal-conservatism", "liberal-conservatism"),  # NO technocracy
    "johana-aranda-ibague": ("progressive-conservatism", "traditionalist-conservatism"),
    "jorge-ivan-ospina": ("social-liberalism", "progressivism"),  # verde Cali
    "mauricio-salazar-pereira": ("liberal-conservatism", "nationalist-conservatism"),  # CD Pereira
    "petro-alcalde-bogota": ("democratic-socialism", "left-populism"),
}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    grid = {i["id"]: i for i in json.loads(GRID.read_text(encoding="utf-8"))}

    # Validar que todas las etiquetas existen en el grid
    bad = set()
    for sid, (s, e) in LABELS.items():
        if s not in grid:
            bad.add((sid, "self", s))
        if e not in grid:
            bad.add((sid, "evid", e))
    if bad:
        print("ERROR — etiquetas no existen en grid:")
        for x in bad:
            print(f"  {x}")
        return 1

    files = ["presidents", "vice-presidents", "candidates", "vp-candidates",
             "senators", "representatives", "governors", "mayors"]
    applied = 0
    missing = []
    for fp in files:
        path = BASE / f"{fp}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        changed = False
        for p in data:
            pid = p["id"]
            if pid not in LABELS:
                missing.append(pid)
                continue
            s, e = LABELS[pid]
            cs, ce = grid[s], grid[e]
            p["ideologySelf"] = s
            p["ideologyEvidenced"] = e
            # Sincronizar assignments legacy si existen
            if isinstance(p.get("ideologySelfAssignment"), dict):
                p["ideologySelfAssignment"]["ideologyId"] = s
            if isinstance(p.get("ideologyEvidencedAssignment"), dict):
                p["ideologyEvidencedAssignment"]["ideologyId"] = e
            # Reposicionar coords al centroide
            p.setdefault("compassSelfPerceived", {})["x"] = round(cs["x"], 2)
            p["compassSelfPerceived"]["y"] = round(cs["y"], 2)
            p.setdefault("compassEvidenced", {})["x"] = round(ce["x"], 2)
            p["compassEvidenced"]["y"] = round(ce["y"], 2)
            applied += 1
            changed = True
        if changed and not args.dry_run:
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Aplicados: {applied}")
    if missing:
        print(f"Sin etiqueta en LABELS ({len(missing)}): {missing}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
