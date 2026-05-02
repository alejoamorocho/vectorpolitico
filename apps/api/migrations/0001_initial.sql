-- Brújula Política — Schema D1
-- Migración: 0001_initial
-- Ejecutar: wrangler d1 execute brujula-politica --file=migrations/0001_initial.sql

-- ─── Ideologías (las ~150 celdas del compass) ────────────────────────────────
CREATE TABLE IF NOT EXISTS ideologies (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  name_en     TEXT,
  x           REAL NOT NULL CHECK (x BETWEEN -10 AND 10),
  y           REAL NOT NULL CHECK (y BETWEEN -10 AND 10),
  width       REAL NOT NULL DEFAULT 2.0,
  height      REAL NOT NULL DEFAULT 2.0,
  quadrant    TEXT NOT NULL CHECK (quadrant IN ('auth_left', 'auth_right', 'lib_left', 'lib_right')),
  color       TEXT NOT NULL,
  description TEXT NOT NULL,
  key_thinkers    TEXT,   -- JSON array
  historical_examples TEXT, -- JSON array
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Partidos políticos ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parties (
  id              TEXT PRIMARY KEY,
  country         TEXT NOT NULL DEFAULT 'co',
  name            TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  color           TEXT NOT NULL,
  logo_url        TEXT,
  founded_year    INTEGER,
  dissolved_year  INTEGER,
  description     TEXT NOT NULL,
  ideologies      TEXT,     -- JSON array de ideology ids
  compass_x       REAL,
  compass_y       REAL,
  compass_justification TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Entidades políticas ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS entities (
  id              TEXT PRIMARY KEY,
  country         TEXT NOT NULL DEFAULT 'co',
  type            TEXT NOT NULL CHECK (type IN (
    'president', 'presidential_candidate', 'senator',
    'representative', 'governor', 'mayor'
  )),
  full_name       TEXT NOT NULL,
  display_name    TEXT NOT NULL,
  photo_url       TEXT,
  party_id        TEXT REFERENCES parties(id),
  bio             TEXT NOT NULL DEFAULT '',

  -- Posición autopercibida 🔵
  self_x          REAL CHECK (self_x BETWEEN -10 AND 10),
  self_y          REAL CHECK (self_y BETWEEN -10 AND 10),
  self_justification TEXT,
  self_sources    TEXT,     -- JSON array de Source

  -- Posición evidenciada 🔴
  evidenced_x     REAL CHECK (evidenced_x BETWEEN -10 AND 10),
  evidenced_y     REAL CHECK (evidenced_y BETWEEN -10 AND 10),
  evidenced_confidence TEXT CHECK (evidenced_confidence IN ('low', 'medium', 'high')),
  evidenced_justification TEXT,
  evidenced_sources TEXT,   -- JSON array de Source
  dimension_scores TEXT,    -- JSON object DimensionScores

  -- Delta (calculado, se actualiza cuando cambian las posiciones)
  coherence_delta REAL GENERATED ALWAYS AS (
    CASE
      WHEN self_x IS NOT NULL AND evidenced_x IS NOT NULL
      THEN SQRT(((evidenced_x - self_x) * (evidenced_x - self_x)) + ((evidenced_y - self_y) * (evidenced_y - self_y)))
      ELSE NULL
    END
  ) STORED,

  ideologies      TEXT,     -- JSON array de tags
  last_updated    TEXT NOT NULL DEFAULT (datetime('now')),
  contributors    TEXT NOT NULL DEFAULT '[]',  -- JSON array de github usernames

  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Períodos de ejercicio ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS periods (
  id          TEXT PRIMARY KEY,
  entity_id   TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  role        TEXT NOT NULL,
  start_date  TEXT NOT NULL,
  end_date    TEXT,
  region      TEXT,           -- para alcaldes y gobernadores
  elected_with REAL,          -- porcentaje de votos
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Incoherencias ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incoherences (
  id              TEXT PRIMARY KEY,
  entity_id       TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  category        TEXT NOT NULL CHECK (category IN (
    'economia', 'seguridad', 'derechos_humanos', 'medio_ambiente',
    'corrupcion', 'relaciones_exteriores', 'educacion', 'salud'
  )),
  severity        TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  verified        INTEGER NOT NULL DEFAULT 0,  -- 0 = false, 1 = true
  verified_by     TEXT,

  -- La promesa
  proposal_text   TEXT NOT NULL,
  proposal_url    TEXT NOT NULL,
  proposal_outlet TEXT NOT NULL,
  proposal_date   TEXT NOT NULL,
  proposal_archived TEXT NOT NULL,

  -- La acción contraria
  action_text     TEXT NOT NULL,
  action_url      TEXT NOT NULL,
  action_outlet   TEXT NOT NULL,
  action_date     TEXT NOT NULL,
  action_archived TEXT NOT NULL,

  nuances         TEXT,
  added_by        TEXT NOT NULL,
  added_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_entities_country ON entities(country);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_party ON entities(party_id);
CREATE INDEX IF NOT EXISTS idx_periods_entity ON periods(entity_id);
CREATE INDEX IF NOT EXISTS idx_periods_dates ON periods(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_incoherences_entity ON incoherences(entity_id);
CREATE INDEX IF NOT EXISTS idx_incoherences_category ON incoherences(category);
CREATE INDEX IF NOT EXISTS idx_incoherences_severity ON incoherences(severity);
CREATE INDEX IF NOT EXISTS idx_incoherences_verified ON incoherences(verified);
