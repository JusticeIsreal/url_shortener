import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import fastifyEnv from "@fastify/env";
import jwt from "@fastify/jwt";
import path from "path";
import Url from "./src/models/urlModel";
import fastifyStatic from "@fastify/static";
const cron = require("node-cron");
// url Routes
import shortenRoute from "./src/routes/ActiveUrl/createSlug";
import allUrl from "./src/routes/ActiveUrl/allUrl";
import redirectRoute from "./src/routes/ActiveUrl/redirectSlug";
import detailsRoute from "./src/routes/ActiveUrl/slugDetails";
import deleteRoute from "./src/routes/ActiveUrl/deleteSlug";
import updateRoute from "./src/routes/ActiveUrl/updateSlug";

// expire url routes

import purgeExpired from "./src/routes/ExpiredUrl/purgeDB";
import allExpiredUrls from "./src/routes/ExpiredUrl/allExpiredUrls";

// Auth routes
import registerAdmin from "./src/routes/auth/register";
import loginAdmin from "./src/routes/auth/login";
import deleteAdmin from "./src/routes/auth/deleteUser";

// middleware routes
import authenticateRoutes from "./src/middlewares/authenticateRoutes";
import runMigrations from "./src/db/migrations";

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

    // Database connection using fastify-postgres
    await fastify.register(require("@fastify/postgres"), {
      //@ts-ignore
      connectionString: fastify.config.DB_URL,
    });

    // Run migrations
    await runMigrations(fastify.pg.pool);

    // Run at midnight every day
    cron.schedule("0 * * * *", async () => {
      try {
        const urlModel = Url(fastify.pg);
        const archivedLinks = await urlModel.purgeExpiredLinks();
        console.log(`Archived ${archivedLinks.length} expired links.`);
      } catch (error) {
        console.error("Error archiving expired links:", error);
      }
    });

    // Serve static files from the "frontend" folder
    fastify.register(fastifyStatic, {
      root: path.join(__dirname, "./public"),
      prefix: "/", // Serve files under the root path
    });

    // Middleware registration
    fastify.register(cors, { origin: true });
    fastify.register(jwt, { secret: "your-secret-key" });

    // Global authentication hook
    authenticateRoutes(fastify);

    // URL Routes
    fastify.register(shortenRoute, { prefix: "/api/v1" });
    fastify.register(redirectRoute);
    fastify.register(detailsRoute, { prefix: "/api/v1" });
    fastify.register(deleteRoute, { prefix: "/api/v1" });
    fastify.register(updateRoute, { prefix: "/api/v1" });
    fastify.register(allUrl, { prefix: "/api/v1" });
    // Expired URL Routes
    fastify.register(purgeExpired, { prefix: "/api/v1" });
    fastify.register(allExpiredUrls, { prefix: "/api/v1" });

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
