"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const urlModel_1 = __importDefault(require("../../models/urlModel"));
const httpStatus_1 = require("../../utils/httpStatus");
const slugGenerator_1 = require("../../utils/slugGenerator");
/**
 * Fastify route to shorten a long URL.
 * @param fastify FastifyInstance - Fastify app instance
 */
async function routes(fastify) {
    const Url = (0, urlModel_1.default)(fastify.pg);
    /**
     * POST /shorten
     * Create a shortened URL
     */
    fastify.post("/shorten", async (request, reply) => {
        const { original_url, slug, expires_at } = request.body;
        // Validate request body
        if (!original_url) {
            return reply.status(httpStatus_1.HttpStatus.BAD_REQUEST).send({
                error: "original_url is required",
                message: "Please provide a valid original URL to shorten.",
            });
        }
        try {
            // Check if the original URL already exists
            const existingUrl = await Url.findByLongUrl(original_url);
            if (existingUrl) {
                return reply.status(httpStatus_1.HttpStatus.CONFLICT).send({
                    error: "URL already exists",
                    message: "The provided long URL has already been shortened.",
                    data: existingUrl,
                });
            }
            let generatedSlug;
            // Validate and handle slug
            if (slug) {
                if (!(0, slugGenerator_1.validateSlug)(slug)) {
                    return reply.status(httpStatus_1.HttpStatus.BAD_REQUEST).send({
                        error: "Invalid slug format",
                        message: "Slug must be 3-12 characters long, contain only letters (a-z, A-Z) and hyphens, and avoid reserved keywords like admin, api, help, etc.",
                    });
                }
                // Handle slug collision
                generatedSlug = slug;
                let collisionCount = 0;
                while (await Url.findBySlug(generatedSlug)) {
                    collisionCount++;
                    generatedSlug = `${slug === null || slug === void 0 ? void 0 : slug.toLowerCase()}-${collisionCount}`;
                }
            }
            else {
                // Generate a random slug
                generatedSlug = (0, slugGenerator_1.generateSlug)();
            }
            // Set expiration date
            const expirationDate = expires_at || (0, slugGenerator_1.getDefaultExpirationDate)();
            // Create a new shortened URL entry
            const newUrl = await Url.create({
                slug: generatedSlug === null || generatedSlug === void 0 ? void 0 : generatedSlug.toLowerCase(),
                original_url,
                expires_at: expirationDate,
            });
            // Validate BASE_URL configuration
            if (!process.env.BASE_URL) {
                throw new Error("BASE_URL environment variable is not defined.");
            }
            // Send success response
            return reply.status(httpStatus_1.HttpStatus.OK).send({
                short_url: `${process.env.BASE_URL}/${generatedSlug}`,
                expires_at: newUrl.expires_at,
            });
        }
        catch (error) {
            // Error handling
            fastify.log.error(`Error creating shortened URL: ${error}`);
            return reply
                .status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR)
                .send({ message: "Internal server error", error: error });
        }
    });
}
exports.default = routes;
