// routes/delete.js
const fastify = require("fastify")();
const Url = require("../models/url");
import { FastifyRequest, FastifyReply, RouteGenericInterface } from "fastify";

// types
interface DeleteSlugParams {
  slug: string;
}

interface DeleteSlugRequest extends RouteGenericInterface {
  Params: DeleteSlugParams;
}

fastify.delete(
  "/:slug",
  async (request: FastifyRequest<DeleteSlugRequest>, reply: FastifyReply) => {
    const { slug } = request.params;
    try {
      // delete route
      const deletedUrl = await Url.deleteBySlug(slug);
      if (!deletedUrl) {
        return reply.status(404).send({ error: "Slug not found." });
      }

      reply.send({ message: "Shortened URL deleted successfully." });
    } catch (error) {
      console.error("Error updating URL:", error);
      reply.status(500).send({ message: "Error in slug delete", error });
    }
  }
);

module.exports = fastify;
