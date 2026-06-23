/** Acceso a datos de partidos sobre D1. */

export async function listParties(db: D1Database, country: string) {
  const { results } = await db
    .prepare('SELECT * FROM parties WHERE country = ? ORDER BY name')
    .bind(country)
    .all();
  return results ?? [];
}

export async function getPartyDetail(db: D1Database, id: string) {
  const party = await db.prepare('SELECT * FROM parties WHERE id = ?').bind(id).first();
  if (!party) return null;

  const members = await db
    .prepare(
      `SELECT id, display_name AS displayName, type, evidenced_x AS evidencedX, evidenced_y AS evidencedY
       FROM entities WHERE party_id = ? ORDER BY display_name`,
    )
    .bind(id)
    .all();

  return { party, members: members.results ?? [] };
}
