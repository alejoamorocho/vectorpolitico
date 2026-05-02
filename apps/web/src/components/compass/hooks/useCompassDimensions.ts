import { useEffect, useRef, useState, type RefObject } from 'react';

export type Dimensions = {
  width: number;
  height: number;
};

/** ResizeObserver que mantiene dimensiones cuadradas del compass. */
export function useCompassDimensions<T extends HTMLElement>(
  minSize = 320,
): { containerRef: RefObject<T>; size: number } {
  const containerRef = useRef<T>(null);
  const [size, setSize] = useState<number>(minSize);

  useEffect(() => {
    if (!containerRef.current) return;

    const element = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // El compass es cuadrado; tomamos el menor entre width y height disponible
        const w = entry.contentRect.width;
        const h = entry.contentRect.height || w; // si no hay height fijo, usa width
        const next = Math.max(minSize, Math.min(w, h));
        setSize(next);
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [minSize]);

  return { containerRef, size };
}
