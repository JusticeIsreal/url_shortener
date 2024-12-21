import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteGenericInterface,
} from "fastify";
import UrlModel from "../../models/urlModel";
import { HttpStatus } from "../../utils/httpStatus"; // Assuming HttpStatus is available here

// Define the route parameter type
interface DeleteSlugParams {
  slug: string;
}

// Extend RouteGenericInterface for the request
interface DeleteSlugRequest extends RouteGenericInterface {
  Params: DeleteSlugParams;
}

/**
 * DELETE SLUG ROUTE
 * Deletes the shortened URL associated with the given slug.
 */
async function routes(fastify: FastifyInstance) {
  const Url = UrlModel(fastify.pg);

  fastify.delete(
    "/:slug",
    async (request: FastifyRequest<DeleteSlugRequest>, reply: FastifyReply) => {
      const { slug } = request.params;

      // Validate required parameters
      if (!slug) {
        return reply.status(HttpStatus.BAD_REQUEST).send({
          error: "Slug is required to delete a URL.",
          message: "Please provide a valid slug.",
        });
      }

      try {
        // Attempt to delete the slug from the database
        const deletedUrl = await Url.deleteBySlug(slug);

        // Handle case where the slug does not exist
        if (!deletedUrl) {
          return reply
            .status(HttpStatus.NOT_FOUND)
            .send({ error: "Slug not found." });
        }

        // Respond with success message
        reply
          .status(HttpStatus.OK)
          .send({
            message: "Shortened URL deleted successfully.",
            data: deletedUrl,
          });
      } catch (error) {
        console.error("Error deleting URL:", error);
        reply
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send({ message: "Internal server error." });
      }
    }
  );
}

export default routes;
