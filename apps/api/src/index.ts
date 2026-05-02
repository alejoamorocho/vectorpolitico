/**
 * Brújula Política API — Cloudflare Worker + Hono.
 *
 * Router principal. Las rutas individuales están en `src/routes/`.
 * Middleware de CORS, rate limiting y cache KV aplicado globalmente.
 */

import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { etag } from 'hono/etag';

import type { Bindings, Variables } from './env';
import { corsMiddleware } from './middleware/cors';
import { rateLimit } from './middleware/ratelimit';
import { kvCache } from './middleware/cache';

import entitiesRoute from './routes/entities';
import partiesRoute from './routes/parties';
import ideologiesRoute from './routes/ideologies';
import compassRoute from './routes/compass';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ─── Middleware global ──────────────────────────────────────────────
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', etag());
app.use('*', corsMiddleware);
app.use('/api/*', rateLimit({ window: 60, max: 120 }));
app.use('/api/*', kvCache(300));

// ─── Health ─────────────────────────────────────────────────────────
app.get('/', (c) =>
  c.json({
    name: 'brujula-politica-api',
    version: '0.1.0',
    environment: c.env.ENVIRONMENT,
    endpoints: [
      'GET /health',
      'GET /api/entities',
      'GET /api/entities/:id',
      'GET /api/parties',
      'GET /api/parties/:id',
      'GET /api/ideologies',
      'GET /api/ideologies/:id',
      'GET /api/compass',
    ],
  }),
);

app.get('/health', (c) =>
  c.json({ ok: true, environment: c.env.ENVIRONMENT, timestamp: new Date().toISOString() }),
);

// ─── Rutas ──────────────────────────────────────────────────────────
app.route('/api/entities', entitiesRoute);
app.route('/api/parties', partiesRoute);
app.route('/api/ideologies', ideologiesRoute);
app.route('/api/compass', compassRoute);

// ─── Error handlers ─────────────────────────────────────────────────
app.notFound((c) => c.json({ error: 'not_found', path: c.req.path }, 404));
app.onError((err, c) => {
  console.error('[onError]', err);
  return c.json(
    {
      error: 'internal_error',
      message: c.env.ENVIRONMENT === 'production' ? 'Something went wrong' : err.message,
    },
    500,
  );
});

export default app;
