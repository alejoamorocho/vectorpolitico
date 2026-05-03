---
title: Cómo funciona el mapa
description: Explicación completa del mapa político — capas, filtros, zoom, detalles al click, enlaces externos y la tecnología detrás de La Brújula.
order: 5
section: compass
version: 3.0.0
lastUpdated: 2026-04-23
authors:
  - ssi-co
---

## Un mapa, dos preguntas

El mapa político de *La Brújula* responde a dos preguntas distintas sobre cada figura:

1. **¿Dónde dice que está?** — su posición autopercibida 🔵, obtenida exclusivamente de fuentes propias del político o partido (página web oficial, Wikipedia, programa de gobierno registrado).
2. **¿Dónde está realmente?** — su posición evidenciada 🔴, determinada por el análisis propio del proyecto sobre acciones concretas: votaciones legislativas (CongresoVisible), decretos, ejecución presupuestal (Contraloría), y demás evidencia primaria verificable.

La flecha que une ambos puntos es el **índice de coherencia**. Cuando la flecha es corta, la figura actúa como dice; cuando es larga, hay divergencia.

## Las celdas del mapa — universo ideológico completo

El propósito del mapa es **educativo y comparativo**: mostrar la enorme variedad de corrientes ideológicas que existen en el mundo para que el lector pueda ubicar las posiciones colombianas dentro de ese universo amplio. Por eso el grid muestra **135 ideologías** del catálogo internacional — incluyendo corrientes que ningún partido colombiano sigue (Juche, Sionismo, Maoísmo, Kuomintangismo, Distributismo, Mutualismo) pero que son parte del repertorio político global.

Distribución por cuadrante:

- **Autoritario · Izquierda** (33 celdas) — desde extremos teóricos (Hive Mind Collectivism, IngSoc, Eco-Fascismo) hasta corrientes con actores reales (Marxismo clásico, Maoísmo, Castrismo, Chavismo, Estalinismo, Trotskismo, Juche, Dengismo, Teología de la Liberación, Populismo de Izquierda, Distributismo).
- **Autoritario · Derecha** (38 celdas) — Fascismos (clásico, neo-, eso-, Vichismo), Teocracias (cristiana, islámica, hindú, budista), Conservadurismos (paleo-, tradicionalista, nacionalista, neo-, liberal-, progresista, eco-), Democracia Cristiana, Populismo de Derecha, Capitalismo Autoritario y sus variantes (Clientelismo, Desarrollismo, Derecha Securitaria), Imperialismo, Sionismo, Kuomintangismo, Pinochetismo.
- **Libertario · Izquierda** (32 celdas) — Socialismo Democrático, Socialdemocracia, Progresismo, Política Verde, Eco-socialismo, Sindicalismo, Comunalismo Indígena, Marxismo Clásico, Comunismo Libertario, Anarquismos varios (comunista, sindicalista, colectivista, feminista, queer, eco-, religioso, pacifista), Mutualismo, Gandhismo, Mandelismo.
- **Libertario · Derecha** (32 celdas) — Liberalismo Clásico, Social, Democrático, Nórdico, Neoliberalismo, Tercera Vía, Centrismo, Tecnocracia, Conservadurismo Fiscal, Libertarismo, Anarco-capitalismo, Objetivismo, Voluntaryismo, Agorismo, Hoppeanismo, Paleo-libertarismo, Tecno-libertarismo, Georgismo, Capitalismo Rosa, Libertarismo Cristiano.

La retícula es editable desde un YAML legible (`packages/data/ideologies.source.yaml`). Cualquier colaborador puede proponer agregar, dividir o ajustar celdas abriendo un Pull Request. El YAML mantiene también una **lista informativa** `applicable_to_country.co` que documenta qué corrientes tienen actor real en Colombia hoy — es metadata para análisis, no filtro de visualización.

## El proceso: clasificación · auditoría · validación

Para cada figura política la posición en el mapa pasa por tres etapas:

1. **Clasificación inicial con IA.** El script `packages/etl/src/classify_entity.py` toma evidencia primaria de la figura (propuestas, votaciones, decretos, fuentes) y le pide a Claude API que evalúe **8 dimensiones** (4 económicas, 4 sociales) en escala -10 a +10, con justificación por dimensión. Las posiciones `(x, y)` salen del promedio ponderado por tipo de cargo.

2. **Auditoría humana caso por caso.** Las posiciones de la IA pasan por revisión editorial: para cada partido y figura se contrasta la asignación contra fuentes primarias (CongresoVisible, SUIN-Juriscol, Contraloría, Wikipedia, sitios oficiales) y se registra justificación + lista de fuentes en el JSON. Las correcciones quedan trazables en el git history.

3. **Validador automático de coherencia.** El script `scripts/validate_dataset.py` verifica que `compassEvidenced.x|y` sea consistente con el promedio ponderado de los `dimensionScores`. Si el delta supera un umbral (default 3.0 unidades), se reporta como warning para revisión. Detalle en [Validación del dataset](/metodologia/data-validation).

Las tres etapas dejan rastro en archivos auditables: el `dimensionScores` con justificación por dimensión, las `sources[]` con URLs verificables, y los reportes históricos en `docs/data-validation/`.

## El mapa preview

En la portada encontrarás una **versión compacta** del mapa con labels inteligentes: las celdas más grandes muestran su nombre completo, las medianas muestran un nombre truncado, y las más pequeñas aparecen solo como un color. Todo esto cambia cuando haces zoom — los labels emergen progresivamente.

**Haz click en cualquier parte del mapa** para expandirlo a pantalla completa.

## El mapa expandido — modal fullscreen

Al hacer click se abre un panel editorial con el mapa en grande y un **panel lateral** con controles.

### Capas (*layers*)

El panel lateral permite activar o desactivar capas visuales independientes:

- **Cuadrícula de ideologías** — las 135 celdas del universo ideológico completo
- **Ejes y cuadrantes** — las líneas centrales y los títulos de los 4 cuadrantes
- **Figuras políticas** — los puntos 🔵🔴 de cada figura y la flecha que los une
- **Elipses de confianza** — el margen de incertidumbre del punto evidenciado
- **Flechas de coherencia** — la línea que conecta autopercibido y evidenciado

Las capas se pueden combinar: por ejemplo, apagar la cuadrícula para ver solo los puntos de las figuras flotando sobre un fondo vacío, o apagar las elipses para comparar posiciones "puras".

### Filtros

Se pueden filtrar las figuras mostradas por:

- **Cargo** — presidentes, candidatos, senadores, representantes, gobernadores, alcaldes
- **Partido** — cualquiera de los 8 partidos colombianos seed
- **Confianza** — alta, media o baja del score evidenciado

### Búsqueda

Un buscador libre filtra tanto figuras como ideologías por nombre (español o inglés).

### Click para detalles

- **Click en una ideología** → panel de detalle con descripción editorial, pensadores clave, ejemplos históricos, y enlaces a fuentes externas estandarizadas (Wikipedia ES/EN, Stanford Encyclopedia of Philosophy, Britannica, Internet Archive, Google Scholar).
- **Click en una figura** → panel de detalle con delta, confianza, posiciones exactas, link al perfil completo dentro del sitio, y link al partido al que pertenece.

## Enlaces externos estandarizados

Cada ideología tiene automáticamente los mismos 6 enlaces generados dinámicamente desde su nombre:

1. **Wikipedia (ES)** — versión en español
2. **Wikipedia (EN)** — versión en inglés (suele tener más cobertura)
3. **Stanford Encyclopedia of Philosophy** — análisis académico riguroso
4. **Britannica** — referencia enciclopédica general
5. **Internet Archive** — libros, artículos y material histórico
6. **Google Scholar** — literatura académica revisada por pares

Para partidos políticos los enlaces son distintos: Wikipedia, CNE (Consejo Nacional Electoral), Registraduría Nacional, Google News e Internet Archive.

No guardamos estos enlaces en los JSON — se calculan en `packages/web/src/components/compass/lib/external-links.ts` a partir del nombre de la entidad. Esto garantiza que todas las ideologías tengan el mismo conjunto de recursos disponibles sin trabajo manual.

## Controles del zoom

- **Scroll (ratón) o pinch (trackpad/móvil)** para hacer zoom in/out
- **Arrastrar** para mover el mapa
- **Botones +/−** en la esquina superior derecha
- **Botón ⊚** para reiniciar a la vista completa

El zoom máximo es 12× y el mínimo es 1× (la vista completa del compass).

## Tecnología

El mapa está implementado con:

- **React** maneja el árbol de elementos SVG (accesibilidad, hidratación parcial desde Astro).
- **D3.js** maneja únicamente lo imperativo: zoom (`d3-zoom`), escalas (`d3-scale`), hit-test eficiente (`d3-quadtree`).
- **SVG** renderiza las celdas con `vectorEffect="non-scaling-stroke"` para que los bordes mantengan su grosor al hacer zoom.
- **Smart labels zoom-aware** — cada celda calcula su tamaño efectivo en píxeles según el zoom actual y decide si mostrar su label completo, truncado o solo color.
- **Phosphor Icons** (duotone) para la iconografía editorial.
- **Playfair Display + EB Garamond** como tipografías serif clásicas.

## Accesibilidad

- El SVG tiene `role="img"`, `<title>`, `<desc>` para lectores de pantalla.
- Cada figura tiene `aria-label` con su nombre y posiciones.
- Los labels de las celdas se renderizan con `paint-order: stroke fill` + stroke blanco para legibilidad sobre cualquier color de fondo.
- Respetamos `prefers-reduced-motion` — todas las animaciones se desactivan automáticamente.
- Todos los controles del modal son accesibles por teclado.
- La tecla `Escape` cierra el modal.

## Lo que no hace (aún)

- **Heatmap de densidad** — futuro: una capa que muestre zonas más/menos pobladas del mapa.
- **Trayectoria temporal** — futuro: ver cómo una figura se ha movido en el mapa a lo largo de los años.
- **Comparar figuras** — futuro: seleccionar dos figuras y ver sus posiciones enfrentadas.
- **Red de coaliciones** — futuro: enlazar figuras que han formado coaliciones legislativas.

## Cómo contribuir al mapa

Para añadir o corregir una celda:

1. Edita `packages/data/ideologies.source.yaml` con la nueva entrada (respetando la estructura de cuadrantes y familias).
2. Ejecuta `pnpm generate:ideologies` para regenerar el `ideologies.json`.
3. Ejecuta `pnpm validate:data` para confirmar que todo cumple el schema.
4. Abre un PR con el cambio.

Para añadir una figura política, lee [Cómo agregar una figura](/metodologia/add-politician).
