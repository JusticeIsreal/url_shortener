"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const env_1 = __importDefault(require("@fastify/env"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const path_1 = __importDefault(require("path"));
// Import Routes
const createSlug_1 = __importDefault(require("./src/routes/Url/createSlug"));
const redirectSlug_1 = __importDefault(require("./src/routes/Url/redirectSlug"));
const slugDetails_1 = __importDefault(require("./src/routes/Url/slugDetails"));
const deleteSlug_1 = __importDefault(require("./src/routes/Url/deleteSlug"));
const updateSlug_1 = __importDefault(require("./src/routes/Url/updateSlug"));
const register_1 = __importDefault(require("./src/routes/auth/register"));
const login_1 = __importDefault(require("./src/routes/auth/login"));
const deleteUser_1 = __importDefault(require("./src/routes/auth/deleteUser"));
const authenticateRoutes_1 = __importDefault(require("./src/middlewares/authenticateRoutes"));
const static_1 = __importDefault(require("@fastify/static"));
const fastify = (0, fastify_1.default)({ logger: true });
// Environment variables schema
const schema = {
    type: "object",
    required: ["DB_URL", "PORT"],
    properties: {
        DB_URL: { type: "string" },
        PORT: { type: "string", default: "3000" },
    },
};
const options = {
    confKey: "config",
    schema,
    dotenv: true,
    data: process.env,
};
// Main start function
const start = async () => {
    try {
        // Register the environment variables plugin first
        await fastify.register(env_1.default, options);
        // Log the environment variables to ensure they are loaded
        //@ts-ignore
        // console.log("Environment Config:", fastify.config);
        // Serve static files from the "frontend" folder
        fastify.register(static_1.default, {
            root: path_1.default.join(__dirname, "./public"),
            prefix: "/", // Serve files under the root path
        });
        // Middleware registration
        fastify.register(cors_1.default, { origin: true });
        fastify.register(jwt_1.default, { secret: "your-secret-key" });
        // Database connection using fastify-postgres
        await fastify.register(require("@fastify/postgres"), {
            //@ts-ignore
            connectionString: fastify.config.DB_URL,
        });
        // Global authentication hook
        (0, authenticateRoutes_1.default)(fastify);
        // URL Routes
        fastify.register(createSlug_1.default, { prefix: "/api/v1" });
        fastify.register(redirectSlug_1.default);
        fastify.register(slugDetails_1.default, { prefix: "/api/v1" });
        fastify.register(deleteSlug_1.default, { prefix: "/api/v1" });
        fastify.register(updateSlug_1.default, { prefix: "/api/v1" });
        // Authentication Routes
        fastify.register(register_1.default, { prefix: "/api/v1" });
        fastify.register(login_1.default, { prefix: "/api/v1" });
        fastify.register(deleteUser_1.default, { prefix: "/api/v1" });
        // Start server
        await fastify.listen({
            //@ts-ignore
            port: fastify.config.PORT,
            host: "0.0.0.0",
        });
        //@ts-ignore
        console.log(`Server listening on http://localhost:${fastify.config.PORT}`);
    }
    catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};
start();
