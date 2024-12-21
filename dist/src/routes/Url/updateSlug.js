"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const urlModel_1 = __importDefault(require("../../models/urlModel"));
const httpStatus_1 = require("../../utils/httpStatus");
const slugGenerator_1 = require("../../utils/slugGenerator");
/**
 * UPDATE SLUG ROUTE
 * Updates the long URL or expiration date associated with a given slug.
 */
async function routes(fastify) {
    const Url = (0, urlModel_1.default)(fastify.pg);
    fastify.put("/:slug", async (request, reply) => {
        const { slug } = request.params;
        const { original_url, expires_at } = request.body;
        // Validate required parameters
        if (!slug) {
            return reply.status(httpStatus_1.HttpStatus.BAD_REQUEST).send({
                error: "Slug is required",
                message: "Slug is required to update the URL.",
            });
        }
        if (!original_url) {
            return reply.status(httpStatus_1.HttpStatus.BAD_REQUEST).send({
                error: "original_url is required.",
                message: "Enter the original_url you will like to update to",
            });
        }
        try {
            // Validate and handle slug
            if (slug) {
                const slugExist = await Url.findBySlug(slug);
                if (!slugExist) {
                    return reply.status(httpStatus_1.HttpStatus.NOT_FOUND).send({
                        error: "Slug not found.",
                        message: `"${slug}" is not attached to any url in the system`,
                    });
                }
                // Set expiration date
                const expirationDate = expires_at || (0, slugGenerator_1.getDefaultExpirationDate)();
                // Update the URL in the database
                const updatedUrl = await Url.updateBySlug(slug, {
                    original_url,
                    expires_at: expirationDate,
                });
                // Handle case where the slug does not exist
                if (!updatedUrl) {
                    return reply.status(httpStatus_1.HttpStatus.NOT_FOUND).send({
                        error: "Slug not found.",
                    });
                }
                // Respond with updated data
                reply.status(httpStatus_1.HttpStatus.OK).send({
                    original_url: updatedUrl.original_url,
                    expires_at: updatedUrl.expires_at,
                });
            }
        }
        catch (error) {
            reply
                .status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR)
                .send({ message: "Internal server error." });
        }
    });
}
exports.default = routes;
