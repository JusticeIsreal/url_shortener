"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const User = (pool) => ({
    // CREATE USER AND TO DATABASE
    async create({ username, email, password, rank }) {
        const id = (0, uuid_1.v4)();
        const created_at = new Date();
        const query = `INSERT INTO users (id, username, password, email, rank, created_at) 
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, username, email, rank, created_at`;
        const { rows } = await pool.query(query, [
            id,
            username,
            password,
            email,
            rank,
            created_at,
        ]);
        return rows[0];
    },
    // FIND IF USER EXISTS IN DATABASE
    async findById(id) {
        const query = `SELECT * FROM users WHERE id = $1`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },
    // FIND IF USER EXISTS IN DATABASE
    async findByEmail(email) {
        const query = `SELECT * FROM users WHERE email = $1`;
        const { rows } = await pool.query(query, [email]);
        return rows[0];
    },
    // DELETE SINGLE USER & ITS ROW FROM THE DATABASE
    async deleteByEmail(email) {
        const query = `DELETE FROM users WHERE email = $1 RETURNING *`;
        const { rows } = await pool.query(query, [email]);
        return rows[0];
    },
});
exports.default = User;
