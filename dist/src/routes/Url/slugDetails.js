"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const urlModel_1 = __importDefault(require("../../models/urlModel"));
const httpStatus_1 = require("../../utils/httpStatus");
/**
 * DETAILS ROUTE
 * Fetches details of a URL associated with a given slug.
 */
async function routes(fastify) {
    const Url = (0, urlModel_1.default)(fastify.pg);
    fastify.get("/details/:slug", async (request, reply) => {
        const { slug } = request.params;
        // Validate the presence of the slug parameter
        if (!slug) {
            return reply.status(httpStatus_1.HttpStatus.BAD_REQUEST).send({
                error: "Slug is required",
                message: "Slug is required to fetch details.",
            });
        }
        try {
            // Fetch the slug data from the database
            const urlData = await Url.findBySlug(slug);
            if (!urlData) {
                return reply.status(httpStatus_1.HttpStatus.NOT_FOUND).send({
                    error: "Slug not found.",
                    message: `"${slug}" is not attached to any url in the system`,
                });
            }
            // Check if the URL has expired
            if (new Date() > new Date(urlData.expires_at)) {
                return reply.status(httpStatus_1.HttpStatus.GONE).send({
                    error: "Link expired.",
                    message: `"${slug}" was only valid for 30 days`,
                });
            }
            // Respond with URL details
            reply.status(httpStatus_1.HttpStatus.OK).send({
                long_url: urlData.original_url,
                slug: urlData.slug,
                short_url: `${process.env.BASE_URL}/${urlData.slug}`,
                created_at: urlData.created_at,
                expires_at: urlData.expires_at,
                clicks: urlData.click_count,
            });
        }
        catch (error) {
            console.error("Error fetching slug details:", error);
            reply
                .status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR)
                .send({ message: "Error fetching slug details.", error });
        }
    });
}
exports.default = routes;
