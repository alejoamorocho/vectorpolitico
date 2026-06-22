---
title: Cómo agregar una figura política
description: Guía paso a paso para proponer una nueva figura en Brújula Política vía pull request.
order: 40
section: contributing
version: 1.2.0
lastUpdated: 2026-06-22
authors:
  - ssi-co
relatedDocs:
  - compass-scoring
  - ideology-classification
  - incoherence-standard
---

## Antes de empezar

1. Lee la [metodología de scoring](/metodologia/compass-scoring)
2. Lee la [clasificación de ideologías](/metodologia/ideology-classification)
3. Lee el [estándar de incoherencias](/metodologia/incoherence-standard)
4. Revisa si la figura ya existe en `packages/data/colombia/` para evitar duplicados

## Estructura del JSON

Cada figura es un objeto con esta forma (ver `packages/schema/src/types.ts` para el schema completo):

```json
{
  "id": "nombre-apellido-apellido",
  "country": "co",
  "type": "senator",
  "fullName": "Nombre completo oficial",
  "displayName": "Como se le conoce",
  "party": "id-del-partido",
  "periods": [
    {
      "role": "senator",
      "startDate": "2022-07-20"
    }
  ],
  "compassSelfPerceived": {
    "x": -2.5,
    "y": -3,
    "justification": "Se define como... [basado en su página oficial / Wikipedia / programa de gobierno]",
    "sources": [
      { "url": "https://es.wikipedia.org/wiki/...", "outlet": "Wikipedia", "date": "YYYY-MM-DD" },
      { "url": "https://partido-ejemplo.co", "outlet": "Partido Ejemplo", "date": "YYYY-MM-DD" }
    ]
  },
  "compassEvidenced": {
    "x": -1,
    "y": -2,
    "justification": "Análisis metodológico del proyecto: [descripción de acciones concretas evaluadas]",
    "sources": [...],
    "confidence": "medium",
    "dimensionScores": {
      "fiscalPolicy": -2,
      "marketPosition": -3,
      "socialPolicy": -4,
      "tradePolicy": -1,
      "civilRights": -3,
      "securityApproach": -1,
      "socialRights": -4,
      "powerConcentration": -1
    }
  },
  "ideologies": ["democratic-socialism"],
  "ideologySelf": "democratic-socialism",
  "ideologyEvidenced": "democratic-socialism",
  "ideologySelfAssignment": {
    "ideologyId": "democratic-socialism",
    "justification": "Se autodefine así en sitio oficial. La posición autopercibida (x,y) cae en la caja de la ideología.",
    "sources": [
      { "url": "https://sitio-oficial.co/quien-soy", "outlet": "Sitio oficial", "date": "2024-01-15" }
    ]
  },
  "ideologyEvidencedAssignment": {
    "ideologyId": "democratic-socialism",
    "justification": "Análisis metodológico del proyecto: votaciones y decretos documentados ubican a la figura en el centro de esta ideología.",
    "sources": [
      { "url": "https://congresovisible.uniandes.edu.co/...", "outlet": "CongresoVisible", "date": "2024-12-01" }
    ]
  },
  "bio": "Párrafo biográfico neutro, factual, sin juicios de valor.",
  "incoherences": [],
  "lastUpdated": "2026-04-15",
  "contributors": ["github-username"]
}
```

## Asignación de ideología (metodología v2)

Desde v2 cada ideología asignada exige justificación y fuentes. Ver `ideology-classification` para la regla de proximidad flexible.

Reglas clave:

- `ideologySelfAssignment` y `ideologyEvidencedAssignment` son técnicamente opcionales en el schema, pero el **estándar del proyecto es incluirlos siempre**: todas las figuras del dataset (110/110) los tienen. Sin ellos solo quedan las etiquetas `ideologySelf`/`ideologyEvidenced` (legacy) sin trazabilidad.
- Cuando estén presentes, su `ideologyId` debe coincidir con el string legacy correspondiente — el schema Zod y Pydantic lo validan.
- Cada `Assignment` exige `justification` (≥20 caracteres) y al menos 1 `Source`.
- Si la distancia entre las dos ideologías (self vs evidenced) es grande, la justificación debe explicar la razón.

## La biografía (`bio`)

La `bio` es un párrafo **neutral y factual** (mínimo 50 caracteres; el estándar del dataset ronda los 1.000–1.500). Debe cubrir formación/profesión, trayectoria y cargos (coherente con `periods`), hechos verificables de su carrera o gestión y situación actual. Sin juicios de valor ni adjetivos cargados. Las referencias que respaldan la figura van en los `sources` de las posiciones del compass: la página de detalle las reúne automáticamente en una sección **"Fuentes"**.

## Proceso

```bash
# 1. Fork y clone
git clone https://github.com/TU_USER/vectorpolitico
cd vectorpolitico
pnpm install

# 2. Rama descriptiva
git checkout -b data/add-nombre-figura

# 3. Editar el JSON correspondiente según el tipo
# (presidents.json, senators.json, etc.)

# 4. Validar
cd packages/etl
make validate

# 5. Commit con mensaje claro
git commit -m "data(co): add Nombre Apellido — senator"

# 6. Push y PR
git push origin data/add-nombre-figura
```

## Qué revisa CI

- JSON parseable
- Todos los campos requeridos presentes
- Scores en rango -10..+10
- Fechas en formato ISO
- Sources no vacías
- IDs de partido e ideologías existen
- `ideologySelfAssignment` / `ideologyEvidencedAssignment` tienen justificación ≥20 caracteres y ≥1 fuente
- Coincidencia entre `ideologyId` de cada Assignment y el string legacy correspondiente

## Qué revisa un mantenedor humano

- Calidad de la justificación por dimensión
- Balanceo (¿las fuentes cubren el período de actividad?)
- Neutralidad del lenguaje
- Coherencia entre `compassSelfPerceived` y `compassEvidenced`
- Nivel de confianza apropiado al volumen de evidencia
- **Fuentes de autopercepción**: solo páginas oficiales del político/partido + Wikipedia (NO medios)
- **Fuentes de evidencia**: solo fuentes primarias de acciones (CongresoVisible, Contraloría, SUIN-Juriscol)
- **Justificación evidenciada**: debe ser análisis propio del proyecto, NO etiquetas de medios. Debe iniciar con "Análisis metodológico del proyecto:"
