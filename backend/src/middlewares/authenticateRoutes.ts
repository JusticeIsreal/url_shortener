import fastify, { FastifyInstance } from 'fastify'

function authenticateRoutes (fastify:FastifyInstance) {
  fastify.addHook("onRequest", async (request, reply) => {
    // Skip authentication for specific routes
    // console.log('request uyl',request.params)
    if (request.url === "/api/v1/:slug" ||request.url === "/api/v1/register-user") {
      return
    }

    // Verify JWT token for all other routes
    try {
      await request.jwtVerify()
    } catch (err:any) {
      reply.status(401).send({ error: "Unauthorized", message: err.message })
    }
  })
}
export default authenticateRoutes
