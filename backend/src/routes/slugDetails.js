// routes/details.js
const fastify = require("fastify")();
const Url = require("../models/url");

fastify.get("/details/:slug", async (request, reply) => {
  const { slug } = request.params;

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
    short_url: process.env.BASE_URL`/${urlData.slug}`,
    created_at: urlData.created_at,
    expires_at: urlData.expires_at,
    clicks: urlData.click_count,
  });
});

module.exports = fastify;
