import type { Context, Next } from 'hono';
import type { Bindings, Variables } from '../env';

/**
 * Middleware de cache KV para respuestas JSON idempotentes (solo GET).
 *
 * La clave se deriva de la URL (path + query normalizada) ANTES de ejecutar el
 * handler, para poder devolver un HIT sin tocar D1. (Antes se leía
 * `c.get('cacheKey')`, que las rutas setean dentro del handler — es decir,
 * después de esta fase —, por lo que el HIT nunca se producía.)
 */
function cacheKeyFromRequest(c: Context): string {
  const url = new URL(c.req.url);
  const params = [...url.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b));
  const qs = new URLSearchParams(params).toString();
  return `v1:${url.pathname}${qs ? `?${qs}` : ''}`;
}

export function kvCache(ttlSeconds: number) {
  return async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next,
  ) => {
    if (c.req.method !== 'GET') {
      await next();
      return;
    }

    const key = cacheKeyFromRequest(c);

    // Read
    const hit = await c.env.CACHE.get(key, 'json');
    if (hit) {
      c.header('X-Cache', 'HIT');
      c.header('Cache-Control', `public, max-age=${ttlSeconds}`);
      return c.json(hit);
    }

    // Miss → run handler
    await next();

    // Write-through: solo si la respuesta es 200 JSON
    const res = c.res.clone();
    if (res.status === 200 && res.headers.get('Content-Type')?.includes('json')) {
      try {
        const data = await res.json();
        // No-await intencional — no bloquear la respuesta al cliente
        c.env.CACHE.put(key, JSON.stringify(data), { expirationTtl: ttlSeconds }).catch(
          (err) => console.error('KV cache write failed', err),
        );
        c.header('X-Cache', 'MISS');
        c.header('Cache-Control', `public, max-age=${ttlSeconds}`);
      } catch (err) {
        console.error('KV cache serialization failed', err);
      }
    }
  };
}
