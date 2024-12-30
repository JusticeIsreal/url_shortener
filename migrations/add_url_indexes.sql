-- Add index for original_url
CREATE INDEX IF NOT EXISTS idx_urls_original_url ON urls(original_url);
CREATE INDEX IF NOT EXISTS idx_archived_urls_original_url ON archived_urls(original_url);

-- Add composite index for slug and original_url since they're used together
CREATE INDEX IF NOT EXISTS idx_urls_slug_url ON urls(slug, original_url);
CREATE INDEX IF NOT EXISTS idx_archived_urls_slug_url ON archived_urls(slug, original_url); 