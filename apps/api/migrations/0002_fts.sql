-- Migration 0002 — FTS5 sobre entidades
-- Permite búsqueda por nombre con tolerancia a acentos y prefijo.
-- "petro" → "Petró" · "uribe" → "Uribe Vélez"

CREATE VIRTUAL TABLE IF NOT EXISTS entities_fts USING fts5(
  id UNINDEXED,
  display_name,
  full_name,
  bio,
  ideologies,
  tokenize = 'unicode61 remove_diacritics 2'
);

-- Sincronía con la tabla principal — triggers
CREATE TRIGGER IF NOT EXISTS entities_fts_ai AFTER INSERT ON entities BEGIN
  INSERT INTO entities_fts(id, display_name, full_name, bio, ideologies)
  VALUES (
    new.id,
    new.display_name,
    new.full_name,
    new.bio,
    new.ideologies
  );
END;

CREATE TRIGGER IF NOT EXISTS entities_fts_ad AFTER DELETE ON entities BEGIN
  DELETE FROM entities_fts WHERE id = old.id;
END;

CREATE TRIGGER IF NOT EXISTS entities_fts_au AFTER UPDATE ON entities BEGIN
  DELETE FROM entities_fts WHERE id = old.id;
  INSERT INTO entities_fts(id, display_name, full_name, bio, ideologies)
  VALUES (
    new.id,
    new.display_name,
    new.full_name,
    new.bio,
    new.ideologies
  );
END;
