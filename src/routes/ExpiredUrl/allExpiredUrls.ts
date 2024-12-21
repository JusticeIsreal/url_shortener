import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import UrlModel from "../../models/urlModel";
import { HttpStatus } from "../../utils/httpStatus";

async function routes(fastify: FastifyInstance) {
  const Url = UrlModel(fastify.pg);

  fastify.get(
    "/all-expiredurl",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const data = await Url.allExpiredSlug();

        // Respond with URL details
        reply.status(HttpStatus.OK).send({
          message: "success",
          data: data,
        });
      } catch (error) {
        console.error(error);
        reply.status(500).send({ error: "An unexpected error occurred." });
      }
    }
  );
}
export default routes;
