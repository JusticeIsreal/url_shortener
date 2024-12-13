// routes/delete.js
const fastify = require("fastify")();
const Url = require("../models/url");

fastify.delete("/:slug", async (request, reply) => {
  const { slug } = request.params;

  const deletedUrl = await Url.deleteBySlug(slug);
  if (!deletedUrl) {
    return reply.status(404).send({ error: "Slug not found." });
  }

  reply.send({ message: `${slug} "URL deleted successfully."` });
});

module.exports = fastify;
