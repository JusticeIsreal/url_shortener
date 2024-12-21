"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function authenticateRoutes(fastify) {
    fastify.addHook("onRequest", async (request, reply) => {
        // Skip authentication for specific routes
        const path = request.url;
        if (path === "/api/v1/login" || // Login route
            /^\/[^/]+$/.test(path) // Match dynamic slug route (e.g., /shora)
        ) {
            return; // Skip authentication
        }
        // Verify JWT token for all other routes
        try {
            await request.jwtVerify();
        }
        catch (err) {
            reply.status(401).send({ error: "Unauthorized", message: err.message });
        }
    });
}
exports.default = authenticateRoutes;
