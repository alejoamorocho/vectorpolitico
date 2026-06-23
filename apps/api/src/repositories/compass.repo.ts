/** Acceso a datos agregados para el compass global sobre D1. */

export async function getCompass(db: D1Database, country: string) {
  const [entities, parties, ideologies] = await Promise.all([
    db
      .prepare(
        `SELECT id, display_name AS displayName, type, photo_url AS photoUrl,
                party_id AS party, self_x AS selfX, self_y AS selfY,
                evidenced_x AS evidencedX, evidenced_y AS evidencedY,
                evidenced_confidence AS confidence, coherence_delta AS delta
         FROM entities WHERE country = ?`,
      )
      .bind(country)
      .all(),
    db.prepare('SELECT id, name, color FROM parties WHERE country = ?').bind(country).all(),
    db.prepare('SELECT * FROM ideologies').all(),
  ]);

  return {
    entities: entities.results ?? [],
    parties: parties.results ?? [],
    ideologies: ideologies.results ?? [],
    country,
  };
}
