-- Add index to urls table
CREATE INDEX IF NOT EXISTS idx_urls_slug ON urls(slug);

-- Add index to archived_urls table
CREATE INDEX IF NOT EXISTS idx_archived_urls_slug ON archived_urls(slug); 