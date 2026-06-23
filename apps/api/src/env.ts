/**
 * Tipado de bindings del Worker.
 *
 * Estos valores son inyectados por Cloudflare en `c.env` en cada request.
 * - Los bindings (DB, ASSETS, CACHE, RATELIMIT) se definen en wrangler.toml
 * - Las vars (ENVIRONMENT, ALLOWED_ORIGINS) se definen en wrangler.toml [vars]
 * - Los secrets (ANTHROPIC_API_KEY, etc.) se configuran con `wrangler secret put`
 */

export type Bindings = {
  // Bindings de recursos
  DB: D1Database;
  ASSETS: R2Bucket;
  CACHE: KVNamespace;
  RATELIMIT: KVNamespace;

  // Variables públicas (wrangler.toml [vars])
  ENVIRONMENT: 'production' | 'staging' | 'development';
  ALLOWED_ORIGINS: string;

  // Secrets (wrangler secret put / .dev.vars)
  ANTHROPIC_API_KEY?: string;
  SENTRY_DSN?: string;
};

// El cache deriva su clave de la URL (ver middleware/cache.ts); no se usan
// variables de contexto por ahora.
export type Variables = Record<string, never>;
