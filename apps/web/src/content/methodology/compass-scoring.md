---
title: Cómo posicionamos figuras en el compass
description: Metodología de scoring del compass político — fórmulas, pesos y criterios exactos para cada dimensión del eje económico y social.
order: 10
section: compass
version: 1.2.0
lastUpdated: 2026-04-15
authors:
  - ssi-co
relatedDocs:
  - ideology-classification
  - data-sources
  - incoherence-standard
---

## Principio rector

Toda posición en el compass político debe poder justificarse con **hechos verificables y fuentes primarias**. No publicamos opinión disfrazada de dato.

Cuando la evidencia es insuficiente, lo decimos explícitamente mediante el nivel de confianza. Una posición con confianza `low` es preferible a una inventada.

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
+10 Autoritario — Control social, tradición, concentración de poder
  0
-10 Libertario — Autonomía individual, progresismo, descentralización
```

## Las dos posiciones por figura

Cada figura tiene **dos coordenadas (x, y)** distintas:

### Posición Autopercibida 🔵

**Fuente:** Lo que la figura declara, promete y dice ser. Se obtiene **exclusivamente** de fuentes propias del político o del partido:

- Página web oficial del político o campaña
- Página web oficial del partido político
- Wikipedia en español (como referencia neutral de autopercepción pública)
- Programa de gobierno registrado ante el CNE/Registraduría
- Estatutos y plataforma programática del partido

**No se usan medios de comunicación** como fuente para la posición autopercibida. Los medios interpretan y etiquetan — la autopercepción debe venir de lo que la figura dice de sí misma en sus propios canales.

### Posición Evidenciada 🔴

**Fuente:** Lo que revelan sus acciones documentadas. **Es el análisis propio del proyecto** — no se copian etiquetas o caracterizaciones de medios de comunicación.

- Votaciones en el Congreso (CongresoVisible)
- Decretos, resoluciones y actos administrativos firmados (SUIN-Juriscol)
- Ejecución presupuestal vs plan (Contraloría)
- Coaliciones formadas en la práctica
- Nombramientos realizados
- Registros electorales (Registraduría)

El proyecto analiza las ACCIONES (el voto, el decreto, la ley, el presupuesto ejecutado) y determina dónde se ubican en el compass según nuestra metodología. No es que un medio diga que una decisión es de una u otra tendencia y nosotros la repliquemos. El medio puede reportar el hecho, pero el análisis ideológico es nuestro.

Cada justificación evidenciada comienza con "Análisis metodológico del proyecto:" para hacer explícito que es nuestro propio análisis.

### El delta — índice de coherencia

```
delta = distancia_euclidiana(autopercibida, evidenciada)

delta = 0        → coherencia perfecta
delta = 1-3      → coherencia alta
delta = 4-6      → coherencia media — divergencias notables
delta = 7-10     → coherencia baja — contradicciones significativas
delta > 10       → incoherencia severa
```

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

Cada dimensión se puntúa de **-10 a +10** basado únicamente en hechos verificables.

### Fórmula final

```
x_final = Σ(score_dimensión_i × peso_i) para dimensiones del eje X
y_final = Σ(score_dimensión_i × peso_i) para dimensiones del eje Y
```

## Niveles de confianza

| Nivel | Criterio |
|---|---|
| `high` | Votaciones documentadas + acciones verificadas en ≥3 dimensiones de cada eje |
| `medium` | Evidencia parcial (1-2 dimensiones por eje) o solo discurso + 1 acción |
| `low` | Principalmente discurso y propuestas, sin acciones suficientes para contrastar |

La confianza `low` es normal para **candidatos** que no han ejercido cargo.
La confianza `high` es esperable para **expresidentes** y **congresistas con trayectoria**.

## La elipse de incertidumbre

En vez de un punto exacto, el compass muestra una **elipse** alrededor de la posición evidenciada que representa el margen de incertidumbre:

- Confianza high → elipse pequeña (radio ~0.5)
- Confianza medium → elipse mediana (radio ~1.5)
- Confianza low → elipse grande (radio ~3.0)

Esto es intelectualmente honesto: ninguna figura tiene posición política exacta en coordenada (2.3, -4.7).

## De la posición a la ideología

El cálculo del compás termina con una coordenada `(x, y)` y un nivel de confianza. **La asignación de la etiqueta ideológica** (por ejemplo, `social-democracy`, `liberal-conservatism`) es un paso separado con su propia metodología: ver `ideology-classification`.

En breve:

- La ideología se deriva de la posición, no al revés.
- Se aplica la regla de proximidad geométrica flexible con justificación documentada.
- Cada asignación (`ideologySelfAssignment`, `ideologyEvidencedAssignment`) requiere justificación textual y al menos una fuente verificable.

## Historial de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0.0 | 2026-04-10 | Versión inicial. |
| 1.1.0 | 2026-04-12 | Clarificación de fuentes: autopercibida solo de fuentes propias/Wikipedia; evidenciada es análisis propio del proyecto, no etiquetas de medios. |
| 1.2.0 | 2026-04-15 | La asignación de ideología (label) pasa a `ideology-classification` con fuentes obligatorias por asignación. El cálculo del compás (coordenadas x,y) permanece en este documento. |
