import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Bindings, Variables } from '../env';
import { listIdeologies, getIdeologyById } from '../repositories/ideologies.repo';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const querySchema = z.object({
  quadrant: z.enum(['auth_left', 'auth_right', 'lib_left', 'lib_right']).optional(),
});

app.get('/', zValidator('query', querySchema), async (c) => {
  const { quadrant } = c.req.valid('query');
  const items = await listIdeologies(c.env.DB, quadrant);
  return c.json({ items, count: items.length });
});

app.get('/:id', async (c) => {
  const id = c.req.param('id');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) return c.json({ error: 'invalid_id' }, 400);
  const row = await getIdeologyById(c.env.DB, id);
  if (!row) return c.json({ error: 'not_found' }, 404);
  return c.json(row);
});

export default app;
