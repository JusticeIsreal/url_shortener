const fastify = require("fastify")();
import {
  FastifyRequest,
  FastifyReply,
  RouteGenericInterface,
  FastifyInstance,
} from "fastify";
import { User } from "../../models/user";
import { hash } from "bcrypt";

interface RegisterBody {
  email: string;
  password: string;
  username: string;
  rank?: string; // Optional rank field
}
fastify.post(
  "/register-user",
  {
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      // Ensure only authenticated users with rank can register others
      try {
        await request.jwtVerify();

        // Fetch the requester
        const user = request.user as { email: string };
        const requester = await User.findByemail(user.email);

        if (!requester || requester.rank !== "super_admin") {
          return reply
            .status(403)
            .send({ message: "Only super_admin can register new users." });
        }
      } catch (err) {
        console.error("Authentication error:", err);
        return reply.status(401).send({ message: "Unauthorized" });
      }
    },
  },
  async (
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply
  ) => {
    const { email, password, username, rank } = request.body;
    try {
      // Prevent creation of super_admin by non-super_admin
      if (rank && rank === "super_admin") {
        return reply
          .status(403)
          .send({ message: "Cannot create super_admin accounts." });
      }

      const hashedPassword = await hash(password, 10);
      const newUser = await User.create({
        email,
        username,
        password: hashedPassword,
        rank: rank || "admin",
      });

      reply.status(201).send({
        message: "User registered successfully",
        user: {
          email,
          username,
          rank: rank || "admin",
        },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      reply.status(500).send({ message: "Internal server error" });
    }
  }
);

module.exports = fastify;
