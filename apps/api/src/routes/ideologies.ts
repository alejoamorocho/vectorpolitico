import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Bindings, Variables } from '../env';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const querySchema = z.object({
  quadrant: z.enum(['auth_left', 'auth_right', 'lib_left', 'lib_right']).optional(),
});

app.get('/', zValidator('query', querySchema), async (c) => {
  const q = c.req.valid('query');

  let sql = 'SELECT * FROM ideologies';
  const binds: unknown[] = [];
  if (q.quadrant) {
    sql += ' WHERE quadrant = ?';
    binds.push(q.quadrant);
  }
  sql += ' ORDER BY quadrant, y DESC, x';

  const { results } = await c.env.DB.prepare(sql).bind(...binds).all();
  return c.json({ items: results ?? [], count: results?.length ?? 0 });
});

app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare('SELECT * FROM ideologies WHERE id = ?').bind(id).first();
  if (!row) return c.json({ error: 'not_found' }, 404);
  return c.json(row);
});

export default app;
