/** Acceso a datos de ideologías sobre D1. */

export async function listIdeologies(db: D1Database, quadrant?: string) {
  let sql = 'SELECT * FROM ideologies';
  const binds: unknown[] = [];
  if (quadrant) {
    sql += ' WHERE quadrant = ?';
    binds.push(quadrant);
  }
  sql += ' ORDER BY quadrant, y DESC, x';

  const { results } = await db.prepare(sql).bind(...binds).all();
  return results ?? [];
}

export async function getIdeologyById(db: D1Database, id: string) {
  return db.prepare('SELECT * FROM ideologies WHERE id = ?').bind(id).first();
}
