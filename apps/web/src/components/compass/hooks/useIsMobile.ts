import { useState, useEffect } from 'react';

const MOBILE_QUERY = '(max-width: 639px)';

/**
 * Hook simple que retorna true si el viewport es mobile (< 640px).
 * Retorna false durante SSR (Astro hydration).
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    setIsMobile(mql.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isMobile;
}
