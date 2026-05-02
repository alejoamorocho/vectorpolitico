# Compass UX Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the political compass to start clean (no dots/lines), add a sidebar with layer toggles/filters/legend, fix scroll hijacking, implement real fullscreen, remove confidence ellipses, and centralize Spanish role labels.

**Architecture:** The `CompassWithModal` component becomes the main orchestrator with layer state, sidebar, and fullscreen logic. The existing `Compass` component receives layers as props. A new `CompassSidebar` component replaces `CompassToolbar`. The old `CompassModal` is deleted. A shared `i18n.ts` file centralizes all Spanish entity type labels.

**Tech Stack:** React 18, D3 (zoom/scale), Fullscreen API, CSS (globals.css), TypeScript

---

### Task 1: Create centralized i18n labels for EntityType

**Files:**
- Create: `apps/web/src/lib/i18n.ts`

- [ ] **Step 1: Create the i18n module**

```typescript
// apps/web/src/lib/i18n.ts
import type { EntityType } from '@brujula/schema';

export const entityTypeLabels: Record<EntityType, { singular: string; plural: string }> = {
  president:              { singular: 'Presidente',                  plural: 'Presidentes' },
  vice_president:         { singular: 'Vicepresidente',              plural: 'Vicepresidentes' },
  presidential_candidate: { singular: 'Candidato presidencial',      plural: 'Candidatos presidenciales' },
  vp_candidate:           { singular: 'Candidato a vicepresidente',  plural: 'Candidatos a vicepresidente' },
  senator:                { singular: 'Senador',                     plural: 'Senadores' },
  representative:         { singular: 'Representante a la Cámara',   plural: 'Representantes' },
  governor:               { singular: 'Gobernador',                  plural: 'Gobernadores' },
  mayor:                  { singular: 'Alcalde',                     plural: 'Alcaldes' },
};

/** Helper: get singular label for an entity type. */
export function entityTypeLabel(type: string): string {
  return (entityTypeLabels as Record<string, { singular: string }>)[type]?.singular ?? type;
}

/** Helper: get plural label for an entity type. */
export function entityTypeLabelPlural(type: string): string {
  return (entityTypeLabels as Record<string, { plural: string }>)[type]?.plural ?? type;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd apps/web && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `i18n.ts`

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/i18n.ts
git commit -m "feat: add centralized i18n labels for EntityType"
```

---

### Task 2: Replace all English entity type usages with i18n

**Files:**
- Modify: `apps/web/src/components/compass/Compass.tsx:95` — tooltip subtitle
- Modify: `apps/web/src/pages/index.astro:160,214` — featured and index sections
- Modify: `apps/web/src/pages/figuras/index.astro:14-21` — typeLabels
- Modify: `apps/web/src/pages/figuras/[slug].astro:65-72` — typeLabels

- [ ] **Step 1: Fix Compass.tsx tooltip (line 95)**

Replace:
```typescript
subtitle: entity.type.replace('_', ' '),
```
With:
```typescript
subtitle: entityTypeLabel(entity.type),
```

Add import at top of file:
```typescript
import { entityTypeLabel } from '@/lib/i18n';
```

- [ ] **Step 2: Fix index.astro featured section (line 160)**

Replace:
```astro
<p class="section-kicker">{e.type.replace('_', ' ')}</p>
```
With:
```astro
<p class="section-kicker">{entityTypeLabel(e.type)}</p>
```

Add import in frontmatter:
```typescript
import { entityTypeLabel } from '@/lib/i18n';
```

- [ ] **Step 3: Fix index.astro complete index (line 214)**

Replace:
```astro
<span class="section-kicker">{e.type.replace('_', ' ')}</span>
```
With:
```astro
<span class="section-kicker">{entityTypeLabel(e.type)}</span>
```

- [ ] **Step 4: Fix figuras/index.astro — replace local typeLabels with i18n**

Replace the local `typeLabels` object (lines 14-21) with import:
```typescript
import { entityTypeLabelPlural } from '@/lib/i18n';
```

Then replace usage. Where it currently does `typeLabels[type]`, use `entityTypeLabelPlural(type)`.

- [ ] **Step 5: Fix figuras/[slug].astro — replace local typeLabels with i18n**

Replace the local `typeLabels` object (lines 65-72) with import:
```typescript
import { entityTypeLabel } from '@/lib/i18n';
```

Then replace usage. Where it currently does `typeLabels[entity.type]`, use `entityTypeLabel(entity.type)`.

- [ ] **Step 6: Build and verify**

Run: `cd C:/proyectos/vectorpolitico && pnpm build 2>&1 | tail -20`
Expected: Build succeeds, no English role types anywhere.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/compass/Compass.tsx apps/web/src/pages/index.astro apps/web/src/pages/figuras/index.astro apps/web/src/pages/figuras/\[slug\].astro
git commit -m "fix: replace all English entity type labels with centralized Spanish i18n"
```

---

### Task 3: Fix scroll hijacking — Ctrl+scroll for zoom

**Files:**
- Modify: `apps/web/src/components/compass/hooks/useCompassZoom.ts`
- Modify: `apps/web/src/components/compass/Compass.tsx` — add scroll hint overlay

- [ ] **Step 1: Add Ctrl filter to zoom behavior in useCompassZoom.ts**

Replace the `.filter()` call (line 24):
```typescript
.filter((event) => !event.button && event.type !== 'dblclick')
```
With:
```typescript
.filter((event) => {
  // Block double-click zoom
  if (event.type === 'dblclick') return false;
  // Block right-click
  if (event.button) return false;
  // Wheel events require Ctrl (or pinch which browsers report as ctrlKey)
  if (event.type === 'wheel') return event.ctrlKey;
  // Allow drag/touch pan
  return true;
})
```

- [ ] **Step 2: Add onScrollHint callback to useCompassZoom**

Add a new callback parameter and return value. After the filter, add a listener for wheel events without Ctrl to trigger the hint. Update the hook signature:

```typescript
export function useCompassZoom(
  svgRef: RefObject<SVGSVGElement>,
  {
    minScale = 1,
    maxScale = 12,
    onScrollHint,
  }: {
    minScale?: number;
    maxScale?: number;
    onScrollHint?: () => void;
  } = {},
) {
```

Inside the `useEffect`, after `svg.call(zoomBehavior)`, add:

```typescript
// Show hint when user tries to scroll without Ctrl
const handleWheel = (event: WheelEvent) => {
  if (!event.ctrlKey) {
    onScrollHint?.();
  }
};
svgRef.current.addEventListener('wheel', handleWheel, { passive: true });
```

And in the cleanup:
```typescript
return () => {
  svg.on('.zoom', null);
  svgRef.current?.removeEventListener('wheel', handleWheel);
};
```

- [ ] **Step 3: Add scroll hint overlay in Compass.tsx**

Add state and timeout for the hint. After the `useCompassZoom` call (~line 65):

```typescript
const [showScrollHint, setShowScrollHint] = useState(false);
const scrollHintTimer = useRef<ReturnType<typeof setTimeout>>();

const handleScrollHint = useCallback(() => {
  setShowScrollHint(true);
  clearTimeout(scrollHintTimer.current);
  scrollHintTimer.current = setTimeout(() => setShowScrollHint(false), 2000);
}, []);
```

Pass `onScrollHint: handleScrollHint` to `useCompassZoom`.

Add the overlay JSX after the tooltip section, before the compass-controls:

```tsx
{showScrollHint && (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgb(26 21 16 / 0.6)',
      zIndex: 20,
      pointerEvents: 'none',
      animation: 'tooltip-in 180ms ease-out',
    }}
  >
    <p
      style={{
        color: '#fdfaf1',
        fontFamily: 'var(--font-serif)',
        fontSize: 14,
        fontStyle: 'italic',
        background: 'rgb(26 21 16 / 0.85)',
        padding: '10px 20px',
        border: '1px solid rgba(212 202 176 / 0.3)',
      }}
    >
      Usa <strong>Ctrl + scroll</strong> para hacer zoom en el mapa
    </p>
  </div>
)}
```

- [ ] **Step 4: Build and verify**

Run: `cd C:/proyectos/vectorpolitico && pnpm build 2>&1 | tail -10`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/compass/hooks/useCompassZoom.ts apps/web/src/components/compass/Compass.tsx
git commit -m "fix: require Ctrl+scroll for compass zoom, show hint overlay"
```

---

### Task 4: Remove confidence ellipses

**Files:**
- Modify: `apps/web/src/components/compass/layers/EntityPoints.tsx` — remove ellipse rendering
- Modify: `apps/web/src/components/compass/lib/projection.ts` — remove `confidenceToRadius`
- Modify: `apps/web/src/components/compass/Compass.tsx` — remove `ellipses` from DEFAULT_LAYERS

- [ ] **Step 1: Remove ellipse rendering from EntityPoints.tsx**

Remove the `confidenceToRadius` import (line 3) — change to:
```typescript
import type { CompassScales } from '../lib/projection';
```

Remove `showEllipses` from Props type (line 9).

Remove `showEllipses = true` from destructuring (line 29).

Remove the radius calculation (lines 44-46):
```typescript
const rData = confidenceToRadius(e.compassEvidenced.confidence);
const rx = Math.abs(xScale(rData) - xScale(0));
const ry = Math.abs(yScale(0) - yScale(rData));
```

Remove the ellipse JSX block (lines 68-83, the `{showEllipses && (...)}` section).

- [ ] **Step 2: Remove confidenceToRadius from projection.ts**

Delete lines 27-37 (the `confidenceToRadius` function).

- [ ] **Step 3: Update Compass.tsx DEFAULT_LAYERS**

Remove `ellipses` from `DEFAULT_LAYERS` (line 43) and from `CompassLayers` type in `CompassModal.tsx` (line 44). Also remove `showEllipses` prop pass in line 206.

In Compass.tsx, replace line 206:
```tsx
<EntityPoints
  entities={entities}
  scales={scales}
  focusedId={focusedId}
  showEllipses={layers.ellipses}
  showArrows={layers.arrows}
  onHover={handleEntityHover}
  onClick={handleEntityClickInternal}
/>
```
With:
```tsx
<EntityPoints
  entities={entities}
  scales={scales}
  focusedId={focusedId}
  showArrows={layers.arrows}
  onHover={handleEntityHover}
  onClick={handleEntityClickInternal}
/>
```

- [ ] **Step 4: Build and verify**

Run: `cd C:/proyectos/vectorpolitico && pnpm build 2>&1 | tail -10`
Expected: Build succeeds, no references to ellipses remain.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/compass/layers/EntityPoints.tsx apps/web/src/components/compass/lib/projection.ts apps/web/src/components/compass/Compass.tsx apps/web/src/components/compass/CompassModal.tsx
git commit -m "feat: remove confidence ellipses from compass"
```

---

### Task 5: Create CompassSidebar component

**Files:**
- Create: `apps/web/src/components/compass/CompassSidebar.tsx`
- Modify: `apps/web/src/styles/globals.css` — add sidebar styles

- [ ] **Step 1: Create CompassSidebar.tsx**

```tsx
// apps/web/src/components/compass/CompassSidebar.tsx
import type { Party } from '@brujula/schema';
import { entityTypeLabelPlural } from '@/lib/i18n';

export type CompassLayerState = {
  selfPerceived: boolean;
  evidenced: boolean;
  arrows: boolean;
};

type Props = {
  layers: CompassLayerState;
  onLayerChange: (layers: CompassLayerState) => void;
  filterType: string;
  onFilterTypeChange: (v: string) => void;
  filterParty: string;
  onFilterPartyChange: (v: string) => void;
  parties: Party[];
  onFullscreen?: () => void;
  onCollapse?: () => void;
  isFullscreen?: boolean;
};

const typeFilterOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos los cargos' },
  { value: 'president', label: 'Presidentes' },
  { value: 'vice_president', label: 'Vicepresidentes' },
  { value: 'presidential_candidate', label: 'Candidatos presidenciales' },
  { value: 'senator', label: 'Senadores' },
  { value: 'representative', label: 'Representantes' },
  { value: 'governor', label: 'Gobernadores' },
  { value: 'mayor', label: 'Alcaldes' },
];

export function CompassSidebar({
  layers,
  onLayerChange,
  filterType,
  onFilterTypeChange,
  filterParty,
  onFilterPartyChange,
  parties,
  onFullscreen,
  onCollapse,
  isFullscreen = false,
}: Props) {
  const toggle = (key: keyof CompassLayerState) => {
    onLayerChange({ ...layers, [key]: !layers[key] });
  };

  return (
    <aside className="compass-sidebar" aria-label="Controles del mapa">
      {/* Header */}
      <div className="compass-sidebar-header">
        <span className="compass-sidebar-title">Brújula Política</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {!isFullscreen && onFullscreen && (
            <button
              type="button"
              onClick={onFullscreen}
              className="compass-sidebar-btn"
              aria-label="Pantalla completa"
              title="Pantalla completa"
            >
              ⛶
            </button>
          )}
          {isFullscreen && onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="compass-sidebar-btn"
              aria-label="Salir de pantalla completa"
              title="Cerrar"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Capas */}
      <div className="compass-sidebar-section">
        <div className="compass-sidebar-section-title">Capas</div>
        <label className="compass-sidebar-check">
          <input
            type="checkbox"
            checked={layers.selfPerceived}
            onChange={() => toggle('selfPerceived')}
          />
          <span className="compass-sidebar-dot" style={{ background: '#1e3556' }} />
          Autopercibido
        </label>
        <label className="compass-sidebar-check">
          <input
            type="checkbox"
            checked={layers.evidenced}
            onChange={() => toggle('evidenced')}
          />
          <span className="compass-sidebar-dot" style={{ background: '#6b1f1f' }} />
          Evidenciado
        </label>
        <label className="compass-sidebar-check">
          <input
            type="checkbox"
            checked={layers.arrows}
            onChange={() => toggle('arrows')}
          />
          <span className="compass-sidebar-arrow" />
          Flechas
        </label>
      </div>

      {/* Filtros */}
      <div className="compass-sidebar-section">
        <div className="compass-sidebar-section-title">Filtros</div>
        <select
          className="compass-sidebar-select"
          value={filterType}
          onChange={(e) => onFilterTypeChange(e.target.value)}
        >
          {typeFilterOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          className="compass-sidebar-select"
          value={filterParty}
          onChange={(e) => onFilterPartyChange(e.target.value)}
        >
          <option value="all">Todos los partidos</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Guía */}
      <div className="compass-sidebar-section compass-sidebar-guide">
        <div className="compass-sidebar-section-title">Guía</div>
        {layers.selfPerceived && (
          <div className="compass-sidebar-guide-item">
            <span className="compass-sidebar-dot" style={{ background: '#1e3556' }} />
            <span>Dónde dice estar</span>
          </div>
        )}
        {layers.evidenced && (
          <div className="compass-sidebar-guide-item">
            <span className="compass-sidebar-dot" style={{ background: '#6b1f1f' }} />
            <span>Dónde está realmente</span>
          </div>
        )}
        {layers.arrows && (
          <div className="compass-sidebar-guide-item">
            <span className="compass-sidebar-arrow" />
            <span>Distancia discurso ↔ acción</span>
          </div>
        )}
        {!layers.selfPerceived && !layers.evidenced && !layers.arrows && (
          <p className="compass-sidebar-hint">
            Active una capa para ver la guía
          </p>
        )}
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Add sidebar CSS to globals.css**

Append after the existing `.compass-toolbar` styles (~line 675):

```css
/* ── Compass sidebar ── */
.compass-sidebar {
  width: 200px;
  flex-shrink: 0;
  background: var(--paper-raised);
  border-right: 1px solid var(--rule);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 0;
  font-family: var(--font-serif);
  overflow-y: auto;
}

.compass-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--rule);
  margin-bottom: 12px;
}

.compass-sidebar-title {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
}

.compass-sidebar-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--paper-deep);
  border: 1px solid var(--rule);
  border-radius: 3px;
  cursor: pointer;
  color: var(--ink-mute);
  font-size: 14px;
  transition: background 120ms ease;
}

.compass-sidebar-btn:hover {
  background: var(--paper);
  color: var(--ink);
}

.compass-sidebar-section {
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.compass-sidebar-section-title {
  font-family: var(--font-mono);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--ink-mute);
  padding-bottom: 5px;
  border-bottom: 1px solid var(--rule-soft);
}

.compass-sidebar-check {
  font-size: 12px;
  color: var(--ink-soft);
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.compass-sidebar-check input[type="checkbox"] {
  accent-color: var(--ink-soft);
  width: 13px;
  height: 13px;
  cursor: pointer;
}

.compass-sidebar-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.compass-sidebar-arrow {
  display: inline-block;
  width: 14px;
  height: 0;
  border-top: 1.5px solid #3d3d3d;
  flex-shrink: 0;
}

.compass-sidebar-select {
  font-family: var(--font-serif);
  font-size: 12px;
  color: var(--ink-soft);
  background: var(--paper-cream);
  border: 1px solid var(--rule);
  padding: 5px 8px;
  border-radius: 2px;
  width: 100%;
  cursor: pointer;
}

.compass-sidebar-guide {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--rule-soft);
}

.compass-sidebar-guide-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--ink-soft);
}

.compass-sidebar-hint {
  font-size: 11px;
  font-style: italic;
  color: var(--ink-faint);
  margin: 0;
}

/* Sidebar responsive — mobile: bottom drawer */
@media (max-width: 639px) {
  .compass-sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
    border-right: none;
    border-top: 1px solid var(--rule);
    padding: 10px 14px;
  }

  .compass-sidebar-header {
    width: 100%;
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .compass-sidebar-section {
    flex: 1 1 140px;
    margin-bottom: 0;
  }

  .compass-sidebar-guide {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }
}
```

- [ ] **Step 3: Build and verify**

Run: `cd C:/proyectos/vectorpolitico && pnpm build 2>&1 | tail -10`
Expected: Build succeeds (sidebar not yet wired into compass).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/compass/CompassSidebar.tsx apps/web/src/styles/globals.css
git commit -m "feat: add CompassSidebar component with layers, filters, and guide"
```

---

### Task 6: Rewrite CompassWithModal — sidebar always visible, fullscreen API

**Files:**
- Modify: `apps/web/src/components/compass/CompassWithModal.tsx` — full rewrite
- Modify: `apps/web/src/styles/globals.css` — add fullscreen container styles
- Modify: `apps/web/src/components/compass/Compass.tsx` — remove old legend, update DEFAULT_LAYERS

- [ ] **Step 1: Rewrite CompassWithModal.tsx**

```tsx
// apps/web/src/components/compass/CompassWithModal.tsx
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import type { Ideology, EntitySummary, Party } from '@brujula/schema';
import Compass from './Compass';
import { CompassSidebar, type CompassLayerState } from './CompassSidebar';

type Props = {
  ideologies: Ideology[];
  entities: EntitySummary[];
  parties: Party[];
};

const INITIAL_LAYERS: CompassLayerState = {
  selfPerceived: false,
  evidenced: false,
  arrows: false,
};

export default function CompassWithModal({ ideologies, entities, parties }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layers, setLayers] = useState<CompassLayerState>(INITIAL_LAYERS);
  const [filterType, setFilterType] = useState('all');
  const [filterParty, setFilterParty] = useState('all');

  // Filter entities based on sidebar filters
  const filteredEntities = useMemo(() => {
    return entities.filter((e) => {
      if (filterType !== 'all' && e.type !== filterType) return false;
      if (filterParty !== 'all' && e.party !== filterParty) return false;
      return true;
    });
  }, [entities, filterType, filterParty]);

  // Determine which entities to show based on active layers
  const visibleEntities = useMemo(() => {
    if (!layers.selfPerceived && !layers.evidenced) return [];
    return filteredEntities;
  }, [filteredEntities, layers.selfPerceived, layers.evidenced]);

  // Convert layer state to Compass layer props
  const compassLayers = useMemo(
    () => ({
      grid: true,
      axes: true,
      entities: layers.selfPerceived || layers.evidenced,
      arrows: layers.arrows,
      quadrantLabels: true,
      // Pass individual layer visibility for EntityPoints
      showSelfPerceived: layers.selfPerceived,
      showEvidenced: layers.evidenced,
    }),
    [layers],
  );

  // Fullscreen API
  const enterFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {
        // Fallback: use CSS fullscreen
        setIsFullscreen(true);
      });
    } else {
      setIsFullscreen(true);
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
  }, []);

  // Listen for fullscreen changes (e.g. user presses Escape)
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const handleIdeologyClick = (id: string) => {
    window.location.href = `/ideologias/${id}`;
  };

  const handleEntityClick = (id: string) => {
    window.location.href = `/figuras/${id}`;
  };

  return (
    <div
      ref={containerRef}
      className={`compass-container ${isFullscreen ? 'compass-container--fullscreen' : ''}`}
    >
      <CompassSidebar
        layers={layers}
        onLayerChange={setLayers}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterParty={filterParty}
        onFilterPartyChange={setFilterParty}
        parties={parties}
        onFullscreen={enterFullscreen}
        onCollapse={exitFullscreen}
        isFullscreen={isFullscreen}
      />
      <div className="compass-container-map">
        <Compass
          ideologies={ideologies}
          entities={visibleEntities}
          modalMode={true}
          layers={compassLayers}
          onIdeologyClick={handleIdeologyClick}
          onEntityClick={handleEntityClick}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add compass-container CSS to globals.css**

Add after the compass-sidebar styles:

```css
/* ── Compass container (sidebar + map) ── */
.compass-container {
  display: flex;
  border: 1px solid var(--rule);
  background: var(--paper-cream);
  overflow: hidden;
}

.compass-container-map {
  flex: 1;
  min-width: 0;
  position: relative;
}

/* Fullscreen mode */
.compass-container--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  border: none;
}

/* Native fullscreen */
.compass-container:fullscreen {
  border: none;
}

.compass-container:fullscreen .compass-container-map {
  height: 100vh;
}

/* Mobile: stack vertically */
@media (max-width: 639px) {
  .compass-container {
    flex-direction: column-reverse;
  }
}
```

- [ ] **Step 3: Update Compass.tsx — remove old legend**

Remove the legend JSX (lines 333-341):
```tsx
{/* Leyenda */}
<div className="compass-legend" data-click-through>
  <span className="compass-legend-dot" style={{ color: 'var(--self)' }}>
    Autopercibido
  </span>
  <span className="compass-legend-dot" style={{ color: 'var(--evidenced)' }}>
    Evidenciado
  </span>
</div>
```

Remove the "Click para expandir" hint (lines 343-365) since the compass is now always interactive.

Update `DEFAULT_LAYERS` to remove `ellipses`:
```typescript
const DEFAULT_LAYERS: CompassLayers = {
  grid: true,
  axes: true,
  entities: true,
  arrows: true,
  quadrantLabels: true,
};
```

Update the `CompassLayers` type import to handle the new shape. Since `CompassModal.tsx` still exports `CompassLayers`, update it or move the type to a shared location. For now, define it locally in Compass.tsx:

```typescript
type CompassLayers = {
  grid: boolean;
  axes: boolean;
  entities: boolean;
  arrows: boolean;
  quadrantLabels: boolean;
  showSelfPerceived?: boolean;
  showEvidenced?: boolean;
};
```

Remove the import of `CompassLayers` from `CompassModal` (line 9).

- [ ] **Step 4: Update EntityPoints to support showing self/evidenced independently**

Add props to EntityPoints:
```typescript
type Props = {
  entities: EntitySummary[];
  scales: CompassScales;
  focusedId?: string | null;
  showArrows?: boolean;
  showSelfPerceived?: boolean;
  showEvidenced?: boolean;
  onHover?: (entity: EntitySummary | null, ev?: React.MouseEvent) => void;
  onClick?: (id: string) => void;
};
```

Default both to `true`. Then conditionally render each circle:

For the self-perceived circle (lines 92-102), wrap in:
```tsx
{showSelfPerceived && (
  <circle ... />
)}
```

For the evidenced circle (lines 104-114), wrap in:
```tsx
{showEvidenced && (
  <circle ... />
)}
```

For the arrow, also check: `{showArrows && showSelfPerceived && showEvidenced && <ArrowPath ... />}` — arrows only make sense when both points are visible.

For touch targets, only render them for visible points.

Pass `showSelfPerceived` and `showEvidenced` from Compass.tsx to EntityPoints via `layers.showSelfPerceived` and `layers.showEvidenced`.

In Compass.tsx, update the EntityPoints render (~line 201):
```tsx
{layers.entities && (
  <EntityPoints
    entities={entities}
    scales={scales}
    focusedId={focusedId}
    showArrows={layers.arrows}
    showSelfPerceived={layers.showSelfPerceived ?? true}
    showEvidenced={layers.showEvidenced ?? true}
    onHover={handleEntityHover}
    onClick={handleEntityClickInternal}
  />
)}
```

- [ ] **Step 5: Update index.astro — remove old click-to-expand text**

In `apps/web/src/pages/index.astro`, update the compass section text (line 118):
```astro
<p class="section-byline mt-2">Explore el mapa político con los controles del panel lateral</p>
```

- [ ] **Step 6: Build and verify**

Run: `cd C:/proyectos/vectorpolitico && pnpm build 2>&1 | tail -20`
Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/compass/CompassWithModal.tsx apps/web/src/components/compass/Compass.tsx apps/web/src/components/compass/layers/EntityPoints.tsx apps/web/src/styles/globals.css apps/web/src/pages/index.astro
git commit -m "feat: rewrite compass with sidebar, fullscreen API, and layer toggles"
```

---

### Task 7: Delete old CompassToolbar and clean up CompassModal

**Files:**
- Delete: `apps/web/src/components/compass/CompassToolbar.tsx`
- Modify: `apps/web/src/components/compass/CompassModal.tsx` — delete entirely or gut it

- [ ] **Step 1: Delete CompassToolbar.tsx**

This file is no longer used — its functionality is now in CompassSidebar.

```bash
git rm apps/web/src/components/compass/CompassToolbar.tsx
```

- [ ] **Step 2: Gut CompassModal.tsx to only export the type**

Since other files may import `CompassLayers` from it, replace the entire file with just the type export:

```typescript
// apps/web/src/components/compass/CompassModal.tsx
// Legacy file — kept only for type export during migration.
// TODO: move CompassLayers type to Compass.tsx and delete this file.

export type CompassLayers = {
  grid: boolean;
  axes: boolean;
  entities: boolean;
  arrows: boolean;
  quadrantLabels: boolean;
  showSelfPerceived?: boolean;
  showEvidenced?: boolean;
};
```

- [ ] **Step 3: Verify no broken imports**

Run: `cd C:/proyectos/vectorpolitico && pnpm build 2>&1 | tail -10`
Expected: Build succeeds, no import errors.

- [ ] **Step 4: Commit**

```bash
git add -A apps/web/src/components/compass/CompassToolbar.tsx apps/web/src/components/compass/CompassModal.tsx
git commit -m "chore: remove old CompassToolbar, simplify CompassModal to type export"
```

---

### Task 8: Visual polish and final testing

**Files:**
- Modify: `apps/web/src/styles/globals.css` — tune compass-wrap for new layout
- Modify: `apps/web/src/components/compass/Compass.tsx` — ensure zoom controls show always

- [ ] **Step 1: Update compass-wrap styles for new container**

The compass is now always in `modalMode` (interactive). Update `.compass-wrap` to remove the click cursor and the aspect-ratio constraint when inside the container:

```css
.compass-container .compass-wrap {
  aspect-ratio: auto;
  height: 100%;
  cursor: default;
  border: none;
}

.compass-container .compass-wrap--modal {
  height: 100%;
}

/* In fullscreen, map fills viewport */
.compass-container--fullscreen .compass-container-map {
  height: 100vh;
}

.compass-container--fullscreen .compass-wrap {
  height: 100%;
}
```

- [ ] **Step 2: Show zoom controls always (not just modalMode)**

In Compass.tsx, the zoom controls are currently gated by `modalMode && !readOnly`. Since the compass is now always in modalMode inside the container, this works. But ensure the controls position correctly by keeping them absolute bottom-right.

Verify the controls render: they should since `modalMode={true}` is always passed.

- [ ] **Step 3: Ensure the min-height for embedded compass**

Add a min-height to prevent the compass from collapsing when the sidebar is taller:

```css
.compass-container {
  min-height: 500px;
}

@media (max-width: 639px) {
  .compass-container {
    min-height: auto;
  }
}
```

- [ ] **Step 4: Full build and visual test**

Run:
```bash
cd C:/proyectos/vectorpolitico && pnpm build 2>&1 | tail -10
```
Then:
```bash
cd apps/web && npx wrangler pages dev dist --port 8788
```

Open http://localhost:8788 and verify:
1. Compass shows only ideology grid + axes (no dots, no lines)
2. Sidebar is visible with Capas/Filtros/Guía sections
3. Checking "Autopercibido" shows blue dots
4. Checking "Evidenciado" shows red dots
5. Checking "Flechas" shows arrows (only when both points visible)
6. Guide section updates dynamically
7. Fullscreen button (⛶) takes the whole screen
8. ✕ button or Escape exits fullscreen
9. Scroll on page passes through the map without zooming
10. Ctrl+scroll zooms the map with hint message
11. All role labels in Spanish everywhere
12. No confidence ellipses anywhere

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/styles/globals.css apps/web/src/components/compass/Compass.tsx
git commit -m "feat: visual polish and final compass layout adjustments"
```
