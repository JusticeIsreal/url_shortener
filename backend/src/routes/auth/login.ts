import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcrypt";

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
          description: "Password (minimum 8 characters).",
        },
      },
    },
  };

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
        const query = `SELECT * FROM users WHERE email = $1`;
        const { rows } = await fastify.pg.query(query, [email]);

        // Check if user exists
        if (rows?.length === 0) {
          return reply
            .status(401)
            .send({ message: "Invalid email or password." });
        }

        const user = rows[0];

        // Compare provided password with hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return reply
            .status(401)
            .send({ message: "Invalid email or password." });
        }

        // Generate JWT token with expiry
        const token = fastify.jwt.sign(
          {
            id: user.id,
            username: user.username,
            rank: user.rank,
          },
          { expiresIn: "1h" } // Token expires in 1 hour
        );

        // Send response with sanitized user details and token
        reply.status(200).send({
          message: "Login successful.",
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            rank: user.rank,
          },
        });
      } catch (error) {
        // Log the error for debugging
        console.error("Error during login:", error);

        // Send sanitized error response
        reply.status(500).send({
          message: "Internal server error. Please try again later.",
          error,
        });
      }
    }
  );
}

export default routes;
