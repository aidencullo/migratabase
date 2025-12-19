-- SQLite schema for Migratabase

-- Table for migrants with all relevant information
CREATE TABLE IF NOT EXISTS migrants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  country_of_origin TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  age INTEGER,
  current_location TEXT,
  status TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_migrants_name ON migrants (name);
CREATE INDEX IF NOT EXISTS idx_migrants_country ON migrants (country_of_origin);
CREATE INDEX IF NOT EXISTS idx_migrants_status ON migrants (status);

-- Table for just names (normalized)
CREATE TABLE IF NOT EXISTS migrant_names (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  migrant_id INTEGER NOT NULL REFERENCES migrants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_migrant_names_migrant_id ON migrant_names (migrant_id);
CREATE INDEX IF NOT EXISTS idx_migrant_names_name ON migrant_names (name);

-- Table for relationships between migrants
CREATE TABLE IF NOT EXISTS migrant_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  migrant_id_1 INTEGER NOT NULL REFERENCES migrants(id) ON DELETE CASCADE,
  migrant_id_2 INTEGER NOT NULL REFERENCES migrants(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(migrant_id_1, migrant_id_2, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_migrant_relationships_migrant_1 ON migrant_relationships (migrant_id_1);
CREATE INDEX IF NOT EXISTS idx_migrant_relationships_migrant_2 ON migrant_relationships (migrant_id_2);
