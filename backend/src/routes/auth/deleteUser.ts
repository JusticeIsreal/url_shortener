import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import UserModel from "../../models/userModel";

async function routes(fastify: FastifyInstance) {
  // Define the JSON schema for validation
  const deleteUserSchema = {
    body: {
      type: "object",
      required: ["email"],
      properties: {
        email: { type: "string" },
      },
    },
  };
  const User = UserModel(fastify.pg);

  fastify.post(
    "/delete-user",
    {
      schema: deleteUserSchema, // Use the schema here
      preHandler: async (request, reply) => {
        try {
          await request.jwtVerify();

           const user = request.user as { id: string };

           const requester = await User.findById(user.id);

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
    async (request, reply) => {
      const { email } = request.body as { email: string };

      try {
        if (!email) {
          return reply
            .status(400)
            .send({ message: "Enter email of the user you want to delete." });
        }

          const user = request.user as { id: string };

          const requester = await User.findById(user.id);

        if (!requester) {
          return reply.status(404).send({ message: "User not found." });
        }

        if (requester.rank === "super_admin") {
          return reply
            .status(403)
            .send({ message: "Cannot delete super_admin accounts." });
        }

        const userDeleted = await User.deleteByEmail(email);

        reply.status(200).send({
          message: "User deleted successfully",
          user: {
            email: userDeleted.email,
            rank: userDeleted.rank,
          },
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
}

export default routes;
