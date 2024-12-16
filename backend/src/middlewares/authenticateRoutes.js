export async function authenticateRoutes(fastify) {
  fastify.addHook("onRequest", async (request, reply) => {
    // Skip authentication for specific routes
    if (request.routerPath === "/:slug") {
      return;
    }

    // Verify JWT token for all other routes
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: "Unauthorized", message: err.message });
    }
  });
}
