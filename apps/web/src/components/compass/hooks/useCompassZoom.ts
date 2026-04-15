import { useEffect, useRef, useState, type RefObject } from 'react';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';

/**
 * Hook para zoom/pan controlado.
 * El `transform` resultante se devuelve como estado React para aplicar
 * en el JSX como atributo del <g> contenedor, manteniendo a React
 * como fuente de verdad del render.
 */
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
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity);
  const behaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = select(svgRef.current);
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([minScale, maxScale])
      .filter((event) => {
        if (event.type === 'dblclick') return false;
        if (event.button) return false;
        if (event.type === 'wheel') return event.ctrlKey;
        return true;
      })
      .on('zoom', (event) => setTransform(event.transform));

    svg.call(zoomBehavior);
    behaviorRef.current = zoomBehavior;

    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) {
        onScrollHint?.();
      }
    };
    svgRef.current.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      svg.on('.zoom', null);
      svgRef.current?.removeEventListener('wheel', handleWheel);
    };
  }, [svgRef, minScale, maxScale, onScrollHint]);

  const reset = () => {
    if (!svgRef.current || !behaviorRef.current) return;
    select(svgRef.current)
      .transition()
      .duration(400)
      .call(behaviorRef.current.transform, zoomIdentity);
  };

  const zoomIn = () => {
    if (!svgRef.current || !behaviorRef.current) return;
    select(svgRef.current)
      .transition()
      .duration(250)
      .call(behaviorRef.current.scaleBy, 1.5);
  };

  const zoomOut = () => {
    if (!svgRef.current || !behaviorRef.current) return;
    select(svgRef.current)
      .transition()
      .duration(250)
      .call(behaviorRef.current.scaleBy, 1 / 1.5);
  };

  return { transform, reset, zoomIn, zoomOut };
}
