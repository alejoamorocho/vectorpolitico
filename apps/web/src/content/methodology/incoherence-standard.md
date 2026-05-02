---
title: Estándar de incoherencias
description: Los 5 requisitos obligatorios que debe cumplir una incoherencia para ser publicada en Brújula Política.
order: 20
section: incoherence
version: 1.0.0
lastUpdated: 2026-04-10
authors:
  - ssi-co
---

## Qué es una incoherencia

Una **incoherencia** es una contradicción documentada y verificable entre lo que una figura política prometió (o declaró que haría) y lo que realmente hizo al ejercer el cargo.

No es una diferencia de opinión. No es una reinterpretación subjetiva. Es una brecha factual entre dicho y hecho.

## Los 5 requisitos obligatorios

Un PR con una incoherencia **NO se fusiona** si falta cualquiera de estos elementos:

### 1. La promesa (cita textual)

Debe incluir:

- Texto exacto de la declaración (entre comillas)
- URL de la fuente original
- Outlet (medio o institución)
- Fecha en formato ISO YYYY-MM-DD

### 2. La acción contraria (hecho verificable)

Debe incluir:

- Descripción precisa del hecho
- **Fuente primaria** (votación oficial, decreto, resolución, ejecución presupuestal) — **NO Twitter, NO opinión**
- URL, outlet, fecha

### 3. Ambas URLs archivadas en Wayback Machine

Cada fuente debe tener su URL archivada en [web.archive.org](https://web.archive.org/). Si el link original desaparece, la evidencia debe seguir siendo accesible.

### 4. Categoría y severidad justificadas

**Categorías disponibles:**
- `economia`
- `seguridad`
- `derechos_humanos`
- `medio_ambiente`
- `corrupcion`
- `relaciones_exteriores`
- `educacion`
- `salud`

**Niveles de severidad:**
- `low` — divergencia menor o contextual
- `medium` — contradicción clara en un tema importante
- `high` — contradicción fundamental en promesa central de campaña

### 5. Revisión por colaborador distinto

Un segundo colaborador (distinto al que subió el PR) debe revisar y validar el cumplimiento de los 4 requisitos anteriores antes del merge.

## Qué NO es una incoherencia

- **Cambio de opinión explicado y justificado** con contexto factual. La política tiene matices.
- **Pragmatismo en coalición** cuando se declaró como tal durante la campaña.
- **Opiniones periodísticas** sobre "lo que quiso decir" alguien.
- **Tweets** sin respaldo de fuente primaria.
- **Incumplimientos por obstáculos externos** (no depende de la figura).

## Balance ideológico

Brújula Política **no acepta PRs** que sistemáticamente reporten incoherencias de un solo sector político. El valor del proyecto está en ser la misma vara para todos.

Si notas que una figura que admiras tiene más incoherencias documentadas que una que criticas, la pregunta correcta no es "¿por qué atacan a X?" sino "¿quién está dispuesto a documentar las de Y con el mismo rigor?".

## Proceso de disputa

Si consideras que una incoherencia publicada no cumple el estándar:

1. Abre un issue con etiqueta `disputa`
2. Presenta los argumentos con fuentes
3. Los mantenedores revisan en máximo 7 días
4. Si hay mérito, se retira o se corrige con documentación del cambio
