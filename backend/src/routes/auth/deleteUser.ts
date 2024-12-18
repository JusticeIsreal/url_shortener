import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import UserModel from "../../models/userModel";
import { HttpStatus } from "../../utils/httpStatus"; 

/**
 * DELETE USER ROUTE
 * Allows only super_admin to delete users.
 */
async function routes(fastify: FastifyInstance) {
  // Define JSON schema for request body validation
  const deleteUserSchema = {
    body: {
      type: "object",
      required: ["email"],
      properties: {
        email: { type: "string", format: "email" }, // Validate email format
      },
    },
  };

  // Initialize the User model with database instance
  const User = UserModel(fastify.pg);

  fastify.post(
    "/delete-user",
    {
      schema: deleteUserSchema,
      preHandler: validateDeleter(User), // Apply pre-handler middleware
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { email } = request.body as { email: string };

      try {
        // Check if the user to be deleted exists
        const userToDelete = await User.findByEmail(email);
        if (!userToDelete) {
          return reply.status(HttpStatus.NOT_FOUND).send({
            error: "User not found.",
            message: `No user with the email: ${email} is found in the system`,
          });
        }

        // Prevent deletion of super_admin accounts
        if (userToDelete.rank === "super_admin") {
          return reply
            .status(HttpStatus.FORBIDDEN)
            .send({ message: "Cannot delete super_admin accounts." });
        }

        // Perform the deletion
        await User.deleteByEmail(email);

        // Respond with success
        reply.status(HttpStatus.OK).send({
          message: "User deleted successfully",
          user: {
            email: userToDelete.email,
            rank: userToDelete.rank,
          },
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        reply
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send({ message: "Internal server error from delete user route" });
      }
    }
  );
}

/**
 * Pre-handler middleware to validate if the requester can delete users.
 * Only users with the rank of super_admin are authorized.
 */
function validateDeleter(User: any) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Authenticate the user using JWT
      await request.jwtVerify();

      // Retrieve user details from the JWT token
      const user = request.user as { id: string };

      // Fetch the requester details from the database
      const requester = await User.findById(user.id);

      // Authorization check: Only super_admin can delete users
      if (!requester || requester.rank !== "super_admin") {
        return reply.status(HttpStatus.FORBIDDEN).send({
          error: "Unauthorized",
          message: "Only super_admin can delete a user.",
        });
      }
    } catch (err) {
      return reply
        .status(HttpStatus.UNAUTHORIZED)
        .send({ message: "Unauthorized", err });
    }
  };
}

export default routes;
