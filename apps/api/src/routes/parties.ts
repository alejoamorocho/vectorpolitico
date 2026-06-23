import { Hono } from 'hono';
import type { Bindings, Variables } from '../env';
import { listParties, getPartyDetail } from '../repositories/parties.repo';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.get('/', async (c) => {
  const country = (c.req.query('country') ?? 'co').toLowerCase();
  if (!/^[a-z]{2}$/.test(country)) return c.json({ error: 'invalid_country' }, 400);
  const items = await listParties(c.env.DB, country);
  return c.json({ items, count: items.length });
});

app.get('/:id', async (c) => {
  const id = c.req.param('id');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) return c.json({ error: 'invalid_id' }, 400);
  const detail = await getPartyDetail(c.env.DB, id);
  if (!detail) return c.json({ error: 'not_found' }, 404);
  return c.json(detail);
});

export default app;
