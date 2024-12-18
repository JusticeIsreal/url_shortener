import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteGenericInterface,
} from "fastify";
import UrlModel from "../../models/urlModel";
import { HttpStatus } from "../../utils/httpStatus";

// Types for route parameters
interface DetailsOfSlugParams {
  slug: string;
}

interface DetailsOfSlugRequest extends RouteGenericInterface {
  Params: DetailsOfSlugParams;
}

/**
 * DETAILS ROUTE
 * Fetches details of a URL associated with a given slug.
 */
async function routes(fastify: FastifyInstance) {
  const Url = UrlModel(fastify.pg);

  fastify.get(
    "/details/:slug",
    async (
      request: FastifyRequest<DetailsOfSlugRequest>,
      reply: FastifyReply
    ) => {
      const { slug } = request.params;

      // Validate the presence of the slug parameter
      if (!slug) {
        return reply.status(HttpStatus.BAD_REQUEST).send({
          error: "Slug is required",
          message: "Slug is required to fetch details.",
        });
      }

      try {
        // Fetch the slug data from the database
        const urlData = await Url.findBySlug(slug);
        if (!urlData) {
          return reply.status(HttpStatus.NOT_FOUND).send({
            error: "Slug not found.",
            message: `"${slug}" is not attached to any url in the system`,
          });
        }

        // Check if the URL has expired
        if (new Date() > new Date(urlData.expires_at)) {
          return reply.status(HttpStatus.GONE).send({
            error: "Link expired.",
            message: `"${slug}" was only valid for 30 days`,
          });
        }

        // Respond with URL details
        reply.status(HttpStatus.OK).send({
          long_url: urlData.original_url,
          slug: urlData.slug,
          short_url: `${process.env.BASE_URL}/${urlData.slug}`,
          created_at: urlData.created_at,
          expires_at: urlData.expires_at,
          clicks: urlData.click_count,
        });
      } catch (error) {
        console.error("Error fetching slug details:", error);
        reply
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send({ message: "Error fetching slug details.", error });
      }
    }
  );
}

export default routes;
