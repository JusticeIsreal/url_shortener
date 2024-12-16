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
  "/deleter-user",
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
            .send({ message: "Only super_admin can delete a user." });
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
    const { email } = request.body;
    try {
      if (!email) {
        return reply
          .status(401)
          .send({ message: "Enter email of the user you want to delete " });
      }
      const userFound = await User.findByemail(email);

      // Prevent creation of super_admin by non-super_admin
      if (userFound?.rank && userFound?.rank === "super_admin") {
        return reply
          .status(403)
          .send({ message: "Cannot delete super_admin accounts." });
      }

      const userDeleted = await User.deleteByEmail(email);

      reply.status(201).send({
        message: "User deleted successfully",
        user: {
          email: userDeleted.email,
          rank: userDeleted.rank,
        },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      reply.status(500).send({ message: "Internal server error" });
    }
  }
);
module.exports = fastify;
