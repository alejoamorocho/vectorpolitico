/**
 * Acceso a datos de entidades (figuras políticas) sobre D1.
 * Encapsula el SQL para que los handlers HTTP queden libres de detalles de BD.
 */

export type EntityListFilters = {
  country: string;
  type?: string;
  party?: string;
  confidence?: string;
  period?: string;
  limit: number;
};

export async function listEntitySummaries(db: D1Database, q: EntityListFilters) {
  // WHERE dinámico con prepared statements (sin concatenar valores)
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

  const { results } = await db.prepare(sql).bind(...binds).all();

  return (results ?? []).map((r: any) => ({
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
}

export async function getEntityDetail(db: D1Database, id: string) {
  const entity = await db.prepare('SELECT * FROM entities WHERE id = ?').bind(id).first();
  if (!entity) return null;

  const periods = await db
    .prepare(
      'SELECT role, start_date, end_date, region, elected_with FROM periods WHERE entity_id = ? ORDER BY start_date',
    )
    .bind(id)
    .all();

  const incoherences = await db
    .prepare('SELECT * FROM incoherences WHERE entity_id = ? ORDER BY added_at DESC')
    .bind(id)
    .all();

  return { entity, periods: periods.results, incoherences: incoherences.results };
}
