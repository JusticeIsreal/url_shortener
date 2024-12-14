const fastify = require("fastify")();
const Url = require("../models/urlModel");
const { validateSlug, generateSlug } = require("../utils/slugGenerator");
import { FastifyRequest, FastifyReply } from "fastify";

// types
interface CreateSlugRequest {
  Body: {
    long_url: string;
    slug?: string;
    expires_at?: string;
  };
}
fastify.post(
  "/shorten",
  async (request: FastifyRequest<CreateSlugRequest>, reply: FastifyReply) => {
    const { long_url, slug, expires_at } = request.body;

    try {
      let generatedSlug: string;
      if (slug) {
        // validate slug formate
        if (!validateSlug(slug)) {
          return reply.status(400).send({
            error: `${slug} "is an invalide formate"`,
            message:
              "Must be 3-12 characters long,  Must contain only alphanumeric characters and hyphens, Should not match reserved keywords admin, api, help,login, signup",
          });
        }
        //   check if slug exists
        const existingSlug = await Url.findBySlug(slug);
        if (existingSlug) {
          return reply
            .status(400)
            .send({ error: `${slug} "already exists`, message: existingSlug });
        }
        generatedSlug = slug;
      } else {
        generatedSlug = generateSlug();
      }

      const expirationDate =
        expires_at || new Date(new Date().setDate(new Date().getDate() + 30));
      const newUrl = await Url.create({
        slug: generatedSlug,
        original_url: long_url,
        expires_at: expirationDate,
      });

      reply.status(200).send({
        short_url: `${process.env.BASE_URL}/${generatedSlug}`,
        expires_at: newUrl.expires_at,
      });
    } catch (error) {
      console.error("Error updating URL:", error);
      reply.status(500).send({ message: "Error in slug create", error });
    }
  }
);

module.exports = fastify;
