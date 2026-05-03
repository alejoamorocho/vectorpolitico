---
title: Historial de cambios de la metodología
description: Registro de versiones de cada documento de la metodología — qué cambió, cuándo, y por qué. La metodología es viva — esta página deja constancia de su evolución.
order: 90
section: meta
version: 1.0.0
lastUpdated: 2026-04-23
authors:
  - ssi-co
---

## Por qué un changelog

La metodología del proyecto es viva. A medida que se descubren mejores formas de modelar la política colombiana, los documentos se actualizan. Este historial responde dos preguntas que cualquier usuario o contribuidor puede tener:

- **¿Cuándo cambió esto?** — para saber qué versión del análisis es la que ves en el sitio hoy.
- **¿Por qué cambió?** — para que ninguna decisión metodológica parezca arbitraria.

Cada documento tiene su propio bloque de versiones al final; esta página es el **índice consolidado**.

## 2026-04-23 — Auditoría de ideologías y mejoras del compass

Hito grande del proyecto. Se cerraron seis fases de trabajo que llevaron el dataset a coherencia interna y el grid a aplicabilidad real al contexto colombiano.

### Cambios en el grid de ideologías

- **Filtro por país.** El catálogo global tenía ~131 ideologías de la referencia *Political Compass* (Sionismo, Juche, Kuomintangismo, Maoísmo, Fordismo). El generador ahora filtra por `applicable_to_country.co` y produce un grid de ~46 celdas con referente real en Colombia.
- **Tres ideologías agregadas** que faltaban en el catálogo global pero son centrales en Colombia:
  - **Teología de la Liberación** (auth_left) — Camilo Torres, Golconda, Comunidades Eclesiales de Base.
  - **Comunalismo Indígena** (lib_left) — CRIC, ONIC, resguardos, Minga.
  - **Populismo de Derecha** (auth_right) — Liga de Gobernantes (Rodolfo Hernández) y sectores del uribismo de base.
- **Subdivisión de Capitalismo Autoritario** (auth_right inferior) en cuatro sub-celdas: *Clientelismo/Cacicazgo* (Casa Char), *Desarrollismo* (Vargas Lleras), *Derecha Securitaria* (Pinzón) y *Capitalismo Autoritario* (referencia teórica reducida).
- **Movimientos de cuadrante.** *Democracia Cristiana* pasó de auth_left a auth_right (los partidos cristianos colombianos son socio-conservadores, no socialistas-cristianos europeos). *Tecnocracia* pasó de auth_left a lib_right (Fajardo, Galán son centro técnico, no estatistas).

### Cambios en la asignación de figuras y partidos

- 23 partidos colombianos recalibrados con coordenadas auditadas contra fuentes primarias.
- 110 políticos con `dimensionScores` reanalizados por agentes IA dimensión por dimensión, con justificación dimensional para cada uno.
- Se introdujo el [validador de coherencia automática](/metodologia/data-validation) entre coordenada y `dimensionScores`, que ahora corre como red de seguridad permanente.

### Bug histórico documentado

El clasificador automático (Claude API) en su versión inicial asignaba ocasionalmente coordenadas extremas (`x = ±9`) a figuras cuyos `dimensionScores` eran moderados. Esto producía partidos colombianos visualmente sobre celdas como *Sionismo* o *Kuomintangismo* sin que el array de ideologías declaradas dijera nada parecido. El bug se corrigió en dos pasadas: primero matemática (ajuste de scores a coord), después semántica (4 agentes IA recalcularon los scores con análisis fino dimensión por dimensión).

El validador detecta el patrón y lo emite como warning para que no vuelva a ocurrir silenciosamente.

### Documentos actualizados

- [Cómo funciona el mapa](/metodologia/how-it-works) → v2.0.0 (grid curado, proceso clasificación + auditoría + validación).
- [Cómo posicionamos figuras en el compass](/metodologia/compass-scoring) → v1.3.0 (validador automático).
- [Cómo asignamos ideología a cada figura](/metodologia/ideology-classification) → v2.0.0 (grid por país, ideologías agregadas, movimientos de cuadrante, validador).
- [Validación del dataset](/metodologia/data-validation) → v1.0.0 (NUEVO).

---

## 2026-04-15 — Trazabilidad por asignación

Cada asignación de ideología pasa a tener su propia justificación + lista de fuentes. Sin fuentes no hay asignación; el schema lo valida.

- [Cómo asignamos ideología a cada figura](/metodologia/ideology-classification) → v1.0.0 → v1.1.0 (sin límite de distancia self↔evidenced).
- [Cómo posicionamos figuras en el compass](/metodologia/compass-scoring) → v1.2.0 (asignación de label se separa del cálculo de coordenadas).
- [Cómo agregar una figura política](/metodologia/add-politician) → v1.1.0.
- [Fuentes de datos](/metodologia/data-sources) → v1.2.0.

## 2026-04-12 — Distinción autopercibida vs evidenciada

Clarificación de fuentes:
- **Posición autopercibida** se construye exclusivamente desde fuentes propias del actor (sitio oficial, Wikipedia, plataforma de campaña).
- **Posición evidenciada** es análisis propio del proyecto sobre acciones documentadas (votaciones, decretos, ejecución presupuestal). No se copian etiquetas de medios.

- [Cómo posicionamos figuras en el compass](/metodologia/compass-scoring) → v1.0.0 → v1.1.0.

## 2026-04-11 — Apertura del proyecto

Primer release público de la metodología y del dataset.

- [Cómo funciona el mapa](/metodologia/how-it-works) → v1.0.0.

## 2026-04-10 — Versión inicial de los documentos base

- [Cómo posicionamos figuras en el compass](/metodologia/compass-scoring) → v1.0.0.
- [Estándar de incoherencias](/metodologia/incoherence-standard) → v1.0.0.
- [Cómo agregar un nuevo país](/metodologia/add-country) → v1.0.0.
- [Cómo agregar una figura política](/metodologia/add-politician) → v1.0.0.
- [Fuentes de datos](/metodologia/data-sources) → v1.0.0.
