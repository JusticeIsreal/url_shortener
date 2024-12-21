"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const urlModel_1 = __importDefault(require("../../models/urlModel"));
const httpStatus_1 = require("../../utils/httpStatus"); // Assuming HttpStatus is available here
/**
 * DELETE SLUG ROUTE
 * Deletes the shortened URL associated with the given slug.
 */
async function routes(fastify) {
    const Url = (0, urlModel_1.default)(fastify.pg);
    fastify.delete("/:slug", async (request, reply) => {
        const { slug } = request.params;
        // Validate required parameters
        if (!slug) {
            return reply.status(httpStatus_1.HttpStatus.BAD_REQUEST).send({
                error: "Slug is required to delete a URL.",
                message: "Please provide a valid slug.",
            });
        }
        try {
            // Attempt to delete the slug from the database
            const deletedUrl = await Url.deleteBySlug(slug);
            // Handle case where the slug does not exist
            if (!deletedUrl) {
                return reply
                    .status(httpStatus_1.HttpStatus.NOT_FOUND)
                    .send({ error: "Slug not found." });
            }
            // Respond with success message
            reply
                .status(httpStatus_1.HttpStatus.OK)
                .send({
                message: "Shortened URL deleted successfully.",
                data: deletedUrl,
            });
        }
        catch (error) {
            console.error("Error deleting URL:", error);
            reply
                .status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR)
                .send({ message: "Internal server error." });
        }
    });
}
exports.default = routes;
