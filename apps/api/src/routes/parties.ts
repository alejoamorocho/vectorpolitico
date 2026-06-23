import { Hono } from 'hono';
import type { Bindings, Variables } from '../env';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.get('/', async (c) => {
  const country = (c.req.query('country') ?? 'co').toLowerCase();
  if (!/^[a-z]{2}$/.test(country)) return c.json({ error: 'invalid_country' }, 400);
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM parties WHERE country = ? ORDER BY name',
  )
    .bind(country)
    .all();
  return c.json({ items: results ?? [], count: results?.length ?? 0 });
});

app.get('/:id', async (c) => {
  const id = c.req.param('id');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) return c.json({ error: 'invalid_id' }, 400);
  const party = await c.env.DB.prepare('SELECT * FROM parties WHERE id = ?').bind(id).first();
  if (!party) return c.json({ error: 'not_found' }, 404);

  const members = await c.env.DB.prepare(
    `SELECT id, display_name AS displayName, type, evidenced_x AS evidencedX, evidenced_y AS evidencedY
     FROM entities WHERE party_id = ? ORDER BY display_name`,
  )
    .bind(id)
    .all();

  return c.json({ party, members: members.results ?? [] });
});

export default app;
