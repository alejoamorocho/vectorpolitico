import { useRef, useState, useMemo, useEffect, useCallback, type MouseEvent as ReactMouseEvent } from 'react';
import type { Ideology, EntitySummary, Party } from '@brujula/schema';
import { entityTypeLabel } from '@/lib/i18n';
import { createScales } from './lib/projection';
import { useCompassZoom } from './hooks/useCompassZoom';
import { useCompassDimensions } from './hooks/useCompassDimensions';
import { IdeologyGrid } from './layers/IdeologyGrid';
import { EntityPoints } from './layers/EntityPoints';
import { PartyPoints } from './layers/PartyPoints';
import { AxisLines, AxisLabels } from './layers/Axes';
import { CompassDefs } from './CompassDefs';
import { CompassTooltip, type TooltipState } from './CompassTooltip';
import { CompassControls } from './CompassControls';

type CompassLayers = {
  grid: boolean;
  axes: boolean;
  entities: boolean;
  arrows: boolean;
  quadrantLabels: boolean;
  showSelfPerceived?: boolean;
  showEvidenced?: boolean;
  showParties?: boolean;
};

type CompassProps = {
  ideologies: Ideology[];
  entities: EntitySummary[];
  parties?: Party[];
  /** Tamaño fijo opcional. Si no se provee, se adapta al contenedor. */
  fixedSize?: number;
  /** Si true, no permite zoom ni interacción (mini-compass). */
  readOnly?: boolean;
  /** Modo expandido dentro de CompassModal (sin click para expandir). */
  modalMode?: boolean;
  /** Si true, toda la superficie es clickeable para expandir el compass. */
  onExpand?: () => void;
  /** Capas visibles (solo relevante en modalMode). */
  layers?: CompassLayers;
  /** Click en una celda de ideología. */
  onIdeologyClick?: (id: string) => void;
  /** Click en una figura. */
  onEntityClick?: (entityId: string) => void;
  /** Click en un partido (diamante). */
  onPartyClick?: (partyId: string) => void;
};

const DEFAULT_LAYERS: CompassLayers = {
  grid: true,
  axes: true,
  entities: true,
  arrows: true,
  quadrantLabels: true,
  showParties: true,
};

export default function Compass({
  ideologies,
  entities,
  parties = [],
  fixedSize,
  readOnly = false,
  modalMode = false,
  onExpand,
  layers = DEFAULT_LAYERS,
  onIdeologyClick,
  onEntityClick,
  onPartyClick,
}: CompassProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { containerRef, size: dynamicSize } = useCompassDimensions<HTMLDivElement>(560);
  const size = fixedSize ?? dynamicSize;

  const scales = useMemo(() => createScales(size), [size]);
  const { transform, isActive, justActivatedRef, reset, zoomIn, zoomOut } = useCompassZoom(svgRef, {
    minScale: 0.25,
    maxScale: 12,
    contentWidth: size,
    contentHeight: size,
  });

  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [focusedPartyId, setFocusedPartyId] = useState<string | null>(null);

  useEffect(() => {
    if (focusedId && !entities.some((e) => e.id === focusedId)) {
      setFocusedId(null);
      setTooltip(null);
    }
  }, [entities, focusedId]);

  const handleEntityHover = useCallback(
    (entity: EntitySummary | null, ev?: React.MouseEvent) => {
      if (!entity || !ev) {
        setTooltip(null);
        setFocusedId(null);
        return;
      }
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      setFocusedId(entity.id);
      setTooltip({
        kind: 'entity',
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top,
        title: entity.displayName,
        subtitle: entityTypeLabel(entity.type),
        meta: [
          `Δ ${entity.delta.toFixed(2)} · ${entity.compassEvidenced.confidence}`,
          entity.incoherenceCount > 0
            ? `${entity.incoherenceCount} incoherencia(s)`
            : '',
        ].filter(Boolean),
      });
    },
    [],
  );

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      // Si el click fue en un controle o un elemento con onClick propio, ignorar
      if ((e.target as HTMLElement).closest('button')) return;
      if ((e.target as HTMLElement).closest('[data-click-through]')) return;
      if (!modalMode && !readOnly && onExpand) {
        onExpand();
      }
    },
    [modalMode, readOnly, onExpand],
  );

  const handleEntityClickInternal = useCallback(
    (id: string) => {
      if (readOnly) return;
      // Suppress navigation on the click that just activated the map
      if (modalMode && justActivatedRef.current) return;
      onEntityClick?.(id);
    },
    [readOnly, modalMode, justActivatedRef, onEntityClick],
  );

  const handleIdeologyClickInternal = useCallback(
    (id: string) => {
      if (modalMode && justActivatedRef.current) return;
      onIdeologyClick?.(id);
    },
    [modalMode, justActivatedRef, onIdeologyClick],
  );

  const handlePartyClickInternal = useCallback(
    (id: string) => {
      if (readOnly) return;
      if (modalMode && justActivatedRef.current) return;
      onPartyClick?.(id);
    },
    [readOnly, modalMode, justActivatedRef, onPartyClick],
  );

  const handlePartyHover = useCallback(
    (party: Party | null, ev?: ReactMouseEvent) => {
      if (!party || !ev) {
        setTooltip(null);
        setFocusedPartyId(null);
        return;
      }
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      setFocusedPartyId(party.id);
      setTooltip({
        kind: 'party',
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top,
        title: party.name,
        subtitle: 'Partido',
        meta: party.compassPosition
          ? [`(${party.compassPosition.x.toFixed(1)}, ${party.compassPosition.y.toFixed(1)})`]
          : undefined,
      });
    },
    [],
  );

  const isClickable = !modalMode && !readOnly && !!onExpand;

  return (
    <div
      ref={containerRef}
      className={`compass-wrap ${isClickable ? 'compass-wrap--clickable' : ''} ${
        modalMode ? 'compass-wrap--modal' : ''
      } ${isActive ? 'compass-wrap--active' : ''}`}
      style={{ position: 'relative', width: '100%' }}
      onClick={handleContainerClick}
    >
      <div ref={wrapRef} style={{ position: 'absolute', inset: 0 }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-labelledby="compass-title compass-desc"
        >
          <title id="compass-title">Brújula política interactiva de Colombia</title>
          <desc id="compass-desc">
            Mapa bidimensional donde el eje X representa posición económica y el eje Y representa
            posición social. Las figuras políticas tienen dos puntos: autopercibido en azul y
            evidenciado en rojo, conectados por una flecha.
          </desc>

          <CompassDefs />

          <rect width={size} height={size} fill="url(#compass-bg)" />
          <rect width={size} height={size} fill="url(#paper-lines)" />

          <g
            transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}
          >
            {/* 1. Axis lines — below the grid so cells cover them */}
            {layers.axes && (
              <AxisLines scales={scales} size={size} />
            )}
            {/* 2. Ideology grid — paints on top of axis lines */}
            {layers.grid && (
              <IdeologyGrid
                ideologies={ideologies}
                scales={scales}
                zoomK={transform.k}
                size={size}
                onIdeologyClick={modalMode ? handleIdeologyClickInternal : undefined}
              />
            )}
            {/* 3. Axis labels — on top of grid, readable via paint-order halo */}
            {layers.axes && (
              <AxisLabels
                scales={scales}
                size={size}
                showQuadrantLabels={layers.quadrantLabels}
              />
            )}
            {/* 4. Party diamonds — below entity points, above grid */}
            {layers.showParties && parties.length > 0 && (
              <PartyPoints
                parties={parties}
                scales={scales}
                zoomK={transform.k}
                focusedId={focusedPartyId}
                onHover={handlePartyHover}
                onClick={handlePartyClickInternal}
              />
            )}
            {/* 5. Entity points — topmost interactive layer */}
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
          </g>

          {/* Marco doble filete — convención cartográfica */}
          <rect
            x={0.5}
            y={0.5}
            width={size - 1}
            height={size - 1}
            fill="none"
            stroke="#d4cab0"
            strokeWidth={1.5}
          />
          <rect
            x={4}
            y={4}
            width={size - 8}
            height={size - 8}
            fill="none"
            stroke="#d4cab0"
            strokeWidth={0.5}
            strokeOpacity={0.6}
          />
        </svg>

        {/* Tooltip */}
        <CompassTooltip tooltip={tooltip} size={size} />
      </div>

      {/* Activation hint — shown when map is inactive in modal mode */}
      {modalMode && !isActive && (
        <div
          className="compass-activation-hint"
        >
          <p>
            Haz click en el mapa para interactuar
          </p>
        </div>
      )}

      {/* Controles de zoom (solo en modalMode) */}
      {modalMode && !readOnly && (
        <CompassControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={reset} />
      )}

    </div>
  );
}
