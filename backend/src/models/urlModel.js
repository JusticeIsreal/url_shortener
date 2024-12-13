const { v4: uuidv4 } = require("uuid");
const pool = require("../plugins/database/config");

const Url = {
  // CREATE / ADD URL TO THE DATABAASE TABLE
  async create({ slug, original_url, expires_at }) {
    const id = uuidv4().toString();
    const created_at = new Date();
    const click_count = 0;

    const query = `INSERT INTO urls (id, slug, original_url,created_at, expires_at, click_count)
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

  // FIND IF SLUG EXIST IN DATABASE
  async findBySlug(slug) {
    const query = `SELECT * FROM urls WHERE slug = $1`;
    const { rows } = await pool.query(query, [slug]);
    return rows[0];
  },

  // INCREASE click_count AFTER A SUCCESSFUL SLUG REDIRECT
  async incrementClickCount(slug) {
    const query = `
    UPDATE urls
    SET click_count = click_count + 1
    WHERE slug = $1
    RETUENING *
    `;
    const { rows } = await pool.query(query, [slug]);

    return rows[0];
  },

  // DELETE SINGLE SLUG & IT ROW  FROM THE DATABASE
  async deleteBySlug(slug) {
    const query = `DELETE FROM urls WHERE slug = $1`;
    const { rows } = pool.query(query, [slug]);
    return rows[0];
  },
};

module.exports = Url;
