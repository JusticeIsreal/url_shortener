const fastify = require("fastify");
const Url = require("../models/urlModel");

fastify.get("/:slug", async (request, reply) => {
  const { slug } = request.params;

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
});

module.exports = fastify;
