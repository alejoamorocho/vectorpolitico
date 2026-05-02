import { cors } from 'hono/cors';
import type { Context, Next } from 'hono';
import type { Bindings } from '../env';

/**
 * CORS dinámico con allowlist desde env `ALLOWED_ORIGINS`.
 *
 * En staging permite `*` (lista con asterisco); en producción requiere
 * que el origin esté en la lista separada por comas.
 */
export async function corsMiddleware(
  c: Context<{ Bindings: Bindings }>,
  next: Next,
) {
  const allowedRaw = c.env.ALLOWED_ORIGINS ?? '';
  const allowed = allowedRaw.split(',').map((o) => o.trim()).filter(Boolean);
  const permitAll = allowed.includes('*');

  return cors({
    origin: (origin) => {
      if (permitAll) return origin ?? '*';
      if (!origin) return null;
      return allowed.includes(origin) ? origin : null;
    },
    allowMethods: ['GET', 'HEAD', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Accept', 'Accept-Language'],
    maxAge: 86400,
    credentials: false,
  })(c, next);
}
