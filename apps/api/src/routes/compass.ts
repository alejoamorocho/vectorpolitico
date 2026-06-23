import { Hono } from 'hono';
import type { Bindings, Variables } from '../env';
import { getCompass } from '../repositories/compass.repo';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/**
 * Endpoint agregado para el compass global.
 * Devuelve todos los summaries + lista de partidos + ideologías en una
 * sola respuesta cacheada para minimizar round-trips del frontend.
 */
app.get('/', async (c) => {
  const country = (c.req.query('country') ?? 'co').toLowerCase();
  if (!/^[a-z]{2}$/.test(country)) return c.json({ error: 'invalid_country' }, 400);
  return c.json(await getCompass(c.env.DB, country));
});

export default app;
