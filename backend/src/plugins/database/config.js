"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
//@ts-ignore
const pool = fastify_1.default.pg;
exports.default = pool;
// const { Pool } = require("pg");
// const pool = new Pool({
//   host: "localhost",
//   port: "5433",
//   user: "postgres",
//   password: "3719",
//   database: "url_shortener",
// });
// module.exports = pool;
