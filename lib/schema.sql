-- SQLite schema (in-memory). Keep it small + portable.
PRAGMA foreign_keys = ON;

-- Table for migrants with all relevant information
CREATE TABLE IF NOT EXISTS migrants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  country_of_origin TEXT NOT NULL,
  date_of_birth TEXT NOT NULL, -- ISO-8601 (YYYY-MM-DD)
  age INTEGER,
  current_location TEXT,
  status TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_migrants_name ON migrants(name);
CREATE INDEX IF NOT EXISTS idx_migrants_country ON migrants(country_of_origin);
CREATE INDEX IF NOT EXISTS idx_migrants_status ON migrants(status);

-- Table for just names (normalized)
CREATE TABLE IF NOT EXISTS migrant_names (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  migrant_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (migrant_id) REFERENCES migrants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_migrant_names_migrant_id ON migrant_names(migrant_id);
CREATE INDEX IF NOT EXISTS idx_migrant_names_name ON migrant_names(name);

-- Table for relationships between migrants
CREATE TABLE IF NOT EXISTS migrant_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  migrant_id_1 INTEGER NOT NULL,
  migrant_id_2 INTEGER NOT NULL,
  relationship_type TEXT NOT NULL, -- e.g., 'family', 'friend', 'acquaintance', 'colleague'
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (migrant_id_1) REFERENCES migrants(id) ON DELETE CASCADE,
  FOREIGN KEY (migrant_id_2) REFERENCES migrants(id) ON DELETE CASCADE,
  UNIQUE (migrant_id_1, migrant_id_2, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_relationships_migrant_1 ON migrant_relationships(migrant_id_1);
CREATE INDEX IF NOT EXISTS idx_relationships_migrant_2 ON migrant_relationships(migrant_id_2);

-- Keep updated_at fresh (SQLite doesn't support ON UPDATE CURRENT_TIMESTAMP)
CREATE TRIGGER IF NOT EXISTS migrants_set_updated_at
AFTER UPDATE ON migrants
FOR EACH ROW
BEGIN
  UPDATE migrants SET updated_at = datetime('now') WHERE id = NEW.id;
END;
