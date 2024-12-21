import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteGenericInterface,
} from "fastify";
import UrlModel from "../../models/urlModel";
import { HttpStatus } from "../../utils/httpStatus";
import { getDefaultExpirationDate } from "../../utils/slugGenerator";

// Define the route parameter type
interface UpdateSlugParams {
  slug: string;
}

// Define the body type for the update request
interface UpdateSlugBody {
  original_url?: string;
  expires_at?: string;
}

// Extend RouteGenericInterface for the request
interface UpdateSlugRequest extends RouteGenericInterface {
  Params: UpdateSlugParams;
  Body: UpdateSlugBody;
}

/**
 * UPDATE SLUG ROUTE
 * Updates the long URL or expiration date associated with a given slug.
 */
async function routes(fastify: FastifyInstance) {
  const Url = UrlModel(fastify.pg);

  fastify.put(
    "/:slug",
    async (request: FastifyRequest<UpdateSlugRequest>, reply: FastifyReply) => {
      const { slug } = request.params;
      const { original_url, expires_at } = request.body;

      // Validate required parameters
      if (!slug) {
        return reply.status(HttpStatus.BAD_REQUEST).send({
          error: "Slug is required",
          message: "Slug is required to update the URL.",
        });
      }

      if (!original_url) {
        return reply.status(HttpStatus.BAD_REQUEST).send({
          error: "original_url is required.",
          message: "Enter the original_url you will like to update to",
        });
      }

      try {
        // Validate and handle slug
        if (slug) {
          const slugExist = await Url.findBySlug(slug);

          if (!slugExist) {
            return reply.status(HttpStatus.NOT_FOUND).send({
              error: "Slug not found.",
              message: `"${slug}" is not attached to any url in the system`,
            });
          }
          // Set expiration date
          const expirationDate = expires_at || getDefaultExpirationDate();
          // Update the URL in the database
          const updatedUrl = await Url.updateBySlug(slug, {
            original_url,
            expires_at: expirationDate,
          });

          // Handle case where the slug does not exist
          if (!updatedUrl) {
            return reply.status(HttpStatus.NOT_FOUND).send({
              error: "Slug not found.",
            });
          }

          // Respond with updated data
          reply.status(HttpStatus.OK).send({
            original_url: updatedUrl.original_url,
            expires_at: updatedUrl.expires_at,
          });
        }
      } catch (error) {
        reply
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send({ message: "Internal server error." });
      }
    }
  );
}

export default routes;
