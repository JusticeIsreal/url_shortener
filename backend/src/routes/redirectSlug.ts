import { FastifyReply, FastifyRequest, RouteGenericInterface } from "fastify";

const fastify = require("fastify");
const Url = require("../models/urlModel");

interface RedirectSlugParams {
  slug: string;
}

interface RedirectSlugRequest extends RouteGenericInterface {
  Params: RedirectSlugParams;
}
fastify.get(
  "/:slug",
  async (request: FastifyRequest<RedirectSlugRequest>, reply: FastifyReply) => {
    const { slug } = request.params;

    try {
      // check if slug value exists in database
      const urlData = await Url.findBySlug(slug);
      if (!urlData) {
        return reply.status(404).send({ error: `'${slug}' does not exit` });
      }
      if (new Date() > new Date(urlData.expires_at)) {
        return reply.status(410).send({ error: "Link expired." });
      }

      // Increase the click_count if slug value valid and avaliable
      await Url.incrementClickCount(slug);
      return reply.redirect(urlData.original_url);
    } catch (error) {
      console.error("Error updating URL:", error);
      reply.status(500).send({ message: "Error in slug redirect", error });
    }
  }
);

module.exports = fastify;
