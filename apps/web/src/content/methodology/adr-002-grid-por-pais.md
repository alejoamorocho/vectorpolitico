---
title: ADR-002 — Grid de ideologías curado por país
description: Decisión de filtrar el catálogo global de ideologías (~131) a un subconjunto aplicable por país (~46 para Colombia) en vez de mostrar todas las celdas teóricas en cualquier brújula nacional.
order: 81
section: adr
version: 1.0.0
lastUpdated: 2026-04-23
authors:
  - ssi-co
relatedDocs:
  - ideology-classification
  - data-validation
---

> **Estado:** **Superseded por [ADR-003](/metodologia/adr-003-grid-completo-educativo)** el mismo día (2026-04-23) · **Fecha de decisión original:** 2026-04-23

> ⚠️ Esta decisión fue revertida poco después de implementarse. Se conserva el documento como registro histórico del razonamiento. La decisión vigente es ADR-003: el grid muestra el universo completo de 135 corrientes y las posiciones de actores se anclan al centroide de su ideología declarada. Las adiciones estructurales descritas abajo (3 ideologías nuevas, subdivisión de authoritarian-capitalism, movimientos de cuadrante) se mantienen y son parte del catálogo actual.

## Contexto

El proyecto inició con el catálogo global del *Political Compass Memes* — alrededor de 131 corrientes ideológicas que cubren todo el espacio político global, desde Sionismo hasta Juche pasando por Kuomintangismo, Maoísmo, Fordismo, Teocracia hindú y Anarcho-comunismo de consejos. Cada celda tiene un rectángulo en uno de los cuatro cuadrantes del compás según un treemap squarified determinista.

Cuando se inició el seeding de actores colombianos (23 partidos, 110 políticos), apareció un problema visual sistemático: **muchas figuras caían sobre celdas teóricas sin ningún actor real en Colombia**. Ejemplos documentados en el dataset inicial:

- Centro Democrático y Salvación Nacional caían visualmente sobre la celda **Sionismo**.
- Colombia Justa Libres caía sobre **Kuomintangismo**.
- Otros partidos caían sobre **Teocracia hindú**, **Darwinismo social**, **Imperialismo**.

Esto producía dos problemas:

1. **Confusión visual.** Un usuario veía partidos colombianos "sobre" Sionismo o Teocracia hindú sin que el array `ideologies[]` declarado dijera nada parecido. La etiqueta visible contradecía la etiqueta declarada.
2. **Imposibilidad de discriminar perfiles colombianos reales.** La celda *Capitalismo Autoritario* (modelo Singapur/China) ocupaba toda la mitad inferior del cuadrante auth_right y absorbía a todo conservador moderado, todo populista pragmático y todo desarrollismo en una misma etiqueta absurda.

## Decisión

**Filtrar el grid por país** en tiempo de generación. El catálogo `ideologies.source.yaml` mantiene las ~131 corrientes globales como referencia teórica, pero el bloque `applicable_to_country.co` enumera explícitamente las ~46 corrientes aplicables al contexto colombiano. El generador (`packages/etl/src/generate_ideologies.py`) acepta `--country=co` y filtra antes del treemap.

Las celdas restantes se redistribuyen automáticamente para cubrir los cuatro cuadrantes sin huecos.

### Criterio de inclusión

Una ideología queda en el grid colombiano si cumple al menos uno:

1. Ha tenido **partido, movimiento o figura pública identificable** en Colombia en los últimos ~60 años.
2. Existe **debate político vigente** sobre ella, aunque sin partido formal (ej. anarco-capitalismo post-Milei en redes y think-tanks).
3. Es una **familia ideológica de referencia** necesaria para anclar otras posiciones.

### Adiciones específicas

Tres ideologías agregadas al catálogo porque eran centrales en Colombia pero ausentes en la referencia global:

- **Teología de la Liberación** (auth_left) — Camilo Torres, Golconda, Comunidades Eclesiales de Base.
- **Comunalismo Indígena** (lib_left) — CRIC, ONIC, resguardos, Minga.
- **Populismo de Derecha** (auth_right) — Liga de Gobernantes (Rodolfo Hernández) y sectores del uribismo de base.

### Subdivisión de Capitalismo Autoritario

La celda gigante de la mitad inferior auth_right se subdividió en cuatro sub-celdas con perfiles diferenciados:

- **Clientelismo / Cacicazgo** (Casa Char, gamonalismo).
- **Desarrollismo** (Vargas Lleras, pragmatismo CEPAL).
- **Derecha Securitaria** (Pinzón, uribismo post-conflicto moderado).
- **Capitalismo Autoritario** (referencia teórica reducida — Singapur, China contemporánea).

### Movimientos de cuadrante

- **Democracia Cristiana** pasó de auth_left a auth_right (los partidos cristianos colombianos son socio-conservadores, no socialistas-cristianos europeos).
- **Tecnocracia** pasó de auth_left a lib_right (proyectos como Fajardo o Galán son centro técnico, no estatistas autoritarios).

## Consecuencias

**Positivas**

- Cero partidos visualmente sobre celdas absurdas: el partido en (x, y) ahora cae siempre en una celda con referente colombiano real.
- El validador automático ([data-validation](/metodologia/data-validation)) puede usar el grid filtrado como fuente de verdad para chequear coherencia.
- El framework es replicable a otros países: cada país añade su propio bloque `applicable_to_country.<código>` con su lista curada.

**Negativas**

- El grid colombiano ya no es directamente comparable con el grid de otro país por celda — solo por cuadrante.
- Requiere mantenimiento humano de la lista por país (la decisión "qué aplica a Colombia" es curatorial y debe revisarse periódicamente con el debate público vigente).
- Pequeño riesgo de exclusión cultural si el curador olvida una corriente emergente — mitigado por el campo `applicable_to_country` editable en PR.

## Alternativas consideradas

- **No filtrar; aceptar las celdas absurdas.** Rechazada porque rompe la confianza del usuario en la visualización ("¿por qué este partido aparece sobre Sionismo?").
- **Recalibrar coordenadas de partidos.** Rechazada como única solución porque trataba el síntoma, no la causa: incluso con coords perfectas, las celdas teóricas seguían visibles y absorbían partidos cuando alguien las pisara levemente.
- **Crear un grid colombiano desde cero.** Rechazada por pérdida de comparabilidad teórica con la referencia global y por costo de mantenimiento.

La decisión actual mantiene el catálogo global como referencia teórica completa y solo filtra en tiempo de render — lo mejor de ambos mundos.

## Referencias

- Implementación: commits `e0349cf`, `cee408e`, `baa9862`, `b43c51c`, `0cd4817`.
- Doc relacionada: [ideology-classification](/metodologia/ideology-classification) (sección "Grid curado por país").
- Doc relacionada: [data-validation](/metodologia/data-validation).
- Spec interno: `docs/superpowers/specs/2026-04-23-auditoria-ideologias-y-ui-compass-design.md`.
