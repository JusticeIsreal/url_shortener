const fastify = require("fastify")({ logger: true });
const cors = require("fastify-cors");
const jwt = require("fastify-jwt");
const pool = require("./plugins/database/config");

const PORT = process.env.PORT || 3000;

// Import the authentication helper
const { authenticateRoutes } = require("./middlewares/authenticateRoutes");

// middleware
fastify.register(cors, { origin: true });

// JWT authentication plugin (use API keys or JWT tokens)
fastify.register(jwt, { secret: "your-secret-key" });

// url Routes
const shortenRoute = require("./routes/createSlug");
const redirectRoute = require("./routes/redirectSlug");
const detailsRoute = require("./routes/slugDetails");
const deleteRoute = require("./routes/deleteSlug");
const updateRoute = require("./routes/updateSlug");

// Auth routes
const registerAdmin = require("./plugins/auth/register");
const loginAdmin = require("./plugins/auth/login");
const deleteAdmin = require("./plugins/auth/deleteUser");

// Register the global authentication hook
authenticateRoutes(fastify);

// url Routes
fastify.register(shortenRoute, { prefix: "/api/v1" });
fastify.register(redirectRoute);
fastify.register(detailsRoute, { prefix: "/api/v1" });
fastify.register(deleteRoute, { prefix: "/api/v1" });
fastify.register(updateRoute, { prefix: "/api/v1" });

// auth
fastify.register(registerAdmin, { prefix: "/api/v1" });
fastify.register(loginAdmin, { prefix: "/api/v1" });
fastify.register(deleteAdmin, { prefix: "/api/v1" });

const start = async () => {
  try {
    fastify.listen({ port: PORT, host: "0.0.0.0" });
    // fastify.log.info("server run
    console.log("object", process.env.BASE_URL);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};
start();
