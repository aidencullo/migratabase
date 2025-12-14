-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS migratabase;
USE migratabase;

-- Table for migrants with all relevant information
CREATE TABLE IF NOT EXISTS migrants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country_of_origin VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  age INT,
  current_location VARCHAR(255),
  status VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_country (country_of_origin),
  INDEX idx_status (status)
);

-- Table for just names (normalized)
CREATE TABLE IF NOT EXISTS migrant_names (
  id INT AUTO_INCREMENT PRIMARY KEY,
  migrant_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (migrant_id) REFERENCES migrants(id) ON DELETE CASCADE,
  INDEX idx_migrant_id (migrant_id),
  INDEX idx_name (name)
);

-- Table for relationships between migrants
CREATE TABLE IF NOT EXISTS migrant_relationships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  migrant_id_1 INT NOT NULL,
  migrant_id_2 INT NOT NULL,
  relationship_type VARCHAR(100) NOT NULL, -- e.g., 'family', 'friend', 'acquaintance', 'colleague'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (migrant_id_1) REFERENCES migrants(id) ON DELETE CASCADE,
  FOREIGN KEY (migrant_id_2) REFERENCES migrants(id) ON DELETE CASCADE,
  INDEX idx_migrant_1 (migrant_id_1),
  INDEX idx_migrant_2 (migrant_id_2),
  UNIQUE KEY unique_relationship (migrant_id_1, migrant_id_2, relationship_type)
);
