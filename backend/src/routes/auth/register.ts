import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import UserModel from "../../models/userModel";
import { hash } from "bcrypt";
import { HttpStatus } from "../../utils/httpStatus";

/**
 * Register User Route - Allows "super_admin" to register new users.
 * Restrictions: Cannot create super_admin accounts.
 */
async function routes(fastify: FastifyInstance) {
  // JSON Schema for request validation
  const registerUserSchema = {
    body: {
      type: "object",
      required: ["email", "password", "username"],
      properties: {
        email: {
          type: "string",
          format: "email",
          description: "User's email address (must be valid).",
        },
        password: {
          type: "string",
          minLength: 2,
          description: "Password (minimum 2 characters).",
        },
        username: {
          type: "string",
          minLength: 3,
          maxLength: 20,
          description: "Username (3-20 characters).",
        },
        rank: {
          type: "string",
          description: "User rank (optional, defaults to 'admin').",
        },
      },
    },
  };

  // Initialize the User model
  const User = UserModel(fastify.pg);

  /**
   * Route: POST /register-user
   * Purpose: Register a new user. Only accessible to super_admins.
   */
  fastify.post(
    "/register-user",
    {
      schema: registerUserSchema,
      preHandler: verifySuperAdmin(User),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { email, password, username, rank } = request.body as {
        email: string;
        password: string;
        username: string;
        rank?: string;
      };

      try {
        // check if user already exists in the system
        const requesteredUser = await User.findByEmail(email?.toLowerCase());
        if (requesteredUser && requesteredUser.email === email) {
          return reply.status(HttpStatus.CONFLICT).send({
            error: `User already exist.`,
            message: `User with email : ${email} already exist.`,
          });
        }

        // Prevent super_admin creation
        if (rank === "super_admin") {
          return reply.status(HttpStatus.FORBIDDEN).send({
            error: "Unauthorized.",
            message:
              "Nobody can create super_admin account, contact developer.",
          });
        }

        // Hash the user's password securely
        const hashedPassword = await hash(password, 10);

        // Create the new user with rank defaulting to "admin"
        const newUser = await User.create({
          email: email?.toLowerCase(),
          username: username?.toLowerCase(),
          password: hashedPassword,
          rank: rank || "admin",
        });

        return reply.status(HttpStatus.CREATED).send({
          message: "User registered successfully",
          user: {
            id: newUser.id,
            email: newUser.email?.toLowerCase(),
            username: newUser.username?.toLowerCase(),
            rank: newUser.rank,
          },
        });
      } catch (error) {
        reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          message: "Internal server error from registration route.",
          error,
        });
      }
    }
  );
}

/**
 * PreHandler Middleware: Verifies if the requester is a super_admin.
 */
function verifySuperAdmin(User: any) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();

      const user = request.user as { id: string };

      const requester = await User.findById(user.id);

      if (!requester || requester.rank !== "super_admin") {
        return reply.status(HttpStatus.FORBIDDEN).send({
          message: "Only super_admin can register new users.",
          requester,
        });
      }
    } catch (err) {
      return reply.status(401).send({ message: "Unauthorized access.", err });
    }
  };
}

export default routes;
