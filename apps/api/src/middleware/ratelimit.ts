import type { Context, Next } from 'hono';
import type { Bindings } from '../env';

type RateLimitOpts = {
  /** Ventana en segundos. */
  window: number;
  /** Requests máximos por ventana. */
  max: number;
};

/**
 * Rate limiting basado en KV con sliding window discreto.
 *
 * Usa `CF-Connecting-IP` como identificador. Cada ventana es un "bucket"
 * con TTL 2× la ventana, así el rollover es natural.
 *
 * No es el más preciso posible (sliding window real requiere más cuentas)
 * pero es suficiente para V1. Si se quiere precisión, migrar al binding
 * nativo de Cloudflare Rate Limiting.
 */
export function rateLimit(opts: RateLimitOpts) {
  return async (c: Context<{ Bindings: Bindings }>, next: Next) => {
    const ip =
      c.req.header('CF-Connecting-IP') ??
      c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() ??
      'anonymous';

    const bucket = Math.floor(Date.now() / 1000 / opts.window);
    const key = `rl:${ip}:${bucket}`;

    const current = parseInt((await c.env.RATELIMIT.get(key)) ?? '0', 10);
    if (current >= opts.max) {
      return c.json(
        {
          error: 'rate_limited',
          message: `Máximo ${opts.max} requests por ${opts.window}s`,
          retryAfter: opts.window,
        },
        429,
        { 'Retry-After': String(opts.window) },
      );
    }

    await c.env.RATELIMIT.put(key, String(current + 1), {
      expirationTtl: opts.window * 2,
    });

    // Headers informativos
    c.header('X-RateLimit-Limit', String(opts.max));
    c.header('X-RateLimit-Remaining', String(Math.max(0, opts.max - current - 1)));

    await next();
  };
}
