import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import jwt from "fastify-jwt";
import pool from "../database/config";
const bcrypt = require("bcrypt");

interface LoginBody {
  username: string;
  password: string;
}

export async function loginRoute(fastify: FastifyInstance) {
  fastify.post(
    "/login",
    async (
      request: FastifyRequest<{ Body: LoginBody }>,
      reply: FastifyReply
    ) => {
      const { username, password } = request.body;
      try {
        const query = `SELET * FROM users WHERE username =$1`;
        const { rows } = await pool.query(query, [username]);
        if (rows.length < 0) {
          return reply
            .status(401)
            .send({ message: "Invalid username or password" });
        }
        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return reply
            .status(401)
            .send({ message: "Invalid username or password" });
        }

        const token = fastify.jwt.sign({
          id: user.id,
          username: user.username,
        });

        reply.status(200).send({ message: "Login successful", token });
      } catch (error) {
        console.error("Error logging in:", error);
        reply.status(500).send({ message: "Error logging in", error });
      }
    }
  );
}
