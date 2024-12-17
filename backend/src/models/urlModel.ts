import { PostgresDb } from '@fastify/postgres'
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

  // FIND IF SLUG EXISTS IN DATABASE
  async findBySlug(slug: string) {
    const query = `SELECT * FROM urls WHERE slug = $1`;
    const { rows } = await pool.query(query, [slug]);
    return rows[0];
  },

  // INCREASE click_count AFTER A SUCCESSFUL SLUG REDIRECT
  async incrementClickCount(slug: string) {
    const query = `
      UPDATE urls
      SET click_count = click_count + 1
      WHERE slug = $1
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
  async updateBySlug(slug: string, { original_url, expires_at }: UrlUpdateParams) {
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
});

export default Url;
