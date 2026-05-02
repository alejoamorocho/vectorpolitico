---
title: Cómo funciona el mapa
description: Explicación completa del mapa político — capas, filtros, zoom, detalles al click, enlaces externos y la tecnología detrás de La Brújula.
order: 5
section: compass
version: 1.0.0
lastUpdated: 2026-04-11
authors:
  - ssi-co
---

## Un mapa, dos preguntas

El mapa político de *La Brújula* responde a dos preguntas distintas sobre cada figura:

1. **¿Dónde dice que está?** — su posición autopercibida 🔵, obtenida exclusivamente de fuentes propias del político o partido (página web oficial, Wikipedia, programa de gobierno registrado).
2. **¿Dónde está realmente?** — su posición evidenciada 🔴, determinada por el análisis propio del proyecto sobre acciones concretas: votaciones legislativas (CongresoVisible), decretos, ejecución presupuestal (Contraloría), y demás evidencia primaria verificable.

La flecha que une ambos puntos es el **índice de coherencia**. Cuando la flecha es corta, la figura actúa como dice; cuando es larga, hay divergencia.

## Las celdas del mapa

El mapa organiza corrientes ideológicas en una retícula uniforme de cuatro cuadrantes, adaptada al contexto político colombiano y latinoamericano. Las categorías provienen de la teoría politológica estándar y fueron filtradas para conservar únicamente aquellas con referentes reales en el debate público del país:

- **Autoritario · Izquierda** (rojo polvo) — Estalinismo, Maoísmo, Castrismo, Chavismo, Leninismo, Trotskismo…
- **Autoritario · Derecha** (azul polvo) — Fascismo, Capitalismo Autoritario, Pinochetismo, Neoconservadurismo, Conservadurismo Nacionalista…
- **Libertario · Izquierda** (verde salvia) — Socialdemocracia, Socialismo Democrático, Anarco-sindicalismo, Comunalismo, Eco-socialismo…
- **Libertario · Derecha** (dorado trigo) — Liberalismo Clásico, Minarquismo, Anarco-capitalismo, Neoliberalismo, Objetivismo…

La retícula es editable desde un YAML legible (`packages/data/ideologies.source.yaml`). Cualquier colaborador puede proponer ajustes abriendo un Pull Request.

## El mapa preview

En la portada encontrarás una **versión compacta** del mapa con labels inteligentes: las celdas más grandes muestran su nombre completo, las medianas muestran un nombre truncado, y las más pequeñas aparecen solo como un color. Todo esto cambia cuando haces zoom — los labels emergen progresivamente.

**Haz click en cualquier parte del mapa** para expandirlo a pantalla completa.

## El mapa expandido — modal fullscreen

Al hacer click se abre un panel editorial con el mapa en grande y un **panel lateral** con controles.

### Capas (*layers*)

El panel lateral permite activar o desactivar capas visuales independientes:

- **Cuadrícula de ideologías** — las 131 celdas del compass
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
