-- Migration 0003 — Noticias GDELT por entidad
-- Las noticias se guardan en D1 (no solo en KV) para permitir queries
-- históricas y series temporales del compass evidenciado.

CREATE TABLE IF NOT EXISTS news_articles (
  id              TEXT PRIMARY KEY,     -- hash(url) para dedupe
  entity_id       TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,
  title           TEXT NOT NULL,
  outlet          TEXT NOT NULL,
  source_country  TEXT,                 -- ISO country code del origen
  language        TEXT,                 -- ISO 639 (es, en, etc.)
  published_at    TEXT NOT NULL,        -- ISO YYYY-MM-DD
  tone            REAL,                 -- GDELT V2 tone (-100..+100)
  themes          TEXT,                 -- JSON array de temas GDELT
  fetched_at      TEXT NOT NULL DEFAULT (datetime('now')),
  archived_url    TEXT,                 -- Wayback Machine snapshot
  UNIQUE (entity_id, url)
);

CREATE INDEX IF NOT EXISTS idx_news_entity_date
  ON news_articles(entity_id, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_outlet
  ON news_articles(outlet);

CREATE INDEX IF NOT EXISTS idx_news_fetched
  ON news_articles(fetched_at DESC);
