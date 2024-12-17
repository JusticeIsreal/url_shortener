import fastify, { FastifyInstance } from "fastify";
import { FastifyRequest, FastifyReply, RouteGenericInterface } from "fastify";
import UrlModel  from "../models/urlModel";

// Define the route parameter type
interface UpdateSlugParams {
  slug: string;
}

// Define the body type for the update request
interface UpdateSlugBody {
  long_url?: string;
  expires_at?: string;
}

// Extend RouteGenericInterface for the request
interface UpdateSlugRequest extends RouteGenericInterface {
  Params: UpdateSlugParams;
  Body: UpdateSlugBody;
}


async function routes (fastify: FastifyInstance) {
  const Url = UrlModel(fastify.pg)
 fastify.put(
  "/:slug",
  async (request: FastifyRequest<UpdateSlugRequest>, reply: FastifyReply) => {
    const { slug } = request.params;
    const { long_url: original_url, expires_at } = request.body;
    
    if (!slug || !original_url || !expires_at) {
      return reply.status(404).send({ error: `Enter slug dto get a redirect` });
    }
    try {
      const updatedUrl = await Url.updateBySlug(slug, {
        original_url,
        expires_at,
      });

      if (!updatedUrl) {
        return reply.status(404).send({ message: "Slug not found" });
      }

      reply.status(200).send({
        long_url: updatedUrl.long_url,
        expires_at: updatedUrl.expires_at,
      });
    } catch (error) {
      console.error("Error updating URL:", error);
      reply.status(500).send({ message: "Internal server error" });
    }
  }
);
}



export default routes;
