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

      // Check if this is a real user visit or browser pre-fetch
      const purpose = request.headers.purpose || request.headers["sec-purpose"];
      const isPrefetch =
        purpose === "prefetch" ||
        request.headers["sec-fetch-dest"] === "prefetch";

      if (isPrefetch) {
        // Don't increment count for prefetch requests
        const urlData = await Url.findBySlug(slug);
        if (!urlData) {
          return reply
            .status(HttpStatus.NOT_FOUND)
            .type("text/html")
            .sendFile("404.html");
        }
        return reply.redirect(urlData.original_url);
      }

      // Rest of your existing code for actual visits
      try {
        const urlData = await Url.findBySlug(slug);
        if (!urlData) {
          return reply
            .status(HttpStatus.NOT_FOUND)
            .type("text/html")
            .sendFile("404.html");
        }

        if (new Date() > new Date(urlData.expires_at)) {
          return reply
            .status(HttpStatus.GONE)
            .type("text/html")
            .sendFile("expired.html");
        }

        // Only increment for actual user visits
        await Url.incrementClickCount(slug);
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
