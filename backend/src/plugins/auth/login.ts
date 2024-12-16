import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import jwt from "fastify-jwt";
import pool from "../database/config";
import bcrypt from "bcrypt";
const fastify = require("fastify")();

interface LoginBody {
  email: string;
  password: string;
}

fastify.post(
  "/login",
  async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
    const { email, password } = request.body;
    try {
      const query = `SELET * FROM users WHERE email =$1`;
      const { rows } = await pool.query(query, [email]);
      if (rows.length < 1) {
        return reply.status(401).send({ message: "Invalid email or password" });
      }
      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return reply.status(401).send({ message: "Invalid email or password" });
      }

      const token = fastify.jwt.sign({
        id: user.id,
        username: user.username,
      });

      reply.status(200).send({
        message: "Login successful",
        id: user.id,
        username: user.username,
        email: user.email,
        rank: user.rank,
        token,
      });
    } catch (error) {
      console.error("Error logging in:", error);
      reply.status(500).send({ message: "Error logging in", error });
    }
  }
);
module.exports = fastify;
