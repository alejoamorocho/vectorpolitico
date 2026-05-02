import type { Context, Next } from 'hono';
import type { Bindings, Variables } from '../env';

/**
 * Middleware de cache KV para respuestas JSON idempotentes.
 *
 * - Lee de KV con key `c.get('cacheKey')` (la ruta la establece antes).
 * - Si hay HIT: devuelve JSON cacheado + header X-Cache: HIT.
 * - Si hay MISS: ejecuta next(), serializa la respuesta, la guarda con TTL.
 */
export function kvCache(ttlSeconds: number) {
  return async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next,
  ) => {
    const key = c.get('cacheKey');
    if (!key) {
      await next();
      return;
    }

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
