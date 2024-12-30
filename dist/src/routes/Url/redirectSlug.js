"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const urlModel_1 = __importDefault(require("../../models/urlModel"));
const httpStatus_1 = require("../../utils/httpStatus"); // Assuming HttpStatus is available here
/**
 * REDIRECT SLUG ROUTE
 * Redirects to the original URL associated with the given slug.
 */
async function routes(fastify) {
  const Url = (0, urlModel_1.default)(fastify.pg);
  fastify.get("/:slug", async (request, reply) => {
    const { slug } = request.params;
    // Validate required parameters
    if (!slug) {
      return reply.status(httpStatus_1.HttpStatus.BAD_REQUEST).send({
        error: "Slug is required for redirection.",
        message: "Please provide a valid slug.",
      });
    }
    // Validate required parameters
    if (slug === "index.html") {
      return reply
        .status(httpStatus_1.HttpStatus.NOT_FOUND)
        .type("text/html")
        .sendFile("index.html");
    }
    try {
      // Check if the slug exists in the database
      const urlData = await Url.findBySlug(
        slug === null || slug === void 0 ? void 0 : slug
      );
      // Handle case where the slug does not exist
      if (!urlData) {
        return reply
          .status(httpStatus_1.HttpStatus.NOT_FOUND)
          .type("text/html")
          .sendFile("404.html");
      }
      // Handle case where the link has expired
      if (new Date() > new Date(urlData.expires_at)) {
        return reply
          .status(httpStatus_1.HttpStatus.NOT_FOUND)
          .type("text/html")
          .sendFile("404.html");
      }
      // Increment the click count
      await Url.incrementClickCount(slug);
      // Redirect to the original URL
      return reply.redirect(urlData.original_url);
    } catch (error) {
      console.error("Error during redirection:", error);
      reply.status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: "Internal server error during redirection.",
        error,
      });
    }
  });
}
exports.default = routes;
