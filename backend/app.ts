import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import fastifyEnv from "@fastify/env";
import jwt from "@fastify/jwt";
   // Import Routes
    import shortenRoute from "./src/routes/createSlug";
    import redirectRoute from "./src/routes/redirectSlug";
    import detailsRoute from "./src/routes/slugDetails";
    import deleteRoute from "./src/routes/deleteSlug";
    import updateRoute from "./src/routes/updateSlug";

    import registerAdmin from "./src/plugins/auth/register";
    import loginAdmin from "./src/plugins/auth/login";
    import deleteAdmin from "./src/plugins/auth/deleteUser";
    import authenticateRoutes from "./src/middlewares/authenticateRoutes";


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
    console.log("Environment Config:", fastify.config);

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
