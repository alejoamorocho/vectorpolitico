# Fase 0 — UI Fixes del Compass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el mapa del home cargue completo sin necesidad de pan/zoom manual, y que las 4 capas de filtros del sidebar arranquen apagadas por defecto.

**Architecture:** Dos cambios independientes en componentes y hooks existentes del compass. Sin archivos nuevos, sin cambios de schema, sin nuevas dependencias. Se exponen dos pequeñas unidades puras (`INITIAL_LAYERS_OFF` y `computeFitTransform`) para aislar la lógica y facilitar razonamiento.

**Tech Stack:** TypeScript, React 18, d3-zoom, d3-selection, Astro 5 (dev server + build), pnpm workspaces.

**Spec:** `docs/superpowers/specs/2026-04-23-auditoria-ideologias-y-ui-compass-design.md` (Fase 0).

**Nota sobre tests:** el proyecto `@brujula/web` tiene `vitest` en deps (`apps/web/package.json:51`) pero no hay `vitest.config.*` ni tests previos. Montar infraestructura de tests React + jsdom + testing-library solo para estos 2 fixes sería YAGNI y rompe con los patrones del codebase. Este plan usa **verificación manual con dev server + curl + inspección visual** como criterio de éxito. La extracción de funciones puras (`computeFitTransform`) deja la puerta abierta para agregar tests en el futuro sin refactor.

---

## Task 1: Apagar las capas por defecto

**Files:**
- Modify: `apps/web/src/components/compass/CompassWithModal.tsx:12-17`

**Motivación:** hoy `INITIAL_LAYERS` tiene los 4 booleans en `true`, por lo que al cargar el mapa aparecen todos los diamantes encima del grid. El usuario quiere la pantalla limpia al entrar; que encienda capas a gusto.

- [ ] **Step 1.1: Leer el archivo para confirmar estado actual**

Run: lee `apps/web/src/components/compass/CompassWithModal.tsx` líneas 12-17. Debe verse exactamente así antes del cambio:

```ts
const INITIAL_LAYERS: CompassLayerState = {
  selfPerceived: true,
  evidenced: true,
  arrows: true,
  parties: true,
};
```

- [ ] **Step 1.2: Aplicar el cambio**

Modificar `CompassWithModal.tsx:12-17` a:

```ts
const INITIAL_LAYERS: CompassLayerState = {
  selfPerceived: false,
  evidenced: false,
  arrows: false,
  parties: false,
};
```

No tocar nada más en el archivo. No renombrar el símbolo. El resto del componente ya respeta el estado via `useState(INITIAL_LAYERS)` en la línea 22.

- [ ] **Step 1.3: Verificar build**

```bash
pnpm --filter @brujula/web build
```

Expected: build pasa sin errores. El output termina con "Complete!" y "Finished in X seconds" de Pagefind.

- [ ] **Step 1.4: Verificar dev server**

```bash
pnpm --filter @brujula/web dev --host 127.0.0.1 --port 4321
```

Luego en otra terminal:

```bash
curl -s http://127.0.0.1:4321/ | grep -oE 'checked' | head -5
```

Expected: el HTML del home NO contiene el atributo `checked` en los 4 checkboxes de capas (porque `selfPerceived/evidenced/arrows/parties` arrancan en `false`).

- [ ] **Step 1.5: Verificar visualmente**

Abrir `http://127.0.0.1:4321/` en el navegador. Resultado esperado:
- Sidebar izquierdo: los 4 checkboxes bajo "CAPAS" (Autopercibido, Evidenciado, Flechas, Partidos) están **desmarcados**.
- Área del mapa: solo se ve el grid de ideologías + ejes. **Ningún diamante ni punto circular** encima de las celdas.
- Encender manualmente "Partidos" → aparecen los diamantes (funcionalidad intacta).
- Apagar "Partidos" de nuevo → desaparecen.

Si alguno de estos puntos falla, detener y diagnosticar antes de continuar.

- [ ] **Step 1.6: Commit**

```bash
git add apps/web/src/components/compass/CompassWithModal.tsx
git commit -m "fix(compass): filtros apagados por defecto al cargar el home

Las 4 capas del sidebar (selfPerceived, evidenced, arrows, parties)
ahora arrancan en false. El usuario enciende a gusto. Evita la
sensación de sobresaturación del mapa al entrar.

Fase 0.1 del spec 2026-04-23-auditoria-ideologias-y-ui-compass."
```

---

## Task 2: Permitir zoom menor que 1 en el hook

**Files:**
- Modify: `apps/web/src/components/compass/hooks/useCompassZoom.ts:18-23`
- Modify: `apps/web/src/components/compass/Compass.tsx:81-84`

**Motivación:** el hook tiene `minScale = 1` por defecto, lo que impide cualquier zoom-out por debajo de 1:1. Para hacer fit-to-viewport necesitamos `k < 1` cuando el grid es más grande que el contenedor. Bajamos `minScale` a `0.25`.

- [ ] **Step 2.1: Modificar el default de minScale en el hook**

Editar `apps/web/src/components/compass/hooks/useCompassZoom.ts` líneas 17-23.

Antes:

```ts
export function useCompassZoom(
  svgRef: RefObject<SVGSVGElement>,
  {
    minScale = 1,
    maxScale = 12,
  }: {
    minScale?: number;
    maxScale?: number;
  } = {},
) {
```

Después:

```ts
export function useCompassZoom(
  svgRef: RefObject<SVGSVGElement>,
  {
    minScale = 0.25,
    maxScale = 12,
  }: {
    minScale?: number;
    maxScale?: number;
  } = {},
) {
```

- [ ] **Step 2.2: Pasar minScale explícito desde Compass.tsx**

Editar `apps/web/src/components/compass/Compass.tsx:81-84`.

Antes:

```ts
const { transform, isActive, justActivatedRef, reset, zoomIn, zoomOut } = useCompassZoom(svgRef, {
  minScale: 1,
  maxScale: 12,
});
```

Después:

```ts
const { transform, isActive, justActivatedRef, reset, zoomIn, zoomOut } = useCompassZoom(svgRef, {
  minScale: 0.25,
  maxScale: 12,
});
```

- [ ] **Step 2.3: Verificar build**

```bash
pnpm --filter @brujula/web build
```

Expected: pasa sin errores de TypeScript ni del adaptador Cloudflare.

- [ ] **Step 2.4: Verificar dev server sin regresiones**

Con el dev server corriendo, abrir `http://127.0.0.1:4321/` y:
- Encender "Partidos" (para que haya algo que arrastrar).
- Click en el mapa para activarlo.
- Usar el botón `−` del control de zoom (esquina superior derecha del mapa) varias veces. Debe poder reducirse por debajo del 100% (ahora llega hasta 25%).
- Click fuera del mapa o Escape para desactivar.

Si no hay regresión visible, continuar.

- [ ] **Step 2.5: Commit**

```bash
git add apps/web/src/components/compass/hooks/useCompassZoom.ts apps/web/src/components/compass/Compass.tsx
git commit -m "refactor(compass): bajar minScale a 0.25 para permitir fit-to-viewport

Preparación para Task 3: el transform inicial necesita k<1 cuando
el grid es más grande que el contenedor. minScale=1 bloqueaba esa
posibilidad. El cambio no afecta la UX actual porque el transform
inicial sigue siendo zoomIdentity (k=1); el nuevo rango solo se
usará en el próximo commit.

Fase 0.2a del spec 2026-04-23-auditoria-ideologias-y-ui-compass."
```

---

## Task 3: Extraer función pura `computeFitTransform`

**Files:**
- Create: `apps/web/src/components/compass/lib/fitTransform.ts`

**Motivación:** separar el cálculo geométrico del hook para que sea trivial razonarlo, probarlo a mano, y potencialmente testearlo en el futuro sin necesidad de jsdom.

- [ ] **Step 3.1: Crear el archivo nuevo**

Crear `apps/web/src/components/compass/lib/fitTransform.ts` con exactamente este contenido:

```ts
import { zoomIdentity, type ZoomTransform } from 'd3-zoom';

/**
 * Calcula un ZoomTransform que escala y centra un contenido de
 * `contentWidth × contentHeight` dentro de un viewport de
 * `viewportWidth × viewportHeight`, preservando aspect ratio y
 * dejando un margen relativo.
 *
 * @param viewportWidth  ancho disponible del contenedor (px)
 * @param viewportHeight alto disponible del contenedor (px)
 * @param contentWidth   ancho del contenido a encajar (px)
 * @param contentHeight  alto del contenido a encajar (px)
 * @param margin         fracción de margen en cada lado (0.05 = 5%)
 */
export function computeFitTransform(
  viewportWidth: number,
  viewportHeight: number,
  contentWidth: number,
  contentHeight: number,
  margin = 0.05,
): ZoomTransform {
  if (
    viewportWidth <= 0 ||
    viewportHeight <= 0 ||
    contentWidth <= 0 ||
    contentHeight <= 0
  ) {
    return zoomIdentity;
  }
  const usableW = viewportWidth * (1 - 2 * margin);
  const usableH = viewportHeight * (1 - 2 * margin);
  const k = Math.min(usableW / contentWidth, usableH / contentHeight);
  const tx = (viewportWidth - contentWidth * k) / 2;
  const ty = (viewportHeight - contentHeight * k) / 2;
  return zoomIdentity.translate(tx, ty).scale(k);
}
```

- [ ] **Step 3.2: Verificar build con el archivo nuevo (aunque aún no se use)**

```bash
pnpm --filter @brujula/web build
```

Expected: pasa sin errores. TypeScript reconoce el nuevo archivo pero no lo importa nadie todavía.

- [ ] **Step 3.3: Sanity-check del cálculo (manual)**

Mentalmente (o en la consola del navegador una vez importado en Task 4):

```js
// viewport 800x600, contenido 1000x1000, margen 5%
// usable = 800*0.9=720, 600*0.9=540
// k = min(720/1000, 540/1000) = 0.54
// tx = (800 - 1000*0.54) / 2 = 130
// ty = (600 - 1000*0.54) / 2 = 30
// transform: translate(130, 30) scale(0.54)
```

Este paso no es ejecutable, es mental check que la fórmula es correcta.

- [ ] **Step 3.4: Commit**

```bash
git add apps/web/src/components/compass/lib/fitTransform.ts
git commit -m "feat(compass): add computeFitTransform pure function

Helper geometrico para calcular un ZoomTransform que encaja un
contenido de tamaño conocido dentro de un viewport, preservando
aspect ratio y con margen configurable. Función pura, sin dependencias
de DOM ni React. Usada en el siguiente commit desde useCompassZoom.

Fase 0.2b del spec 2026-04-23-auditoria-ideologias-y-ui-compass."
```

---

## Task 4: Aplicar fit-to-viewport en el mount

**Files:**
- Modify: `apps/web/src/components/compass/hooks/useCompassZoom.ts`

**Motivación:** al montar el hook y cuando cambian las dimensiones, calcular el fit y aplicarlo via `d3-zoom.transform` para que el estado interno del zoom behavior quede sincronizado con el nuevo transform (importante para que los botones +/− funcionen partiendo de la vista fit).

- [ ] **Step 4.1: Expandir la API del hook**

Editar `apps/web/src/components/compass/hooks/useCompassZoom.ts`. Los cambios son varios pero todos en el mismo archivo. Aplicarlos en orden:

**Cambio A — agregar import y aceptar dimensiones opcionales en las options:**

Antes (líneas 1-24):

```ts
import { useEffect, useRef, useState, useCallback, type RefObject } from 'react';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';

/**
 * Hook para zoom/pan con activación en un solo gesto.
 *
 * Al primer mousedown en el SVG inactivo:
 *   1. Se activa el mapa sincrónicamente (borde visible) ANTES de que d3 evalúe.
 *   2. d3 inicia el tracking del drag — si el usuario arrastra, paneá inmediato.
 *   3. Si solo hace click sin moverse, `justActivatedRef` bloquea la navegación
 *      (ej: no abrir la página de un partido en el click que solo activó).
 * Click fuera del SVG o Escape desactiva.
 */
export function useCompassZoom(
  svgRef: RefObject<SVGSVGElement>,
  {
    minScale = 0.25,
    maxScale = 12,
  }: {
    minScale?: number;
    maxScale?: number;
  } = {},
) {
```

Después:

```ts
import { useEffect, useRef, useState, useCallback, type RefObject } from 'react';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
import { computeFitTransform } from '../lib/fitTransform';

/**
 * Hook para zoom/pan con activación en un solo gesto.
 *
 * Al primer mousedown en el SVG inactivo:
 *   1. Se activa el mapa sincrónicamente (borde visible) ANTES de que d3 evalúe.
 *   2. d3 inicia el tracking del drag — si el usuario arrastra, paneá inmediato.
 *   3. Si solo hace click sin moverse, `justActivatedRef` bloquea la navegación
 *      (ej: no abrir la página de un partido en el click que solo activó).
 * Click fuera del SVG o Escape desactiva.
 *
 * Fit inicial: si se pasan `contentWidth` y `contentHeight`, el hook
 * calcula un transform que encaja el contenido dentro del SVG en el
 * primer render (y en re-sizes del contenido). El usuario puede
 * luego hacer zoom manual sin que el fit se vuelva a aplicar.
 */
export function useCompassZoom(
  svgRef: RefObject<SVGSVGElement>,
  {
    minScale = 0.25,
    maxScale = 12,
    contentWidth,
    contentHeight,
  }: {
    minScale?: number;
    maxScale?: number;
    contentWidth?: number;
    contentHeight?: number;
  } = {},
) {
```

**Cambio B — agregar ref para "ya hicimos fit con estas dimensiones" y el efecto que aplica el fit:**

Después de la línea que dice `const justActivatedRef = useRef(false);` (antes de `isActiveRef.current = isActive;`), agregar:

```ts
  /** Última dimensión (w, h) a la que aplicamos fit. Evita re-fittear en cada render. */
  const lastFitRef = useRef<{ w: number; h: number } | null>(null);
```

**Cambio C — agregar el useEffect del fit al final del cuerpo del hook (antes de `return`):**

Justo antes del `return { transform, isActive, justActivatedRef, reset, zoomIn, zoomOut };`, agregar:

```ts
  // Fit inicial al viewport cuando hay dimensiones de contenido.
  useEffect(() => {
    const svgEl = svgRef.current;
    const behavior = behaviorRef.current;
    if (!svgEl || !behavior) return;
    if (contentWidth == null || contentHeight == null) return;
    if (contentWidth <= 0 || contentHeight <= 0) return;

    const rect = svgEl.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    // Ya fitteamos para este par exacto, no repetir.
    const last = lastFitRef.current;
    if (last && last.w === contentWidth && last.h === contentHeight) return;
    lastFitRef.current = { w: contentWidth, h: contentHeight };

    const fit = computeFitTransform(rect.width, rect.height, contentWidth, contentHeight, 0.05);
    select(svgEl).call(behavior.transform, fit);
  }, [svgRef, contentWidth, contentHeight]);
```

**Cambio D — cambiar `reset()` para que reinicie al fit, no al identity:**

Reemplazar el bloque existente de `reset` (líneas ~114-120 según el estado actual):

Antes:

```ts
  const reset = useCallback(() => {
    if (!svgRef.current || !behaviorRef.current) return;
    select(svgRef.current)
      .transition()
      .duration(400)
      .call(behaviorRef.current.transform, zoomIdentity);
  }, [svgRef]);
```

Después:

```ts
  const reset = useCallback(() => {
    const svgEl = svgRef.current;
    const behavior = behaviorRef.current;
    if (!svgEl || !behavior) return;
    const rect = svgEl.getBoundingClientRect();
    const target =
      contentWidth != null && contentHeight != null && rect.width > 0 && rect.height > 0
        ? computeFitTransform(rect.width, rect.height, contentWidth, contentHeight, 0.05)
        : zoomIdentity;
    select(svgEl).transition().duration(400).call(behavior.transform, target);
  }, [svgRef, contentWidth, contentHeight]);
```

- [ ] **Step 4.2: Verificar build**

```bash
pnpm --filter @brujula/web build
```

Expected: pasa sin errores. Si hay error de tipo "computeFitTransform is not exported", verificar paths y que Task 3 se completó.

- [ ] **Step 4.3: Verificar dev server (no romper zoom manual)**

Con dev corriendo, en `/`:
- Click en el mapa → debe activarse con borde visible.
- Usar botones `+` y `−` → zoom sube y baja.
- Usar el botón `⟲` (reset) → el mapa vuelve al fit, NO al zoom identity (sigue viéndose el grid completo).
- Click fuera o Escape → desactiva el zoom.

- [ ] **Step 4.4: Commit**

```bash
git add apps/web/src/components/compass/hooks/useCompassZoom.ts
git commit -m "feat(compass): useCompassZoom soporta fit-to-viewport inicial

El hook ahora acepta contentWidth/contentHeight opcionales. Cuando
se pasan, calcula y aplica un ZoomTransform que encaja el contenido
en el SVG al montar (y cuando cambian las dimensiones). El estado
interno de d3-zoom queda sincronizado via behavior.transform, por lo
que +/- siguen funcionando partiendo del nuevo fit. reset() ahora
vuelve al fit en vez de zoomIdentity.

Sin cambios en el sitio: aún no se pasan contentWidth/Height desde
Compass.tsx. Ese wiring viene en el siguiente commit.

Fase 0.2c del spec 2026-04-23-auditoria-ideologias-y-ui-compass."
```

---

## Task 5: Wire del fit desde Compass.tsx

**Files:**
- Modify: `apps/web/src/components/compass/Compass.tsx:80-84`

**Motivación:** pasar `size` como `contentWidth` y `contentHeight` al hook. El grid de la brújula es cuadrado (ancho = alto = size).

- [ ] **Step 5.1: Modificar la llamada al hook**

Editar `apps/web/src/components/compass/Compass.tsx:81-84`.

Antes:

```ts
const { transform, isActive, justActivatedRef, reset, zoomIn, zoomOut } = useCompassZoom(svgRef, {
  minScale: 0.25,
  maxScale: 12,
});
```

Después:

```ts
const { transform, isActive, justActivatedRef, reset, zoomIn, zoomOut } = useCompassZoom(svgRef, {
  minScale: 0.25,
  maxScale: 12,
  contentWidth: size,
  contentHeight: size,
});
```

- [ ] **Step 5.2: Verificar build**

```bash
pnpm --filter @brujula/web build
```

Expected: pasa sin errores.

- [ ] **Step 5.3: Verificación visual definitiva**

Con dev corriendo, abrir `http://127.0.0.1:4321/` en el navegador. Resultado esperado:

- El mapa **completo** es visible al cargar. Se ve la cuadrícula entera desde Trotskismo (esquina auth-left) hasta Conservadurismo progresista (esquina lib-right, abajo derecha).
- **No hay que hacer pan ni zoom-out manual** para ver las celdas de los bordes.
- Margen de ~5% alrededor del grid (el grid no toca los bordes del contenedor).
- Las 4 capas del sidebar están apagadas (del Task 1).
- Encender "Partidos" → los diamantes aparecen en sus posiciones correctas (siguen cayendo en celdas absurdas como Sionismo — eso lo arregla Fase 1/2, no Fase 0).
- Click en el mapa + botón `−` → se puede hacer zoom-out aún más allá del fit.
- Click en el mapa + botón `+` → se puede hacer zoom-in.
- Click en el botón `⟲` (reset) → vuelve al fit (no a identity).

Si alguno de estos falla, detener y diagnosticar antes del merge.

- [ ] **Step 5.4: Hacer screenshot de control para registro (opcional)**

Si el servidor visual/Chrome MCP está conectado, tomar un screenshot del home completo para archivar el estado "después de Fase 0".

- [ ] **Step 5.5: Commit**

```bash
git add apps/web/src/components/compass/Compass.tsx
git commit -m "feat(compass): wire fit-to-viewport al montar el home

Pasa size como contentWidth/Height al hook. Resultado: el grid
completo se ve al cargar el home sin pan ni zoom manual. El usuario
puede luego hacer zoom libremente, y el botón de reset vuelve al
fit (no a zoomIdentity).

Cierra Fase 0 del spec 2026-04-23-auditoria-ideologias-y-ui-compass.
Los diamantes siguen cayendo en celdas absurdas — eso lo arregla
Fase 1 (curación del grid) y Fase 2 (reauditoría de partidos)."
```

---

## Task 6: Verificación end-to-end de la Fase 0

**Files:** ninguno modificado. Este task es solo verificación.

- [ ] **Step 6.1: Build completo limpio**

```bash
pnpm --filter @brujula/web build
```

Expected: termina con "Complete!" y pagefind indexa 259 páginas (o el número actual) sin warnings que no existieran antes.

- [ ] **Step 6.2: Smoke test de rutas**

Con dev corriendo:

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:4321/
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:4321/ideologias
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:4321/partidos
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:4321/metodologia
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:4321/about
```

Expected: las 5 rutas responden HTTP 200.

- [ ] **Step 6.3: Git log de la fase**

```bash
git log --oneline main..HEAD
```

Expected: 5 commits, en orden:
1. fix(compass): filtros apagados por defecto al cargar el home
2. refactor(compass): bajar minScale a 0.25 para permitir fit-to-viewport
3. feat(compass): add computeFitTransform pure function
4. feat(compass): useCompassZoom soporta fit-to-viewport inicial
5. feat(compass): wire fit-to-viewport al montar el home

- [ ] **Step 6.4: Hand-off a Fase 1**

La Fase 0 está lista para PR. Próxima acción: escribir el plan de Fase 1 (curación del grid ideológico a ~35 aplicables a Colombia). Ese plan no está escrito todavía — se redacta cuando se inicie Fase 1.

Notas para el PR:
- Título sugerido: `fix(compass): Fase 0 — fit-to-viewport y filtros off por defecto`
- Body: copiar los 5 mensajes de commit + el link al spec.
- Test plan: replicar los pasos de verificación del Step 5.3 y 6.2 en el reviewer.
