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
    "/allurl",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Parse query parameters with defaults  
        const { page = 1, limit = 100 } = request.query as {
          page?: string;
          limit?: string;
        };

        // Ensure they are numbers
        const currentPage = parseInt(page as string, 10) || 1;
        const currentLimit = parseInt(limit as string, 10) || 100;

        const offset = (currentPage - 1) * currentLimit;

        // Fetch paginated data
        const data = await Url.paginatedUrls(offset, currentLimit);

        // Fetch total count for metadata
        const totalCount = await Url.totalCount();
        const totalPages = Math.ceil(totalCount / currentLimit);

        reply.status(HttpStatus.OK).send({
          message: "success",
          data: {
            urls: data,
            meta: {
              page: currentPage,
              limit: currentLimit,
              totalPages,
              totalCount,
            },
          },
        });
      } catch (error) {
        console.error("Error fetching paginated data:", error);
        reply.status(500).send({ error: "An unexpected error occurred." });
      }
    }
  );
}
export default routes;
