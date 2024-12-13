const fastify = require("fastify")({ logger: true });
const cors = require("fastify-cors");

const jwt = require("fastify-jwt");
const pool = require("./plugins/database/config");

const PORT = process.env.PORT || 3000;

// middleware
fastify.register(cors, { origin: true });

// routes

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
