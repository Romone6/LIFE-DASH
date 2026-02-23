import Fastify from "fastify";
import "./types.js";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import authPlugin from "./plugins/auth.js";
import healthRoutes from "./routes/health.js";
import v1Routes from "./routes/v1/index.js";

export function buildServer() {
  const server = Fastify({
    logger: true
  });

  server.register(helmet);
  server.register(cors, { origin: true });
  server.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  server.register(sensible);

  server.register(healthRoutes);
  server.register(authPlugin);
  server.register(v1Routes);

  return server;
}
