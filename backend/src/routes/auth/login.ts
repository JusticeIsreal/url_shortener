import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcrypt";
import UserModel from "../../models/userModel";
import { HttpStatus } from "../../utils/httpStatus";
/**
 * Login Route - Authenticates a user with email and password.
 * Generates a JWT token on successful login.
 */
interface LoginBody {
  email: string;
  password: string;
}

async function routes(fastify: FastifyInstance) {
  // Define JSON Schema for validation
  const loginSchema = {
    body: {
      type: "object",
      required: ["email", "password"],
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
      },
    },
  };
  // Initialize the User model
  const User = UserModel(fastify.pg);
  /**
   * Route: POST /login
   * Purpose: Authenticate user and return a JWT token.
   */
  fastify.post(
    "/login",
    {
      schema: loginSchema,
    },
    async (
      request: FastifyRequest<{ Body: LoginBody }>,
      reply: FastifyReply
    ) => {
      const { email, password } = request.body;

      try {
        // Query to fetch user by email
        const requesteredUser = await User.findByEmail(email?.toLowerCase());

        // Check if user exists
        if (!requesteredUser) {
          return reply.status(HttpStatus.UNAUTHORIZED).send({
            error: "Invalide access",
            message: `User does not exist with email: ${email}`,
          });
        }

        // Compare provided password with hashed password
        const passwordMatch = await bcrypt.compare(
          password,
          requesteredUser.password
        );
        if (!passwordMatch) {
          return reply.status(HttpStatus.UNAUTHORIZED).send({
            error: "Invalid credentails",
            message: "Invalid email or password.",
          });
        }

        // Generate JWT token with expiry
        const token = fastify.jwt.sign(
          {
            id: requesteredUser.id,
            username: requesteredUser.username,
            rank: requesteredUser.rank,
          },
          { expiresIn: "1h" } // Token expires in 1 hour
        );

        // Send response with sanitized user details and token
        reply.status(HttpStatus.OK).send({
          message: "Login successful.",
          token,
          user: {
            id: requesteredUser.id,
            username: requesteredUser.username,
            email: requesteredUser.email,
            rank: requesteredUser.rank,
          },
        });
      } catch (error) {
        // Send sanitized error response
        reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          message: "Internal server error from login route",
          error,
        });
      }
    }
  );
}

export default routes;
