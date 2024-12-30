-- Create URLs table if not exists
CREATE TABLE IF NOT EXISTS urls (
  id UUID PRIMARY KEY,
  slug VARCHAR(255) UNIQUE,
  original_url TEXT,
  created_at TIMESTAMP,
  expires_at TIMESTAMP,
  click_count INTEGER DEFAULT 0
);

-- Create archived URLs table if not exists
CREATE TABLE IF NOT EXISTS archived_urls (
  id UUID PRIMARY KEY,
  slug VARCHAR(255),
  original_url TEXT,
  created_at TIMESTAMP,
  expires_at TIMESTAMP,
  click_count INTEGER DEFAULT 0,
  archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  username VARCHAR(255) UNIQUE,
  password TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create migrations table if not exists
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 