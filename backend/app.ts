import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import fastifyEnv from "@fastify/env";
import jwt from "@fastify/jwt";
import path from "path";
// Import Routes
import shortenRoute from "./src/routes/Url/createSlug";
import redirectRoute from "./src/routes/Url/redirectSlug";
import detailsRoute from "./src/routes/Url/slugDetails";
import deleteRoute from "./src/routes/Url/deleteSlug";
import updateRoute from "./src/routes/Url/updateSlug";
import registerAdmin from "./src/routes/auth/register";
import loginAdmin from "./src/routes/auth/login";
import deleteAdmin from "./src/routes/auth/deleteUser";
import authenticateRoutes from "./src/middlewares/authenticateRoutes";
import fastifyStatic from "@fastify/static";

const fastify = Fastify({ logger: true });

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
    await fastify.register(fastifyEnv, options);

    // Log the environment variables to ensure they are loaded
    //@ts-ignore
    // console.log("Environment Config:", fastify.config);

    // Serve static files from the "frontend" folder
    fastify.register(fastifyStatic, {
      root: path.join(__dirname, "./public"),
      prefix: "/", // Serve files under the root path
    });

    // Middleware registration
    fastify.register(cors, { origin: true });
    fastify.register(jwt, { secret: "your-secret-key" });

    // Database connection using fastify-postgres
    await fastify.register(require("@fastify/postgres"), {
      //@ts-ignore
      connectionString: fastify.config.DB_URL,
    });

    // Global authentication hook
    authenticateRoutes(fastify);

    // URL Routes
    fastify.register(shortenRoute, { prefix: "/api/v1" });
    fastify.register(redirectRoute);
    fastify.register(detailsRoute, { prefix: "/api/v1" });
    fastify.register(deleteRoute, { prefix: "/api/v1" });
    fastify.register(updateRoute, { prefix: "/api/v1" });

    // Authentication Routes
    fastify.register(registerAdmin, { prefix: "/api/v1" });
    fastify.register(loginAdmin, { prefix: "/api/v1" });
    fastify.register(deleteAdmin, { prefix: "/api/v1" });

    // Start server
    await fastify.listen({
      //@ts-ignore
      port: fastify.config.PORT,
      host: "0.0.0.0",
    });
    //@ts-ignore
    console.log(`Server listening on http://localhost:${fastify.config.PORT}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
