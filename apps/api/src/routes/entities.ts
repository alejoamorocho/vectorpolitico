import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Bindings, Variables } from '../env';

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
  const q = c.req.valid('query');

  // Build WHERE dinámico con prepared statements (sin concatenar strings)
  const where: string[] = ['e.country = ?'];
  const binds: unknown[] = [q.country];

  if (q.type) {
    const types = q.type.split(',').map((t) => t.trim());
    where.push(`e.type IN (${types.map(() => '?').join(',')})`);
    binds.push(...types);
  }
  if (q.party) {
    where.push('e.party_id = ?');
    binds.push(q.party);
  }
  if (q.confidence) {
    where.push('e.evidenced_confidence = ?');
    binds.push(q.confidence);
  }
  if (q.period) {
    const [from, to] = q.period.split('-');
    where.push(
      `EXISTS (SELECT 1 FROM periods p WHERE p.entity_id = e.id AND p.start_date <= ? AND (p.end_date IS NULL OR p.end_date >= ?))`,
    );
    binds.push(`${to}-12-31`, `${from}-01-01`);
  }

  const sql = `
    SELECT
      e.id, e.country, e.type, e.display_name AS displayName, e.photo_url AS photoUrl,
      e.party_id AS party, e.self_x AS selfX, e.self_y AS selfY,
      e.evidenced_x AS evidencedX, e.evidenced_y AS evidencedY,
      e.evidenced_confidence AS confidence, e.coherence_delta AS delta,
      (SELECT COUNT(*) FROM incoherences WHERE entity_id = e.id) AS incoherenceCount
    FROM entities e
    WHERE ${where.join(' AND ')}
    ORDER BY e.display_name
    LIMIT ?
  `;
  binds.push(q.limit);

  const { results } = await c.env.DB.prepare(sql).bind(...binds).all();

  const items = (results ?? []).map((r: any) => ({
    id: r.id,
    country: r.country,
    type: r.type,
    displayName: r.displayName,
    photoUrl: r.photoUrl ?? undefined,
    party: r.party ?? undefined,
    periods: [], // el listado no trae períodos — usar /entities/:id para full
    compassSelfPerceived: { x: r.selfX, y: r.selfY },
    compassEvidenced: { x: r.evidencedX, y: r.evidencedY, confidence: r.confidence },
    delta: r.delta,
    incoherenceCount: r.incoherenceCount,
  }));

  return c.json({ items, count: items.length });
});

app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare('SELECT * FROM entities WHERE id = ?').bind(id).first();
  if (!row) return c.json({ error: 'not_found' }, 404);

  // Fetch relaciones
  const periods = await c.env.DB.prepare(
    'SELECT role, start_date, end_date, region, elected_with FROM periods WHERE entity_id = ? ORDER BY start_date',
  )
    .bind(id)
    .all();

  const incoherences = await c.env.DB.prepare(
    'SELECT * FROM incoherences WHERE entity_id = ? ORDER BY added_at DESC',
  )
    .bind(id)
    .all();

  return c.json({ entity: row, periods: periods.results, incoherences: incoherences.results });
});

export default app;
