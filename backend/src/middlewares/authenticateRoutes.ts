import fastify, { FastifyInstance } from "fastify";

function authenticateRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRequest", async (request, reply) => {
    // Skip authentication for specific routes
    if (
      request.url === "/:slug" ||
      request.url === "/api/v1/register-user" ||
      request.url === "/api/v1/shorten" ||
      request.url === "/api/v1/login-user"
    ) {
      return;
    }

    // Verify JWT token for all other routes
    try {
      await request.jwtVerify();
    } catch (err: any) {
      reply.status(401).send({ error: "Unauthorized", message: err.message });
    }
  });
}
export default authenticateRoutes;
