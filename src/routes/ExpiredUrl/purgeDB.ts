import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import UrlModel from "../../models/urlModel";
import { HttpStatus } from "../../utils/httpStatus";

async function routes(fastify: FastifyInstance) {
  const Url = UrlModel(fastify.pg);

  fastify.post("/admin/purge-expired", async (request, reply) => {
    try {
      const archivedLinks = await Url.purgeExpiredLinks();
      reply.status(200).send({
        message: `Archived ${archivedLinks.length} expired links.`
      });
    } catch (error) {
      console.error("Error in manual purge:", error);
      reply.status(500).send({ message: "Error purging expired links", error });
    }
  });
}
export default routes;
