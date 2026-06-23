import { Hono } from 'hono';
import type { Bindings, Variables } from '../env';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/**
 * Endpoint agregado para el compass global.
 * Devuelve todos los summaries + lista de partidos + ideologías en una
 * sola respuesta cacheada para minimizar round-trips del frontend.
 */
app.get('/', async (c) => {
  const country = (c.req.query('country') ?? 'co').toLowerCase();
  if (!/^[a-z]{2}$/.test(country)) return c.json({ error: 'invalid_country' }, 400);

  const [entities, parties, ideologies] = await Promise.all([
    c.env.DB.prepare(
      `SELECT id, display_name AS displayName, type, photo_url AS photoUrl,
              party_id AS party, self_x AS selfX, self_y AS selfY,
              evidenced_x AS evidencedX, evidenced_y AS evidencedY,
              evidenced_confidence AS confidence, coherence_delta AS delta
       FROM entities WHERE country = ?`,
    )
      .bind(country)
      .all(),
    c.env.DB.prepare('SELECT id, name, color FROM parties WHERE country = ?').bind(country).all(),
    c.env.DB.prepare('SELECT * FROM ideologies').all(),
  ]);

  return c.json({
    entities: entities.results ?? [],
    parties: parties.results ?? [],
    ideologies: ideologies.results ?? [],
    country,
  });
});

export default app;
