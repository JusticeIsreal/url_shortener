import fastify from "fastify";

//@ts-ignore
const pool = fastify.pg;

export default pool;
// const { Pool } = require("pg");

// const pool = new Pool({
//   host: "localhost",
//   port: "5433",
//   user: "postgres",
//   password: "3719",
//   database: "url_shortener",
// });

// module.exports = pool;
