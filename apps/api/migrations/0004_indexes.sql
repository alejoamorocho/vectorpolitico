-- Migration 0004 — Índices y vista agregada para el compass

-- Índices para queries frecuentes del API
CREATE INDEX IF NOT EXISTS idx_entities_confidence
  ON entities(evidenced_confidence);

CREATE INDEX IF NOT EXISTS idx_entities_compass
  ON entities(evidenced_x, evidenced_y);

CREATE INDEX IF NOT EXISTS idx_entities_country_type
  ON entities(country, type);

CREATE INDEX IF NOT EXISTS idx_periods_role
  ON periods(role);

CREATE INDEX IF NOT EXISTS idx_periods_entity
  ON periods(entity_id);

-- Vista helper para el endpoint /api/compass
-- No es vista materializada — SQLite/D1 la resuelve en cada query pero
-- simplifica el SQL en el worker.
CREATE VIEW IF NOT EXISTS v_compass AS
SELECT
  e.id,
  e.country,
  e.type,
  e.display_name,
  e.photo_url,
  e.party_id,
  e.self_x,
  e.self_y,
  e.evidenced_x,
  e.evidenced_y,
  e.evidenced_confidence,
  e.coherence_delta,
  (SELECT COUNT(*) FROM incoherences i WHERE i.entity_id = e.id) AS incoherence_count
FROM entities e;
