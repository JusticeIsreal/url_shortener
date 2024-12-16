// routes/details.js
const fastify = require("fastify")();
const Url = require("../models/url");
import { FastifyRequest, FastifyReply, RouteGenericInterface } from "fastify";

// types
interface DetailsOfSlugParams {
  slug: string;
}

interface DetailsOfSlugRequest extends RouteGenericInterface {
  Params: DetailsOfSlugParams;
}

fastify.get(
  "/details/:slug",
  async (
    request: FastifyRequest<DetailsOfSlugRequest>,
    reply: FastifyReply
  ) => {
    const { slug } = request.params;
    if (!slug) {
      return reply.status(404).send({ error: `Enter slug to get a details` });
    }
    try {
      // find slug data from database
      const urlData = await Url.findBySlug(slug);
      if (!urlData) {
        return reply.status(404).send({ error: "Slug not found." });
      }

      if (new Date() > new Date(urlData.expires_at)) {
        return reply.status(410).send({ error: "Link expired." });
      }

      reply.send({
        long_url: urlData.original_url,
        slug: urlData.slug,
        short_url: `${process.env.BASE_URL}/${urlData.slug}`,
        created_at: urlData.created_at,
        expires_at: urlData.expires_at,
        clicks: urlData.click_count,
      });
    } catch (error) {
      console.error("Error updating URL:", error);
      reply.status(500).send({ message: "Error in slug details", error });
    }
  }
);

module.exports = fastify;
