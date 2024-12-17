import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import UserModel from "../../models/user";
import { hash } from "bcrypt";

async function routes(fastify: FastifyInstance) {
  // Define the JSON schema for validation
  const registerUserSchema = {
    body: {
      type: "object",
      required: ["email", "password", "username"],
      properties: {
        email: { type: "string" },
        password: { type: "string" },
        username: { type: "string" },
        rank: { type: "string" },
      },
    },
  };
    const User = UserModel(fastify.pg)

  fastify.post(
    "/register-user",
    {
      schema: registerUserSchema,
      preHandler: async (request, reply) => {
        try {
          await request.jwtVerify();

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
    async (request, reply) => {
      // Fastify now knows the type of request.body
      const { email, password, username, rank } = request.body as {
        email: string;
        password: string;
        username: string;
        rank?: string;
      };

      try {
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
          user:newUser
        });
      } catch (error) {
        console.error("Error creating user:", error);
        reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
}

export default routes;
