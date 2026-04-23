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
    minScale = 1,
    maxScale = 12,
  }: {
    minScale?: number;
    maxScale?: number;
  } = {},
) {
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity);
  const [isActive, setIsActive] = useState(false);
  const behaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const isActiveRef = useRef(isActive);
  /** True during ~300ms after activation. Used to suppress entity click navigation. */
  const justActivatedRef = useRef(false);

  isActiveRef.current = isActive;

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    // ── Activation on mousedown (capture phase, runs BEFORE d3's listener) ──
    const handleMouseDownCapture = (event: MouseEvent) => {
      if (event.button !== 0) return; // left button only
      if (!isActiveRef.current) {
        // Update ref synchronously so d3's filter (on the same event) sees active=true
        isActiveRef.current = true;
        justActivatedRef.current = true;
        setIsActive(true);
        // Clear the "just activated" flag after the click fully resolves
        setTimeout(() => {
          justActivatedRef.current = false;
        }, 350);
      }
    };
    svgEl.addEventListener('mousedown', handleMouseDownCapture, true);

    // ── d3-zoom setup ──
    const svg = select(svgEl);
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([minScale, maxScale])
      .filter((event) => {
        if (event.type === 'dblclick') return false;
        if (event.button) return false;
        // Read ref synchronously — capture handler above may have just flipped it to true
        return isActiveRef.current;
      })
      .on('zoom', (event) => setTransform(event.transform));

    svg.call(zoomBehavior);
    behaviorRef.current = zoomBehavior;

    // Prevent page scroll when active and cursor is over the map
    const handleWheel = (event: WheelEvent) => {
      if (isActiveRef.current) {
        event.preventDefault();
      }
    };
    svgEl.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      svgEl.removeEventListener('mousedown', handleMouseDownCapture, true);
      svgEl.removeEventListener('wheel', handleWheel);
      svg.on('.zoom', null);
    };
  }, [svgRef, minScale, maxScale]);

  // Deactivate on outside click or Escape
  useEffect(() => {
    if (!isActive) return;

    const handleDocClick = (e: MouseEvent) => {
      if (svgRef.current && !svgRef.current.contains(e.target as Node)) {
        isActiveRef.current = false;
        setIsActive(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        isActiveRef.current = false;
        setIsActive(false);
      }
    };

    // Delay registration so the activating mousedown doesn't instantly fire this
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleDocClick);
      document.addEventListener('keydown', handleKey);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleDocClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isActive, svgRef]);

  const reset = useCallback(() => {
    if (!svgRef.current || !behaviorRef.current) return;
    select(svgRef.current)
      .transition()
      .duration(400)
      .call(behaviorRef.current.transform, zoomIdentity);
  }, [svgRef]);

  const zoomIn = useCallback(() => {
    if (!svgRef.current || !behaviorRef.current) return;
    isActiveRef.current = true;
    setIsActive(true);
    select(svgRef.current)
      .transition()
      .duration(250)
      .call(behaviorRef.current.scaleBy, 1.5);
  }, [svgRef]);

  const zoomOut = useCallback(() => {
    if (!svgRef.current || !behaviorRef.current) return;
    select(svgRef.current)
      .transition()
      .duration(250)
      .call(behaviorRef.current.scaleBy, 1 / 1.5);
  }, [svgRef]);

  return { transform, isActive, justActivatedRef, reset, zoomIn, zoomOut };
}
