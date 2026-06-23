"""
Brújula Política — Clasificador ideológico con Claude API
=========================================================
Uso:
  python classify_entity.py --input entity_raw.json --output entity_classified.json

El script toma los datos crudos de una figura (propuestas, acciones documentadas)
y genera una posición en el compass con justificación por dimensión.

IMPORTANTE: La IA propone, el humano valida. Siempre revisar el output.
"""

import anthropic
import argparse
import json
import sys
from pathlib import Path


# ── Constantes de módulo ─────────────────────────────────────────────────────

# Modelo de Claude usado para la clasificación.
MODEL_ID = "claude-opus-4-8"  # Claude Opus 4.8 (modelo vigente)

# Umbral de alerta: si |x_reportado - x_promedio_ponderado| supera este valor,
# el LLM asignó una posición inconsistente con las dimensiones que él mismo evaluó.
# Esto históricamente produjo casos con x=±9 para políticos con scores moderados.
VERIFICATION_THRESHOLD = 3.0


# ── Configuración de pesos por dimensión ─────────────────────────────────────

DIMENSION_WEIGHTS = {
    "president": {
        "x": {
            "fiscalPolicy": 0.30,
            "marketPosition": 0.25,
            "socialPolicy": 0.25,
            "tradePolicy": 0.20,
        },
        "y": {
            "civilRights": 0.30,
            "securityApproach": 0.25,
            "socialRights": 0.25,
            "powerConcentration": 0.20,
        },
    },
    "senator": {
        "x": {
            "fiscalPolicy": 0.20,
            "marketPosition": 0.25,
            "socialPolicy": 0.25,
            "tradePolicy": 0.30,
        },
        "y": {
            "civilRights": 0.30,
            "securityApproach": 0.25,
            "socialRights": 0.25,
            "powerConcentration": 0.20,
        },
    },
    "representative": {
        "x": {
            "fiscalPolicy": 0.20,
            "marketPosition": 0.25,
            "socialPolicy": 0.25,
            "tradePolicy": 0.30,
        },
        "y": {
            "civilRights": 0.30,
            "securityApproach": 0.25,
            "socialRights": 0.25,
            "powerConcentration": 0.20,
        },
    },
}

# Usar pesos de senador para los demás tipos
for role in ["governor", "mayor", "presidential_candidate"]:
    DIMENSION_WEIGHTS[role] = DIMENSION_WEIGHTS["senator"]


# ── Prompt de clasificación ───────────────────────────────────────────────────

CLASSIFICATION_PROMPT = """Eres un politólogo especializado en análisis ideológico latinoamericano.
Tu tarea es ubicar a una figura política en el compass político con base en evidencia objetiva.

EL COMPASS:
- Eje X (económico): -10 = izquierda extrema (estatismo total), +10 = derecha extrema (mercado total)
- Eje Y (social): -10 = libertario extremo (mínimo control social), +10 = autoritario extremo (máximo control social)

DIMENSIONES A EVALUAR:

Eje X — Económico:
1. fiscalPolicy: política fiscal (gasto público, impuestos, deuda)
   -10 = gasto máximo, impuestos máximos a ricos, deuda ilimitada
   +10 = austeridad extrema, impuestos mínimos, déficit cero
   
2. marketPosition: posición frente al mercado y empresa privada
   -10 = nacionalización total, rechazo del mercado
   +10 = privatización máxima, mínima regulación
   
3. socialPolicy: política social (subsidios, universalismo)
   -10 = universalismo total, renta básica universal
   +10 = cero subsidios, meritocracia pura
   
4. tradePolicy: comercio exterior, TLCs, inversión extranjera
   -10 = proteccionismo total, rechazo de TLCs
   +10 = libre comercio absoluto, bienvenida sin restricciones

Eje Y — Social:
5. civilRights: derechos civiles y libertades individuales
   -10 = libertad total, mínima interferencia del Estado
   +10 = máximo control del Estado sobre individuos
   
6. securityApproach: posición frente a fuerzas de seguridad y orden público
   -10 = desmilitarización, enfoque de derechos humanos
   +10 = mano dura máxima, militarismo
   
7. socialRights: derechos reproductivos, diversidad, derechos sociales
   -10 = máximo progresismo social, todos los derechos
   +10 = máximo conservadurismo social, derechos tradicionales únicos
   
8. powerConcentration: concentración de poder, institucionalidad
   -10 = descentralización máxima, controles fuertes al ejecutivo
   +10 = concentración máxima de poder, debilitamiento institucional

INSTRUCCIONES:
- Basa cada score SOLO en la evidencia proporcionada
- Si no hay evidencia suficiente para una dimensión, usa null y explica por qué
- No proyectes posiciones en temas sin evidencia
- Reporta los matices y contradicciones que encuentres
- El nivel de confianza refleja qué tan completa es la evidencia:
  "high" = evidencia sólida en ≥6 de las 8 dimensiones
  "medium" = evidencia parcial (4-5 dimensiones)
  "low" = evidencia escasa (<4 dimensiones, principalmente discurso)

DATOS DE LA FIGURA:
{entity_data}

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown:
{{
  "selfPerceived": {{
    "x": <float -10 a 10>,
    "y": <float -10 a 10>,
    "justification": "<justificación detallada basada en propuestas y discurso>",
    "confidence": "<high|medium|low>"
  }},
  "evidenced": {{
    "x": <float -10 a 10>,
    "y": <float -10 a 10>,
    "justification": "<justificación detallada basada en acciones y votaciones>",
    "confidence": "<high|medium|low>",
    "dimensionScores": {{
      "fiscalPolicy": <float o null>,
      "marketPosition": <float o null>,
      "socialPolicy": <float o null>,
      "tradePolicy": <float o null>,
      "civilRights": <float o null>,
      "securityApproach": <float o null>,
      "socialRights": <float o null>,
      "powerConcentration": <float o null>
    }},
    "dimensionJustifications": {{
      "fiscalPolicy": "<justificación con citas a acciones concretas>",
      "marketPosition": "<justificación>",
      "socialPolicy": "<justificación>",
      "tradePolicy": "<justificación>",
      "civilRights": "<justificación>",
      "securityApproach": "<justificación>",
      "socialRights": "<justificación>",
      "powerConcentration": "<justificación>"
    }}
  }},
  "ideologies": ["<tag1>", "<tag2>"],
  "nuances": "<matices importantes, evoluciones ideológicas, contradicciones notables>",
  "dataGaps": "<qué evidencia faltaría para subir el nivel de confianza>"
}}"""


# ── Funciones principales ─────────────────────────────────────────────────────

def _weighted_axis_averages(
    dimension_scores: dict, entity_type: str
) -> tuple[float, float]:
    """Calcula el promedio ponderado de los scores por eje (x, y).

    Los scores ausentes o null se tratan como 0. Usa los pesos del tipo de
    entidad (cae a 'senator' si no hay pesos definidos).
    """
    weights = DIMENSION_WEIGHTS.get(entity_type, DIMENSION_WEIGHTS["senator"])
    x_avg = sum((dimension_scores.get(d) or 0) * w for d, w in weights["x"].items())
    y_avg = sum((dimension_scores.get(d) or 0) * w for d, w in weights["y"].items())
    return x_avg, y_avg


def _check_dimension_coherence(classification: dict, entity_type: str) -> tuple[float, float]:
    """Calcula |delta x| y |delta y| entre coord reportada y promedio de scores.

    Si |delta| > VERIFICATION_THRESHOLD el LLM se contradijo a sí mismo.
    """
    evid = classification.get("evidenced", {})
    scores = evid.get("dimensionScores", {})
    x_avg, y_avg = _weighted_axis_averages(scores, entity_type)
    x_reported = evid.get("x", 0)
    y_reported = evid.get("y", 0)
    return abs(x_reported - x_avg), abs(y_reported - y_avg)


def classify_entity(entity_raw: dict, max_retries: int = 1) -> dict:
    """
    Clasifica una figura política usando Claude API.

    Args:
        entity_raw: dict con campos:
          - name: nombre completo
          - type: president|senator|etc
          - party: nombre del partido
          - proposals: lista de propuestas/promesas documentadas con fuente
          - actions: lista de acciones ejecutadas con fuente
          - votingRecord: (opcional) historial de votaciones
        max_retries: si la primera clasificación tiene incoherencia entre
          x|y reportado y dimensionScores, reintentar con feedback explícito
          al modelo (default: 1 retry).

    Returns:
        dict con compassSelfPerceived, compassEvidenced, ideologies, nuances
    """
    client = anthropic.Anthropic()

    entity_data_str = json.dumps(entity_raw, ensure_ascii=False, indent=2)
    prompt = CLASSIFICATION_PROMPT.format(entity_data=entity_data_str)
    entity_type = entity_raw.get("type", "president")

    print(f"  -> Clasificando: {entity_raw.get('name', 'Sin nombre')}...", file=sys.stderr)

    classification: dict = {}
    for attempt in range(max_retries + 1):
        messages: list[dict] = [{"role": "user", "content": prompt}]

        # En el reintento, anotar el problema detectado en el primer intento
        if attempt > 0:
            x_delta, y_delta = _check_dimension_coherence(classification, entity_type)
            issues = []
            if x_delta > VERIFICATION_THRESHOLD:
                issues.append(f"x={classification['evidenced']['x']} no coincide con el promedio ponderado de tus dimensionScores X (delta {x_delta:.2f})")
            if y_delta > VERIFICATION_THRESHOLD:
                issues.append(f"y={classification['evidenced']['y']} no coincide con el promedio ponderado de tus dimensionScores Y (delta {y_delta:.2f})")
            feedback = (
                "Tu clasificación anterior tenía incoherencia interna: "
                + "; ".join(issues)
                + ". Recalcula manteniendo coherencia: si los dimensionScores reflejan la realidad, "
                  "el x/y final debe ser el promedio ponderado de esos scores. Devuelve solo el JSON, sin texto adicional."
            )
            print(f"  -> Reintentando (feedback: {feedback[:120]}...)", file=sys.stderr)
            messages = [
                {"role": "user", "content": prompt},
                {"role": "assistant", "content": json.dumps(classification, ensure_ascii=False)},
                {"role": "user", "content": feedback},
            ]

        message = client.messages.create(
            model=MODEL_ID,
            max_tokens=4000,
            messages=messages,
        )
        response_text = message.content[0].text.strip()

        # Limpiar posibles marcadores de código
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]

        classification = json.loads(response_text)

        # Si no hay incoherencia o no hay scores, terminamos
        evid = classification.get("evidenced", {})
        if not evid.get("dimensionScores"):
            break
        x_delta, y_delta = _check_dimension_coherence(classification, entity_type)
        if x_delta <= VERIFICATION_THRESHOLD and y_delta <= VERIFICATION_THRESHOLD:
            break  # coherente, salimos del loop

    return classification


def validate_classification(classification: dict) -> list[str]:
    """Valida que la clasificación tiene los campos requeridos."""
    errors = []
    
    for section in ["selfPerceived", "evidenced"]:
        if section not in classification:
            errors.append(f"Falta sección: {section}")
            continue
        
        pos = classification[section]
        if not isinstance(pos.get("x"), (int, float)):
            errors.append(f"{section}.x debe ser un número")
        if not isinstance(pos.get("y"), (int, float)):
            errors.append(f"{section}.y debe ser un número")
        if pos.get("x") is not None and not -10 <= pos["x"] <= 10:
            errors.append(f"{section}.x debe estar entre -10 y 10, es {pos['x']}")
        if pos.get("y") is not None and not -10 <= pos["y"] <= 10:
            errors.append(f"{section}.y debe estar entre -10 y 10, es {pos['y']}")
    
    return errors


def build_entity_output(entity_raw: dict, classification: dict) -> dict:
    """Combina los datos crudos con la clasificación para generar el JSON final."""

    entity_type = entity_raw.get("type", "president")

    evidenced = classification.get("evidenced", {})
    dimension_scores = evidenced.get("dimensionScores", {})

    # Verificar coherencia del promedio ponderado
    x_check, y_check = _weighted_axis_averages(dimension_scores, entity_type)

    x_reported = classification["evidenced"]["x"]
    y_reported = classification["evidenced"]["y"]
    x_delta = abs(x_reported - x_check)
    y_delta = abs(y_reported - y_check)

    # Construir bloque de verificación con warnings si aplica
    verification = {
        "x_weighted_avg": round(x_check, 2),
        "y_weighted_avg": round(y_check, 2),
        "x_reported": x_reported,
        "y_reported": y_reported,
        "x_delta": round(x_delta, 2),
        "y_delta": round(y_delta, 2),
    }

    warnings_list = []
    if x_delta > VERIFICATION_THRESHOLD:
        warnings_list.append(
            f"x_reported ({x_reported}) se desvia {x_delta:.2f} del "
            f"promedio ponderado de scores ({x_check:.2f}). Revisar."
        )
    if y_delta > VERIFICATION_THRESHOLD:
        warnings_list.append(
            f"y_reported ({y_reported}) se desvia {y_delta:.2f} del "
            f"promedio ponderado de scores ({y_check:.2f}). Revisar."
        )
    if warnings_list:
        verification["warnings"] = warnings_list
        # Loggear a stderr para que el humano vea la alerta al correr el script
        for w in warnings_list:
            print(f"⚠️  INCOHERENCIA en {entity_raw.get('fullName', 'Sin nombre')}: {w}", file=sys.stderr)

    return {
        "id": entity_raw.get("id", ""),
        "country": entity_raw.get("country", "co"),
        "type": entity_type,
        "fullName": entity_raw.get("fullName", ""),
        "displayName": entity_raw.get("displayName", ""),
        "party": entity_raw.get("party", ""),
        "bio": entity_raw.get("bio", ""),
        "compassSelfPerceived": {
            "x": classification["selfPerceived"]["x"],
            "y": classification["selfPerceived"]["y"],
            "justification": classification["selfPerceived"]["justification"],
            "confidence": classification["selfPerceived"].get("confidence", "low"),
            "sources": entity_raw.get("proposalSources", []),
        },
        "compassEvidenced": {
            "x": x_reported,
            "y": y_reported,
            "justification": classification["evidenced"]["justification"],
            "confidence": classification["evidenced"].get("confidence", "low"),
            "dimensionScores": dimension_scores,
            "dimensionJustifications": evidenced.get("dimensionJustifications", {}),
            "sources": entity_raw.get("actionSources", []),
            "_verification": verification,
        },
        "ideologies": classification.get("ideologies", []),
        "nuances": classification.get("nuances", ""),
        "dataGaps": classification.get("dataGaps", ""),
        "periods": entity_raw.get("periods", []),
        "incoherences": [],  # Se agregan manualmente después
        "lastUpdated": entity_raw.get("lastUpdated", ""),
        "contributors": entity_raw.get("contributors", []),
        "_classifiedBy": "claude-api",
        "_requiresHumanReview": True,  # Siempre requiere revisión humana
        "_hasVerificationWarnings": bool(warnings_list),
    }


# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Clasifica una figura política con Claude API"
    )
    parser.add_argument(
        "--input", required=True,
        help="JSON con datos crudos de la figura"
    )
    parser.add_argument(
        "--output",
        help="Archivo de salida (default: {input}_classified.json)"
    )
    parser.add_argument(
        "--validate-only", action="store_true",
        help="Solo valida el JSON de entrada sin clasificar"
    )
    
    args = parser.parse_args()
    
    # Leer input
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: No existe el archivo {args.input}")
        sys.exit(1)
    
    with open(input_path) as f:
        entity_raw = json.load(f)
    
    print(f"\n🧭 Brújula Política — Clasificador ideológico")
    print(f"   Figura: {entity_raw.get('fullName', 'Sin nombre')}")
    print(f"   Tipo: {entity_raw.get('type', 'N/A')}")
    print()
    
    if args.validate_only:
        print("✅ JSON de entrada válido")
        return
    
    # Clasificar
    try:
        classification = classify_entity(entity_raw)
    except Exception as e:
        print(f"❌ Error en clasificación: {e}")
        sys.exit(1)
    
    # Validar resultado
    errors = validate_classification(classification)
    if errors:
        print("⚠️  Advertencias en la clasificación:")
        for err in errors:
            print(f"   - {err}")
    
    # Construir output
    output = build_entity_output(entity_raw, classification)
    
    # Guardar
    output_path = args.output or str(input_path).replace(".json", "_classified.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Clasificación completada")
    print(f"   Autopercibida: ({output['compassSelfPerceived']['x']:.1f}, {output['compassSelfPerceived']['y']:.1f})")
    print(f"   Evidenciada:   ({output['compassEvidenced']['x']:.1f}, {output['compassEvidenced']['y']:.1f})")
    print(f"   Confianza:     {output['compassEvidenced']['confidence']}")
    print(f"   Guardado en:   {output_path}")
    print()
    print("⚠️  RECUERDA: Revisa el output antes de hacer PR.")
    print("   La IA propone, el humano valida.")


if __name__ == "__main__":
    main()
