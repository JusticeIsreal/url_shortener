
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import UrlModel from "../../models/urlModel";
import { HttpStatus } from "../../utils/httpStatus";
import { generateSlug, getDefaultExpirationDate, validateSlug } from "../../utils/slugGenerator";

// Define a TypeScript interface for request body
interface CreateSlugRequest {
  Body: {
    original_url: string;
    slug?: string;
    expires_at?: string;
  };
}

/**
 * Fastify route to shorten a long URL.
 * @param fastify FastifyInstance - Fastify app instance
 */
async function routes(fastify: FastifyInstance) {
  const Url = UrlModel(fastify.pg);

  /**
   * POST /shorten
   * Create a shortened URL
   */
  fastify.post(
    "/shorten",
    async (request: FastifyRequest<CreateSlugRequest>, reply: FastifyReply) => {
      const { original_url, slug, expires_at } = request.body;

      // Validate request body
      if (!original_url) {
        return reply.status(HttpStatus.BAD_REQUEST).send({
          error: "original_url is required",
          message: "Please provide a valid original URL to shorten.",
        });
      }

      try {
        // Check if the original URL already exists
        const existingUrl = await Url.findByLongUrl(original_url);
        if (existingUrl) {
          return reply.status(HttpStatus.CONFLICT).send({
            error: "URL already exists",
            message: "The provided long URL has already been shortened.",
            data: existingUrl,
          });
        }

        let generatedSlug: string;

        // Validate and handle slug
        if (slug) {
          if (!validateSlug(slug)) {
            return reply.status(HttpStatus.BAD_REQUEST).send({
              error: "Invalid slug format",
              message:
                "Slug must be 3-12 characters long, contain only letters (a-z, A-Z) and hyphens, and avoid reserved keywords like admin, api, help, etc.",
            });
          }

          // Handle slug collision
          generatedSlug = slug;
          let collisionCount = 0;
          while (await Url.findBySlug(generatedSlug)) {
            collisionCount++;
            generatedSlug = `${slug?.toLowerCase()}-${collisionCount}`;
          }
        } else {
          // Generate a random slug
          generatedSlug = generateSlug();
        }

        // Set expiration date
        const expirationDate = expires_at || getDefaultExpirationDate();

        // Create a new shortened URL entry
        const newUrl = await Url.create({
          slug: generatedSlug?.toLowerCase(),
          original_url,
          expires_at: expirationDate,
        });

        // Validate BASE_URL configuration
        if (!process.env.BASE_URL) {
          throw new Error("BASE_URL environment variable is not defined.");
        }

        // Send success response
        return reply.status(HttpStatus.OK).send({
          short_url: `${process.env.BASE_URL}/${generatedSlug}`,
          expires_at: newUrl.expires_at,
        });
      } catch (error) {
        // Error handling
        fastify.log.error(`Error creating shortened URL: ${error}`);
        return reply
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send({ message: "Internal server error", error: error });
      }
    }
  );
}

export default routes;
