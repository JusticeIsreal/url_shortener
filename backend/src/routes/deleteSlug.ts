// routes/delete.js
import UrlModel from "../models/urlModel"
import { FastifyRequest, FastifyReply, RouteGenericInterface, FastifyInstance } from "fastify";

// types
interface DeleteSlugParams {
  slug: string;
}

interface DeleteSlugRequest extends RouteGenericInterface {
  Params: DeleteSlugParams;
}

async function routes (fastify:FastifyInstance) {
 const Url = UrlModel(fastify.pg)
  fastify.delete(
  "/:slug",
  async (request: FastifyRequest<DeleteSlugRequest>, reply: FastifyReply) => {
    const { slug } = request.params;
    if (!slug) {
      return reply.status(400).send({
        error: `slug is required`,
        message: "Enter slug to delete a  slug",
      });
    }
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
}



export default routes;
