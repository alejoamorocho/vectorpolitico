# Metodología: Cómo asignamos ideología a una figura

> **Versión:** 2.0.0
> **Última revisión:** 2026-04-23
> **Estado:** Vigente
> **Complementa:** `compass-scoring.md`, `data-sources.md`, `data-validation.md`

> **Cambios v2.0.0:** grid curado por país (de ~131 ideologías globales a ~46 aplicables a Colombia), tres ideologías nuevas (liberation-theology, indigenous-communalism, right-populism), subdivisión de authoritarian-capitalism en 4 sub-celdas (clientelism-cacicazgo, developmentalism, securitarian-right, autoritarian-capitalism), movimientos de cuadrante para christian-democracy y technocracy, y validador automático de coherencia entre coord y dimensionScores. Detalle en `data-validation.md`.

---

## Principio rector

Cada figura termina con una etiqueta ideológica (ej. `social-democracy`, `liberal-conservatism`). Esa etiqueta **debe ser consecuencia** de su posición en el compás, no una decisión previa.

Dos campos distintos, ambos con fuentes:

- `ideologySelfAssignment` — la ideología que mejor representa lo que la figura **dice ser** (derivada de `compassSelfPerceived`).
- `ideologyEvidencedAssignment` — la ideología que mejor representa lo que las acciones muestran (derivada de `compassEvidenced`).

Cada asignación va con una justificación escrita y al menos una fuente verificable. Sin fuentes no hay asignación.

---

## La regla de proximidad (flexible con justificación)

Cada ideología en `ideologies.json` tiene un centro `(x, y)` y unas dimensiones `(width, height)`.

1. **Regla por defecto:** asignar la ideología cuyo centro esté más cerca (distancia euclidiana) del punto de la figura, dando preferencia a ideologías del mismo cuadrante.
2. **Excepción justificada:** se puede asignar una ideología distinta a la más cercana **si y solo si**:
   - la figura se identifica explícitamente con esa etiqueta en una fuente propia (sitio oficial, perfil institucional, discurso documentado), o
   - hay evolución ideológica documentada (ej. ex-combatiente que hoy milita en otra corriente), o
   - la ideología describe mejor la familia política de la figura aun cuando su posición numérica la haya movido (ej. centro-izquierda liberal que queda en lib-der pero es socialliberal por militancia).

   Cuando se usa esta excepción, la `justification` **debe nombrar explícitamente el motivo** y citar la fuente que lo respalda.

### Sin límite de distancia entre `self` y `evidenced`

**No existe límite artificial** de distancia entre `ideologySelfAssignment` e `ideologyEvidencedAssignment`. Si la evidencia documental muestra que un político gobierna desde una ideología opuesta a la que declara, eso se refleja tal cual — precisamente ese tipo de divergencia es lo que Brújula Política busca hacer visible.

Lo único obligatorio es el **"por qué"**: la `justification` debe explicar claramente qué evidencia sustenta cada asignación, con fuentes verificables. A mayor distancia entre self y evidenced, más robusta debe ser la justificación y las fuentes de la posición evidenciada.

---

## Fuentes requeridas por tipo de asignación

### `ideologySelfAssignment.sources`
Mismas reglas que `compassSelfPerceived.sources`:

- página web oficial del político, campaña o partido
- Wikipedia en español
- programa de gobierno CNE/Registraduría
- estatutos/plataforma programática
- perfil institucional (Senado, Cámara, Alcaldía, Gobernación)

**No aceptadas:** medios de comunicación, redes sociales, blogs de opinión, think tanks con sesgo explícito sin cross-check.

### `ideologyEvidencedAssignment.sources`
Mismas reglas que `compassEvidenced.sources`:

- CongresoVisible (votaciones)
- SUIN-Juriscol / Diario Oficial (decretos, actos administrativos)
- Contraloría (ejecución presupuestal)
- Registraduría (resultados electorales, coaliciones)
- sentencias judiciales, informes oficiales

**Los medios** pueden complementar como fuente de hechos verificables, **no** como etiqueta ideológica.

---

## Estructura en el JSON

```json
{
  "id": "ejemplo-politico",
  "ideologies": ["social-democracy", "progressivism"],
  "ideologySelf": "social-democracy",
  "ideologyEvidenced": "social-democracy",
  "ideologySelfAssignment": {
    "ideologyId": "social-democracy",
    "justification": "Se autodefine como socialdemócrata en su sitio oficial y en su plataforma 2022. Su posición auto-percibida (x=-3.2, y=-2.8) cae dentro del rectángulo de la ideología social-democracy (centro x=-3, y=-3, ancho 3, alto 3).",
    "sources": [
      { "url": "https://sitio-oficial.co/quien-soy", "outlet": "Sitio oficial", "date": "2024-01-15" },
      { "url": "https://es.wikipedia.org/wiki/...", "outlet": "Wikipedia", "date": "2024-01-15" }
    ]
  },
  "ideologyEvidencedAssignment": {
    "ideologyId": "social-democracy",
    "justification": "Análisis metodológico del proyecto: sus votaciones en CongresoVisible (2022-2024) muestran apoyo sistemático a reforma tributaria progresiva (x≈-3), reforma laboral (x≈-3.2) y ampliación de derechos sociales (y≈-3). La posición resultante (x=-3.0, y=-2.8) coincide con el centro de social-democracy.",
    "sources": [
      { "url": "https://congresovisible.uniandes.edu.co/congresistas/perfil/...", "outlet": "CongresoVisible", "date": "2024-12-01" },
      { "url": "https://www.suin-juriscol.gov.co/...", "outlet": "SUIN-Juriscol", "date": "2024-06-01" }
    ]
  }
}
```

### Relación con campos legacy

Los campos `ideologySelf` e `ideologyEvidenced` (string) se mantienen por compatibilidad. **Si están presentes ambos `Assignment` y los string, sus `ideologyId` deben coincidir** (el schema Zod y Pydantic lo validan).

El campo `ideologies: string[]` sigue funcionando como lista de etiquetas tangenciales/emparentadas que no son la principal.

---

## Proceso paso a paso

1. **Calcular compassEvidenced**. Usar la metodología de `compass-scoring.md` con fuentes primarias. Salir con `(x_e, y_e)` y `confidence`.
2. **Calcular compassSelfPerceived**. Leer sitio oficial, Wikipedia, plataforma. Salir con `(x_s, y_s)`.
3. **Asignar ideologyEvidenced** buscando en `ideologies.json` la ideología del mismo cuadrante cuyo centro esté más cerca de `(x_e, y_e)`. Si hay dos cercanas, elegir la que cubra el punto con su `(width, height)`.
4. **Asignar ideologySelf** con la misma lógica sobre `(x_s, y_s)`, dando preferencia a etiquetas que la propia figura use para sí misma.
5. **Documentar divergencia.** Si `ideologySelf` ≠ `ideologyEvidenced`, explicar en la `justification` de la posición evidenciada qué acciones o evidencia concreta causan la diferencia. A mayor distancia, más detallada la justificación y más fuentes se esperan.
6. **Escribir justificaciones** citando al menos 1 fuente por cada `Assignment`.
7. **Validar con pydantic/zod**. El schema rechaza asignaciones sin fuente o con menos de 20 caracteres de justificación.

---

## Qué NO hacer

- **No asignar ideología antes de calcular el compás.** La ideología es consecuencia, no premisa.
- **No asignar ideologías sin justificación escrita.** Toda asignación requiere explicar por qué. Si hay una gran distancia entre self y evidenced (ej. `christian-democracy` → `social-conservatism`), la justificación debe ser más detallada y con más fuentes, pero el salto en sí no está prohibido si la evidencia lo sustenta.
- **No usar ideologías que no existan en `ideologies.json`**. Si falta una, agregarla primero (con metadata: `wikipediaUrl`, `externalLinks`, `description`).
- **No omitir fuentes.** El schema lo rechaza. Sin fuentes = sin asignación.

---

## Ideologías del archivo `ideologies.json`

Cada ideología del catálogo debe tener **obligatorio**:

- `id`, `name`, `x`, `y`, `width`, `height`, `quadrant`, `color`, `description`

Y **recomendado** (exigido en la metodología v2):

- `wikipediaUrl` — enlace directo a Wikipedia en español (preferente) o inglés
- `externalLinks[]` — al menos 1 fuente académica o enciclopedia política
- `keyThinkers[]`, `historicalExamples[]`, `longDescription` cuando sea posible

Esto permite que cuando alguien asigna una ideología a una figura, el lector pueda hacer click en la ideología y ver qué es realmente, con fuentes independientes al proyecto.

---

## Partidos

`parties.json` debe tener por partido:

- `websiteUrl` — sitio oficial del partido (verificado accesible)
- `sources[]` — al menos una fuente externa: registro CNE/Registraduría, estatutos archivados, análisis académico
- `compassPosition` con `justification`, `sources[]` y `confidence`

El partido también puede ser **inconsistente** internamente: cada miembro se clasifica individualmente y el partido se posiciona con el promedio ponderado documentado.

---

## Historial de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0.0 | 2026-04-15 | Versión inicial. Introducción de `ideologySelfAssignment`, `ideologyEvidencedAssignment`, regla de proximidad flexible con justificación, y requisito de fuentes por asignación. |
| 1.1.0 | 2026-04-15 | Se elimina el límite de ~6 unidades entre self y evidenced. Lo que importa es la justificación documentada, no un tope numérico artificial. A mayor divergencia, más robustas las fuentes. |
