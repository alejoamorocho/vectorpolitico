# Cómo agregar una figura política

Guía paso a paso para contribuir datos de una nueva figura a Brújula Política Colombia.

---

## Antes de empezar

Verifica que la figura **no existe ya** en el repositorio:

```bash
# Busca por nombre en todos los JSONs de Colombia
grep -r "nombre-de-la-figura" packages/data/colombia/
```

Si ya existe, haz un PR de actualización en vez de crear uno nuevo.

---

## Paso 1 — Elige el archivo correcto

```
packages/data/colombia/
├── presidents.json        → Presidentes de Colombia
├── candidates.json        → Candidatos presidenciales (últimos 20 años)
├── senators.json          → Senadores (últimos 10 años)
├── representatives.json   → Representantes a la Cámara (últimos 10 años)
├── governors.json         → Gobernadores de capitales (últimos 10 años)
└── mayors.json            → Alcaldes de capitales (últimos 10 años)
```

Una figura puede aparecer en **múltiples archivos** si ejerció diferentes cargos. Usa el mismo `id` en todos.

---

## Paso 2 — Define el ID

El ID es permanente y no cambia. Formato:

```
nombre-apellido-apellido

Ejemplos:
gustavo-petro-urrego
alvaro-uribe-velez
ivan-duque-marquez
francia-marquez-mina
```

Reglas:
- Solo minúsculas
- Solo guiones, sin espacios ni caracteres especiales
- Sin tildes
- Si hay dos personas con el mismo nombre, agrega el segundo apellido

---

## Paso 3 — Reúne las fuentes

Antes de escribir una sola línea de JSON, ten estos documentos listos:

**Para la posición autopercibida (`compassSelfPerceived`):**
- [ ] Página web oficial del político o campaña
- [ ] Página web oficial del partido político
- [ ] Wikipedia en español
- [ ] Programa de gobierno registrado ante CNE/Registraduría

⚠️ **NO usar medios de comunicación** (El Tiempo, Semana, etc.) como fuente de autopercepción. Solo lo que la figura dice de sí misma en sus propios canales.

**Para la posición evidenciada (`compassEvidenced`):**
- [ ] Si es o fue congresista: historial de votaciones en CongresoVisible
- [ ] Si es o fue ejecutivo: decretos clave + ejecución presupuestal (Contraloría)
- [ ] Leyes firmadas (SUIN-Juriscol), registros electorales (Registraduría)
- [ ] Acciones concretas que contrasten (o confirmen) su discurso

⚠️ **La justificación es ANÁLISIS PROPIO del proyecto**, no etiquetas de medios. Debe iniciar con "Análisis metodológico del proyecto:" y explicar cómo las acciones concretas determinan la posición en el compass.

**Para la asignación de ideología (`ideologySelfAssignment`, `ideologyEvidencedAssignment`):**
- [ ] Al menos 1 fuente verificable por asignación
- [ ] Justificación de al menos 20 caracteres explicando por qué esa ideología encaja
- [ ] Las fuentes de `ideologySelfAssignment` siguen las mismas reglas que `compassSelfPerceived` (oficiales/Wikipedia)
- [ ] Las fuentes de `ideologyEvidencedAssignment` siguen las mismas reglas que `compassEvidenced` (acciones primarias)
- [ ] Ver `docs/methodology/ideology-classification.md` para la regla de proximidad flexible

**Para las incoherencias:**
- [ ] Cada una con fuente de la promesa + fuente de la acción + archivos en Wayback

---

## Paso 4 — Usa la clasificación asistida (opcional pero recomendada)

```bash
# Instala dependencias Python
pip install anthropic

# Ejecuta el clasificador con los datos que tienes
python packages/etl/classify_entity.py \
  --name "Nombre Completo" \
  --proposals "ruta/al/programa-de-gobierno.txt" \
  --actions "ruta/a/acciones-documentadas.txt"

# El script genera un JSON base que puedes revisar y ajustar
```

El script propone una posición. Tú la revisas y corriges si es necesario.

---

## Paso 5 — Llena el JSON

```json
{
  "id": "nombre-apellido",
  "country": "co",
  "type": "president",
  "fullName": "Nombre Completo Official",
  "displayName": "Como se le conoce",
  "photoUrl": "https://r2.brujulapolitica.co/co/nombre-apellido.jpg",
  "party": "id-del-partido",
  "periods": [
    {
      "role": "president",
      "startDate": "2022-08-07",
      "endDate": "2026-08-07",
      "electedWith": 50.44
    }
  ],
  "compassSelfPerceived": {
    "x": -5.0,
    "y": 2.0,
    "justification": "Se define como... [basado en su página oficial / Wikipedia / programa de gobierno]",
    "sources": [
      {
        "url": "https://...",
        "title": "Programa de gobierno 2022-2026",
        "outlet": "CNE",
        "date": "2022-01-15",
        "archived": "https://web.archive.org/web/..."
      }
    ]
  },
  "compassEvidenced": {
    "x": -3.5,
    "y": 3.5,
    "confidence": "high",
    "justification": "Análisis metodológico del proyecto: [descripción de acciones concretas y cómo ubican la posición]",
    "dimensionScores": {
      "fiscalPolicy": -4.0,
      "marketPosition": -3.0,
      "socialPolicy": -5.0,
      "tradePolicy": -2.0,
      "civilRights": -2.0,
      "securityApproach": 4.0,
      "socialRights": -1.0,
      "powerConcentration": 5.0
    },
    "sources": [
      {
        "url": "https://congresovisible.uniandes.edu.co/...",
        "title": "Votaciones período 2022-2026",
        "outlet": "CongresoVisible",
        "date": "2024-01-01",
        "archived": "https://web.archive.org/web/..."
      }
    ]
  },
  "ideologies": ["populismo-de-izquierda", "socialismo-democratico"],
  "ideologySelf": "socialismo-democratico",
  "ideologyEvidenced": "socialismo-democratico",
  "ideologySelfAssignment": {
    "ideologyId": "socialismo-democratico",
    "justification": "Se autodefine como socialdemócrata en su sitio oficial y plataforma 2022. La posición autopercibida (x,y) cae dentro del rectángulo de la ideología.",
    "sources": [
      {
        "url": "https://sitio-oficial.co/quien-soy",
        "outlet": "Sitio oficial",
        "date": "2024-01-15"
      }
    ]
  },
  "ideologyEvidencedAssignment": {
    "ideologyId": "socialismo-democratico",
    "justification": "Análisis metodológico del proyecto: votaciones en CongresoVisible y decretos firmados muestran apoyo sistemático a políticas redistributivas progresivas. Posición resultante coincide con el centro de la ideología.",
    "sources": [
      {
        "url": "https://congresovisible.uniandes.edu.co/...",
        "outlet": "CongresoVisible",
        "date": "2024-12-01"
      }
    ]
  },
  "bio": "Párrafo biográfico conciso y neutral. Hechos, no juicios.",
  "incoherences": [
    {
      "id": "nombre-tema-año",
      "category": "medio_ambiente",
      "severity": "high",
      "verified": false,
      "proposal": {
        "text": "Cita textual de la promesa",
        "source": {
          "url": "https://...",
          "outlet": "Nombre del medio",
          "date": "YYYY-MM-DD",
          "archived": "https://web.archive.org/web/..."
        }
      },
      "action": {
        "text": "Descripción precisa del hecho contrario",
        "source": {
          "url": "https://...",
          "outlet": "Fuente primaria",
          "date": "YYYY-MM-DD",
          "archived": "https://web.archive.org/web/..."
        }
      },
      "nuances": "Contexto adicional relevante si lo hay"
    }
  ],
  "lastUpdated": "2026-04-10",
  "contributors": ["tu-github-username"]
}
```

---

## Paso 6 — Valida el JSON

```bash
pnpm validate
```

El validador verifica:
- El JSON cumple el schema TypeScript
- El ID es único en todos los archivos
- Los campos obligatorios están presentes
- Las fechas tienen formato ISO correcto
- Los valores x e y están entre -10 y +10

Corrige cualquier error antes de continuar.

---

## Paso 7 — Sube la foto a R2

```bash
# Formato de nombre: id-de-la-figura.jpg
# Resolución mínima: 400x400px
# Formato: JPG o WebP
# Fuente: foto oficial pública (Congreso, Presidencia, etc.)

# El comando de upload se documenta aquí cuando el bucket R2 esté activo
```

---

## Paso 8 — Crea el PR

```bash
git checkout -b data/add-nombre-apellido
git add packages/data/colombia/archivo.json
git commit -m "data(co): add Nombre Apellido — tipo-cargo"
git push origin data/add-nombre-apellido
```

Llena el [PR template](.github/PULL_REQUEST_TEMPLATE.md) completamente. Los PRs con template incompleto se devuelven.

---

## Checklist final antes de hacer PR

- [ ] El ID es único y sigue el formato correcto
- [ ] `pnpm validate` pasa sin errores
- [ ] La posición autopercibida tiene mínimo 1 fuente oficial (web del político/partido/Wikipedia)
- [ ] La posición evidenciada tiene mínimo 2 fuentes de evidencia primaria (CongresoVisible, Contraloría, etc.)
- [ ] La justificación evidenciada inicia con "Análisis metodológico del proyecto:" y NO copia etiquetas de medios
- [ ] `ideologySelfAssignment` tiene justificación (≥20 chars) y ≥1 fuente oficial/Wikipedia
- [ ] `ideologyEvidencedAssignment` tiene justificación (≥20 chars) y ≥1 fuente de evidencia primaria
- [ ] Si `ideologySelf` e `ideologyEvidenced` están en cuadrantes distintos, la justificación del salto es explícita
- [ ] El nivel de confianza refleja honestamente la cantidad de evidencia
- [ ] Cada incoherencia tiene promesa + acción + ambas archivadas en Wayback
- [ ] La bio es neutral (hechos, sin juicios de valor)
- [ ] Tu username está en el array `contributors`
- [ ] La foto está subida a R2 (si tienes acceso) o se indica en el PR

---

## ¿Dudas?

Abre un issue con el tag `pregunta` o comenta en el PR.
