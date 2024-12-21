"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const Url = (pool) => ({
    // CREATE / ADD URL TO THE DATABASE TABLE
    async create({ slug, original_url, expires_at }) {
        const id = (0, uuid_1.v4)();
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
    async findBySlug(slug) {
        const query = `SELECT * FROM urls WHERE slug = $1`;
        const { rows } = await pool.query(query, [slug]);
        return rows[0];
    },
    // FIND IF SLUG EXISTS IN DATABASE
    async findByLongUrl(original_url) {
        const query = `SELECT * FROM urls WHERE original_url = $1`;
        const { rows } = await pool.query(query, [original_url]);
        return rows[0];
    },
    // INCREASE click_count AFTER A SUCCESSFUL SLUG REDIRECT
    async incrementClickCount(slug) {
        const query = `
      UPDATE urls
      SET click_count = click_count + 1
      WHERE slug = $1
      RETURNING *`;
        const { rows } = await pool.query(query, [slug]);
        return rows[0];
    },
    // DELETE SINGLE SLUG & ITS ROW FROM THE DATABASE
    async deleteBySlug(slug) {
        const query = `DELETE FROM urls WHERE slug = $1 RETURNING *`;
        const { rows } = await pool.query(query, [slug]);
        return rows[0];
    },
    // UPDATE THE DESTINATION URL OR EXPIRATION DATE
    async updateBySlug(slug, { original_url, expires_at }) {
        const fields = [];
        const values = [];
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
exports.default = Url;
