import { PostgresDb } from "@fastify/postgres";
import { v4 as uuidv4 } from "uuid";

interface UrlCreateParams {
  slug?: string;
  original_url?: string;
  expires_at?: string;
}

interface UrlUpdateParams {
  original_url?: string;
  expires_at?: string;
}

const Url = (pool: PostgresDb) => ({
  // CREATE / ADD URL TO THE DATABASE TABLE
  async create({ slug, original_url, expires_at }: UrlCreateParams) {
    const id = uuidv4();
    const created_at = new Date();
    const click_count = 0;

    const query = `
      INSERT INTO urls (id, slug, original_url, created_at, expires_at, click_count)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;

    const { rows } = await pool.query(query, [
      id,
      slug,
      original_url,
      created_at,
      expires_at,
      click_count,
    ]);

    return rows[0];
  },

  // GET ALL ACTIVE URL DATA FROM DATABASE (PAGINATED)
  async paginatedUrls(offset: number, limit: number) {
    const query = `SELECT * FROM urls ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
    const { rows } = await pool.query(query, [limit, offset]);
    return rows;
  },

  async totalCount() {
    const query = `SELECT COUNT(*) FROM urls`;
    const { rows } = await pool.query(query);
    return rows[0].count;
  },

  // FIND IF SLUG EXISTS IN DATABASE
  async findBySlug(slug: string) {
    const query = `SELECT * FROM urls WHERE slug = $1 COLLATE "C"`;
    const { rows } = await pool.query(query, [slug]);

    return rows[0];
  },
  // FIND IF SLUG EXISTS IN DATABASE
  async findByLongUrl(original_url: string) {
    const query = `SELECT * FROM urls WHERE original_url = $1`;
    const { rows } = await pool.query(query, [original_url]);
    return rows[0];
  },

  // INCREASE click_count AFTER A SUCCESSFUL SLUG REDIRECT
  async incrementClickCount(slug: string) {
    const query = `
      UPDATE urls
      SET click_count = click_count + 1
      WHERE id = (
        SELECT id FROM urls 
        WHERE slug = $1 
        AND TRIM(slug) = TRIM($1)
        AND slug ~ '^[a-zA-Z0-9-]+$'
        AND slug = $1
        AND id = (
          SELECT id FROM urls 
          WHERE slug = $1 
          AND TRIM(slug) = TRIM($1)
          ORDER BY created_at ASC 
          LIMIT 1
        )
      )
      RETURNING *`;
    const { rows } = await pool.query(query, [slug]);

    return rows[0];
  },

  // DELETE SINGLE SLUG & ITS ROW FROM THE DATABASE
  async deleteBySlug(slug: string) {
    const query = `DELETE FROM urls WHERE slug = $1 RETURNING *`;
    const { rows } = await pool.query(query, [slug]);
    return rows[0];
  },

  // UPDATE THE DESTINATION URL OR EXPIRATION DATE
  async updateBySlug(
    slug: string,
    { original_url, expires_at }: UrlUpdateParams
  ) {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (original_url) {
      fields.push(`original_url = $${index++}`);
      values.push(original_url);
    }

    if (expires_at) {
      fields.push(`expires_at = $${index++}`);
      values.push(expires_at);
    }

    values.push(slug);

    const query = `
      UPDATE urls
      SET ${fields.join(", ")}
      WHERE slug = $${index}
      RETURNING *`;

    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // PURGE EXPIRED URL DATA
  async purgeExpiredLinks() {
    const query = `
    WITH moved_rows AS (
      DELETE FROM urls
      WHERE expires_at < NOW()
      RETURNING *
    )
    INSERT INTO archived_urls (id, slug, original_url, created_at, expires_at, click_count, archived_at)
    SELECT id, slug, original_url, created_at, expires_at, click_count, NOW()
    FROM moved_rows
    RETURNING *;
  `;

    const { rows } = await pool.query(query);
    return rows; // Returns the rows that were archived
  },

  // GET ALL EXPIRED URL
  async allExpiredSlug() {
    const query = `SELECT * FROM archived_urls`;
    const { rows } = await pool.query(query);
    return rows;
  },

  // GET ALL ACTIVE URL DATA FROM DATABASE (PAGINATED)
  async paginatedExpiredUrls(offset: number, limit: number) {
    const query = `SELECT * FROM archived_urls ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
    const { rows } = await pool.query(query, [limit, offset]);
    return rows;
  },
});

export default Url;
