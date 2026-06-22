# Metodología: Cómo posicionamos figuras en el compass

> **Versión:** 1.1.0
> **Última revisión:** 2026-04-10
> **Estado:** Referencia histórica — la versión vigente y canónica (v2.0.0) está en el sitio: `/metodologia/compass-scoring` ([`apps/web/src/content/methodology/compass-scoring.md`](../../apps/web/src/content/methodology/compass-scoring.md)).

> **Nota:** este documento describe el modelo inicial (coordenadas = promedio ponderado de `dimensionScores`). Desde la v2.0.0 las coordenadas se anclan al **centroide de la ideología declarada** y los `dimensionScores` se conservan como evidencia auditable. Ver `adr-003-grid-completo-educativo` y `data-validation` en el sitio.

---

## Principio rector

Toda posición en el compass político debe poder justificarse con **hechos verificables y fuentes primarias**. No publicamos opinión disfrazada de dato.

Cuando la evidencia es insuficiente, lo decimos explícitamente mediante el nivel de confianza. Una posición con confianza `low` es preferible a una inventada.

---

## Los dos ejes del compass

### Eje X — Económico

```
-10                    0                    +10
Izquierda        Centro económico         Derecha
(Estado, colectivo,               (Mercado, privado,
redistribución)                    acumulación)
```

### Eje Y — Social

```
+10
Autoritario
(Control social, tradición,
concentración de poder)
         0
-10
Libertario
(Autonomía individual, progresismo,
descentralización)
```

---

## Las dos posiciones por figura

Cada figura tiene **dos coordenadas (x, y)** distintas:

### Posición Autopercibida 🔵
**Fuente:** Lo que la figura declara, promete y dice ser. Se obtiene **exclusivamente** de fuentes propias del político o del partido:
- Página web oficial del político o campaña
- Página web oficial del partido político
- Wikipedia en español (como referencia neutral de autopercepción pública)
- Programa de gobierno registrado ante el CNE/Registraduría
- Estatutos y plataforma programática del partido

**⚠️ NO se usan medios de comunicación** (El Tiempo, Semana, La Silla Vacía, etc.) como fuente para la posición autopercibida. Los medios interpretan y etiquetan — la autopercepción debe venir de lo que la figura dice de sí misma en sus propios canales.

### Posición Evidenciada 🔴
**Fuente:** Lo que revelan sus acciones documentadas. **Es el análisis propio del proyecto** — no se copian etiquetas o caracterizaciones de medios de comunicación.
- Votaciones en el Congreso (CongresoVisible)
- Decretos, resoluciones y actos administrativos firmados (SUIN-Juriscol)
- Ejecución presupuestal vs plan (Contraloría)
- Coaliciones formadas en la práctica
- Nombramientos realizados
- Registros electorales (Registraduría)

**⚠️ Principio fundamental:** El proyecto analiza las ACCIONES (el voto, el decreto, la ley, el presupuesto ejecutado) y determina dónde se ubican en el compass según nuestra metodología. **No es que un medio diga que una decisión es "fascista" o "comunista" y nosotros la pongamos.** El medio puede reportar el hecho, pero el análisis ideológico es nuestro.

Cada justificación evidenciada debe comenzar con "Análisis metodológico del proyecto:" para hacer explícito que es nuestro propio análisis basado en evidencia verificable.

### El delta — índice de coherencia
```
delta = distancia_euclidiana(autopercibida, evidenciada)

delta = 0        → coherencia perfecta
delta = 1-3      → coherencia alta
delta = 4-6      → coherencia media — divergencias notables
delta = 7-10     → coherencia baja — contradicciones significativas
delta > 10       → incoherencia severa
```

---

## Cómo se calcula cada posición

### Dimensiones del Eje X (económico)

| Dimensión | Peso Ejecutivo | Peso Legislativo |
|---|---|---|
| Política fiscal (gasto, impuestos, deuda) | 30% | 20% |
| Posición frente al mercado y empresa privada | 25% | 25% |
| Política social (subsidios, universalismo vs focalización) | 25% | 25% |
| Comercio exterior, TLCs, inversión extranjera | 20% | 30% |

### Dimensiones del Eje Y (social)

| Dimensión | Peso |
|---|---|
| Derechos civiles y libertades individuales | 30% |
| Posición frente a fuerzas de seguridad y orden público | 25% |
| Derechos reproductivos, diversidad, derechos sociales | 25% |
| Concentración de poder, institucionalidad, controles | 20% |

### Scoring por dimensión

Cada dimensión se puntúa de **-10 a +10** basado únicamente en hechos verificables:

```
Ejemplo — dimensión "política fiscal" para un presidente:

Evidencia recolectada:
  • Reforma tributaria con tasas progresivas (2022): -2.5
  • Presupuesto 2023 con aumento de gasto social 15%: -2.0
  • Déficit fiscal tolerado vs meta del FMI: -1.5
  • Emisión de bonos para subsidios: -1.0

Score dimensión: promedio = -1.75
Fuentes: MHCP, Congreso de la República, DNP
```

### Fórmula final

```
x_final = Σ(score_dimensión_i × peso_i) para dimensiones del eje X
y_final = Σ(score_dimensión_i × peso_i) para dimensiones del eje Y
```

---

## Niveles de confianza

| Nivel | Criterio |
|---|---|
| `high` | Votaciones documentadas + acciones verificadas en ≥3 dimensiones de cada eje |
| `medium` | Evidencia parcial (1-2 dimensiones por eje) o solo discurso + 1 acción |
| `low` | Principalmente discurso y propuestas, sin acciones suficientes para contrastar |

La confianza `low` es normal para **candidatos** que no han ejercido cargo.
La confianza `high` es esperable para **expresidentes** y **congresistas con trayectoria**.

---

## La elipse de incertidumbre

En vez de un punto exacto, el compass muestra una **elipse** alrededor de la posición evidenciada que representa el margen de incertidumbre:

```
Confianza high   → elipse pequeña (radio ~0.5)
Confianza medium → elipse mediana (radio ~1.5)
Confianza low    → elipse grande (radio ~3.0)
```

Esto es intelectualmente honesto: ninguna figura tiene posición política exacta en coordenada (2.3, -4.7).

---

## Posición relativa — comparaciones automáticas

Una vez que la figura tiene posición, el sistema calcula automáticamente:

### Dentro de su partido
```
¿Es el más radical o el más moderado en su partido?
Percentil en eje X entre todos los miembros del partido con datos
Percentil en eje Y entre todos los miembros del partido con datos
```

### En su período histórico
```
¿Dónde cae comparado con sus contemporáneos en ejercicio?
Percentil en eje X entre todas las figuras activas en ese período
Percentil en eje Y entre todas las figuras activas en ese período
```

Estos datos **emergen solos** de los datos cargados, sin trabajo adicional.

---

## Proceso de clasificación

### Opción A — Clasificación asistida por IA (recomendada para arrancar)

```python
# El script etl/classify_entity.py hace esto:
# 1. Recibe el JSON base de la figura (propuestas, votaciones, acciones)
# 2. Envía a Claude API con el prompt de clasificación
# 3. Recibe posición + justificación por dimensión
# 4. El colaborador REVISA y ajusta si es necesario
# 5. Se guarda con confianza apropiada y fuentes
```

La IA propone, el humano valida. Nunca al revés.

### Opción B — Clasificación manual

El colaborador llena el JSON directamente usando los criterios de este documento.
Requiere más tiempo pero puede ser más precisa para figuras con historial muy documentado.

---

## Qué hacer cuando hay ambigüedad

**Caso 1 — La figura ha evolucionado ideológicamente**
→ La posición refleja su trayectoria más reciente con evidencia
→ Se documenta la evolución en el campo `ideologicalEvolution`

**Caso 2 — La evidencia contradice fuertemente el discurso**
→ Se registran AMBAS posiciones (autopercibida y evidenciada)
→ El delta grande habla por sí solo

**Caso 3 — Hay poca evidencia (candidato nuevo)**
→ Confianza `low`, posición principalmente autopercibida
→ Se actualiza cuando ejerza cargo

**Caso 4 — Figura con posiciones mixtas por tema**
→ Se pondera por el peso de cada dimensión
→ Los matices van en `justification` y `nuances`

---

## Historial de cambios de metodología

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0.0 | 2026-04-10 | Versión inicial |
| 1.1.0 | 2026-04-12 | Clarificación de fuentes: autopercibida solo de fuentes propias/Wikipedia; evidenciada es análisis propio del proyecto basado en acciones, no etiquetas de medios |
| 1.2.0 | 2026-04-15 | Separación de metodologías: la asignación de ideología (label) pasa a `ideology-classification.md` con regla de proximidad flexible, justificación obligatoria y fuentes por asignación (`ideologySelfAssignment`, `ideologyEvidencedAssignment`). El cálculo del compás (coordenadas x,y) permanece en este documento. |

Cualquier cambio en la metodología se documenta aquí y puede implicar recalcular posiciones existentes.

## Ver también

- [`ideology-classification.md`](./ideology-classification.md) — cómo convertir una posición (x,y) en una etiqueta ideológica con fuentes.
- [`data-sources.md`](./data-sources.md) — catálogo de fuentes primarias y reglas de aceptación.
- [`incoherence-standard.md`](./incoherence-standard.md) — estándar para documentar contradicciones propuesta↔acción.
