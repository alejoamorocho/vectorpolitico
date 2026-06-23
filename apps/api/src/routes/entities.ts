import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Bindings, Variables } from '../env';
import { listEntitySummaries, getEntityDetail } from '../repositories/entities.repo';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const listQuerySchema = z.object({
  country: z.string().length(2).default('co'),
  type: z.string().optional(),
  period: z
    .string()
    .regex(/^\d{4}-\d{4}$/)
    .optional(),
  party: z.string().optional(),
  confidence: z.enum(['low', 'medium', 'high']).optional(),
  q: z.string().min(2).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

app.get('/', zValidator('query', listQuerySchema), async (c) => {
  const items = await listEntitySummaries(c.env.DB, c.req.valid('query'));
  return c.json({ items, count: items.length });
});

app.get('/:id', async (c) => {
  const id = c.req.param('id');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) return c.json({ error: 'invalid_id' }, 400);
  const detail = await getEntityDetail(c.env.DB, id);
  if (!detail) return c.json({ error: 'not_found' }, 404);
  return c.json(detail);
});

export default app;
