# Auditoría de ideologías y fixes UI del compass — Brújula Política

**Fecha:** 2026-04-23
**Estado:** Spec aprobado por el usuario (pendiente de revisión final)
**Alcance:** Solo Colombia (país `co`)

## Contexto

La Brújula Política renderiza partidos y políticos colombianos sobre un grid de 112 ideologías heredado de la referencia global de PoliticalCompass. Al inspeccionar el home (`/`) se observan dos problemas combinados:

1. **El mapa aparece cortado** al cargar — el transform inicial es `zoomIdentity` (k=1) sin fit-to-viewport, y el dominio del grid (-10..+10) excede el contenedor.
2. **Los diamantes de los partidos caen visualmente sobre celdas absurdas** para Colombia (Sionismo, Teocracia hindú, Kuomintangismo, Darwinismo social), aunque sus arrays `ideologies[]` declaren etiquetas correctas. La causa es que las coordenadas `(x, y)` — especialmente el eje Y (autoritario) — están exageradas, y al mismo tiempo el grid mantiene celdas teóricas sin contrapartida colombiana como etiquetas visibles. Ejemplos confirmados:
   - `centro-democratico (6.5, 5.5)` → cae en celda `zionism`.
   - `salvacion-nacional (7, 5.5)` → cae en celda `zionism` / `social-darwinism`.
   - `colombia-justa-libres (3, 5)` → cae en celda `kuomintangism`.

Además, `INITIAL_LAYERS` arranca con las cuatro capas encendidas, por lo que el mapa carga sobresaturado.

## Objetivo

Dejar el compass coherente con el contexto colombiano: mapa completo visible al cargar, UI limpia por defecto, grid curado a ideologías aplicables, y coordenadas de partidos y políticos alineadas con sus ideologías declaradas.

## Arquitectura global (fases)

```
Fase 0 (UI)  →  Fase 1 (grid)  →  Fase 2 (partidos)  →  Fase 3 (políticos)
 1 PR             1 PR                1 PR                1 PR por tanda
```

- **Fase 0 es independiente.** Se puede mergear sola para mejora inmediata del UX.
- **Fase 1 es prerrequisito de Fase 2 y 3.** Define el grid contra el cual se valida cada actor.
- **Fase 2 antes de Fase 3.** Los políticos heredan el marco de su partido.
- **Cada fase = PR separado con aprobación explícita del usuario.**

## Fase 0: fixes de UI

### Fix A — Fit-to-viewport inicial

**Archivo:** `apps/web/src/components/compass/hooks/useCompassZoom.ts`

El estado inicial `zoomIdentity` se reemplaza por un transform calculado en `useEffect` al montar y cuando cambien las dimensiones del contenedor:

1. Obtener dimensiones actuales del SVG desde `useCompassDimensions`.
2. Obtener bounds del dominio del grid (proyectados a píxeles vía `projection.ts`).
3. `k = min(viewportW / gridW, viewportH / gridH) * 0.95` (margen 5%).
4. `tx = (viewportW - gridW * k) / 2`, `ty = (viewportH - gridH * k) / 2`.
5. `setTransform(zoomIdentity.translate(tx, ty).scale(k))` y sincronizar con `zoomBehavior` para que los controles +/− partan del nuevo estado.

El fit se aplica solo en el mount inicial y en resize. No se reaplica cuando el usuario hace zoom manual.

### Fix B — Filtros apagados por defecto

**Archivo:** `apps/web/src/components/compass/CompassWithModal.tsx`

Cambiar `INITIAL_LAYERS`:

```ts
const INITIAL_LAYERS: CompassLayerState = {
  selfPerceived: false,
  evidenced: false,
  arrows: false,
  parties: false,
};
```

Los selectores "Todos los cargos" y "Todos los partidos" del sidebar permanecen en "todos" (no filtran). No se requiere cambio adicional porque con las capas apagadas ya no se renderizan puntos.

## Fase 1: curación del grid ideológico

### Criterio de inclusión

Una ideología queda en el grid colombiano si cumple al menos uno:
1. Ha tenido partido, movimiento o figura pública identificable en Colombia en los últimos ~60 años.
2. Existe debate político vigente sobre ella (aunque sin partido formal).
3. Es una familia ideológica de referencia necesaria para ubicar posiciones relativas.

Quedan fuera ideologías atadas a contextos nacionales ajenos (Juche, Dengismo, Kuomintangismo, Sionismo, teocracias no-cristianas) y abstracciones sin actor colombiano (Neo-fascismo, Imperialismo, Autocracia corporativa, Darwinismo social).

### Lista propuesta (~35 ideologías)

| Cuadrante | Incluir | Excluir |
|---|---|---|
| auth-left | classical-marxism, chavismo, castrismo, leninismo, state-socialism | stalinism, maoism, juche, dengismo, trotskismo\* |
| lib-left | democratic-socialism, social-democracy, progressivism, green-politics, eco-socialism, left-populism | anarcho-communism, council-communism, gandhism, democratic-confederalism |
| lib-right | classical-liberalism, social-liberalism, neoliberalism, libertarianism, third-way, technocracy, centrism | objectivism, individualist-anarchism, agorism, voluntaryism |
| auth-right | traditionalist-conservatism, nationalist-conservatism, neo-conservatism, paleo-conservatism, liberal-conservatism, fiscal-conservatism, christian-democracy, right-populism | christian/islamic/hindu-theocracy, zionism, kuomintangism, fascism, neo-fascism, nazism, imperialism, social-darwinism, corporate-autocracy, authoritarian-capitalism |

\* Casos de frontera — el usuario decide en la revisión.

### Mecánica (respeta la regla "JSON es derivado del YAML")

1. Agregar campo `applicable_countries: ["co"]` o `["global"]` a cada entrada de `packages/data/ideologies.source.yaml`.
2. Modificar `packages/etl/src/generate_ideologies.py` para aceptar `--country=co` y filtrar antes del squarified treemap.
3. Regenerar `packages/data/ideologies.json` — resultado: ~35 celdas más grandes y legibles.
4. Actualizar `packages/schema/src/zod.ts` para incluir el nuevo campo (opcional con default `["global"]`).
5. Regenerar el treemap → celdas crecen → etiquetas siguen leyéndose bien.

### Revisión humana obligatoria

Un agente "curador" produce la lista final con justificación por cada inclusión/exclusión. El usuario revisa y veta/agrega antes de correr el generador. El `ideologies.json` se regenera solo tras ese visto bueno.

## Fase 2: auditoría de los 23 partidos

### Protocolo estándar

Para cada partido:

1. Leer las 8 dimensiones de policy del JSON.
2. Recalcular `(x, y)` con los pesos de `classify_entity.py` adaptados al contexto colombiano.
3. Verificar que `(x, y)` cae en una celda del grid curado.
4. Cross-check con `ideologies[]`: la celda resultante debe coincidir o ser adyacente a alguna ideología declarada.
5. Si hay conflicto, decidir:
   - Scores mal evaluados → revisar fuentes primarias y ajustar.
   - `ideologies[]` mal asignadas → revisar autoidentificación del actor.
6. Actualizar `compassPosition.justification` y `sources[]` (mínimo 1 fuente).
7. No degradar `confidence` a menos que se detecte flaqueza real en fuentes.

### Paralelización (3 agentes por cuadrante)

- **Agente A — izquierda** (8 partidos): pacto-historico, polo-democratico, colombia-humana, comunes, union-patriotica, mais, aico, fuerza-ciudadana.
- **Agente B — centro / tercera vía** (7 partidos): partido-liberal, alianza-verde, nuevo-liberalismo, dignidad-compromiso, en-marcha, verde-oxigeno, mira.
- **Agente C — derecha** (8 partidos): centro-democratico, partido-conservador, cambio-radical, partido-de-la-u, creemos, salvacion-nacional, liga-gobernantes, colombia-justa-libres.

Cada agente produce un diff propuesto sobre `packages/data/colombia/parties.json` con justificación y fuentes. Yo consolido, detecto inconsistencias cross-cuadrante (ej. dos partidos clonados), y el usuario aprueba todo en 1 PR.

## Fase 3: auditoría de los ~110 políticos

### Protocolo

Igual que partidos, pero:
- Dos puntos por político: `compassSelf` + `compassEvidenced`.
- Fuentes mínimas: 1 para self, 2 para evidenced.
- Se documenta el delta self↔evidenced como índice de coherencia (no se fuerza a coincidir).

### Paralelización (5 agentes tras merge de Fase 2)

- **Agente D — presidents + vice-presidents** (~8).
- **Agente E — candidates + vp-candidates** (~20).
- **Agente F — senators** (~20).
- **Agente G — representatives** (~30).
- **Agente H — governors + mayors** (~30).

Los 5 corren en paralelo. Consolidación única → 5 PRs separados (uno por tanda) o 1 PR global, según prefiera el usuario al momento de la revisión.

## Archivos afectados

| Fase | Archivos |
|---|---|
| 0 | `apps/web/src/components/compass/hooks/useCompassZoom.ts`, `apps/web/src/components/compass/CompassWithModal.tsx` |
| 1 | `packages/data/ideologies.source.yaml`, `packages/etl/src/generate_ideologies.py`, `packages/data/ideologies.json` (regen), `packages/schema/src/zod.ts` |
| 2 | `packages/data/colombia/parties.json` |
| 3 | `packages/data/colombia/{presidents,vice-presidents,candidates,vp-candidates,senators,representatives,governors,mayors}.json` |
| Apoyo | Nuevo `scripts/validate_consistency.py` (Python) para cross-check `(x,y)` vs `ideologies[]` contra el grid curado. |

Se reutilizan los scripts existentes `packages/data/colombia/{fix_compass_data.py, fix_compass_methodology.py, recalibrate_confidence.py}` donde aplique.

## Verificación end-to-end

Por fase:

1. `pnpm --filter @brujula/web build` termina sin errores (incluyendo validación Zod).
2. `pnpm --filter @brujula/web dev` arranca y la home `/` muestra:
   - Mapa completo visible sin pan ni zoom manual (Fase 0 ✓).
   - Sidebar con las 4 capas apagadas (Fase 0 ✓).
   - Al encender "Partidos", ningún diamante sobre celda incoherente (Fase 1+2 ✓).
3. `python scripts/validate_consistency.py` pasa para partidos y políticos (Fase 2+3 ✓).
4. Spot-checks visuales en páginas individuales `/partidos/<slug>` y `/ideologias/<slug>`.

## Gates de merge

- Cada PR requiere aprobación explícita del usuario. Sin merge automático.
- Ningún agente escribe código directamente en `main`. Los agentes producen propuestas; yo consolido; el usuario aprueba.
- Si un agente detecta ambigüedad irresoluble (ej. "¿Petrismo es progresista o left-populism?"), la flagea en el output y el usuario decide antes del merge.
- Ningún merge degrada `confidence` de los actores existentes sin justificación explícita.

## Apéndice: casos de frontera

- **Trotskismo**: existen grupos pequeños en Colombia (ej. movimientos sindicales estudiantiles), pero sin partido con personería jurídica. Decisión pendiente de revisión humana.
- **Uribismo y Petrismo como etiquetas**: hoy no existen como ideología-celda en el grid. Se mapean a `nationalist-conservatism + right-populism` y `democratic-socialism + left-populism` respectivamente. No se propone crear celdas nuevas en esta iteración.
- **Christian-theocracy**: Colombia es formalmente laica. Colombia Justa Libres y MIRA son cristianos pero no teocráticos. Se excluye del grid colombiano.
