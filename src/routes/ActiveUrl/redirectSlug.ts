import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteGenericInterface,
} from "fastify";
import UrlModel from "../../models/urlModel";
import { HttpStatus } from "../../utils/httpStatus"; // Assuming HttpStatus is available here

// Define the route parameter type
interface RedirectSlugParams {
  slug: string;
}

// Extend RouteGenericInterface for the request
interface RedirectSlugRequest extends RouteGenericInterface {
  Params: RedirectSlugParams;
}

/**
 * REDIRECT SLUG ROUTE
 * Redirects to the original URL associated with the given slug.
 */
async function routes(fastify: FastifyInstance) {
  const Url = UrlModel(fastify.pg);

  fastify.get(
    "/:slug",
    async (
      request: FastifyRequest<RedirectSlugRequest>,
      reply: FastifyReply
    ) => {
      const { slug } = request.params;

      // Validate required parameters
      if (!slug) {
        return reply.status(HttpStatus.BAD_REQUEST).send({
          error: "Slug is required for redirection.",
          message: "Please provide a valid slug.",
        });
      }

      try {
        // Check if the slug exists in the database
        const urlData = await Url.findBySlug(slug);

        // Handle case where the slug does not exist
        if (!urlData) {
          return reply
            .status(HttpStatus.NOT_FOUND)
            .type("text/html")
            .sendFile("404.html");
        }

        // Handle case where the link has expired
        if (new Date() > new Date(urlData.expires_at)) {
          return reply
            .status(HttpStatus.GONE)
            .type("text/html")
            .sendFile("expired.html");
        }

        // Increment the click count
        await Url.incrementClickCount(slug);

        // Redirect to the original URL
        return reply.redirect(urlData.original_url);
      } catch (error) {
        console.error("Error during redirection:", error);
        reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          message: "Internal server error during redirection.",
          error,
        });
      }
    }
  );
}

export default routes;
