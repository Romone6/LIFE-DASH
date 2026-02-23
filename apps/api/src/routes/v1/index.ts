import type { FastifyPluginAsync } from "fastify";
import profileRoutes from "./profile.js";
import planRoutes from "./plans.js";
import auditRoutes from "./audit.js";
import healthConnectRoutes from "./healthconnect.js";
import calendarRoutes from "./calendar.js";
import evidenceRoutes from "./evidence.js";
import governorRoutes from "./governor.js";
import twinRoutes from "./twin.js";
import terrainRoutes from "./terrain.js";
import experimentRoutes from "./experiments.js";
import strategicRoutes from "./strategic.js";
import capitalRoutes from "./capital.js";
import goalRoutes from "./goals.js";
import capitalBucketRoutes from "./capitalBuckets.js";

const v1Routes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/v1/status", async (request) => {
    return { status: "ok", user_id: request.userId };
  });

  fastify.register(profileRoutes);
  fastify.register(planRoutes);
  fastify.register(auditRoutes);
  fastify.register(healthConnectRoutes);
  fastify.register(calendarRoutes);
  fastify.register(evidenceRoutes);
  fastify.register(governorRoutes);
  fastify.register(twinRoutes);
  fastify.register(terrainRoutes);
  fastify.register(experimentRoutes);
  fastify.register(strategicRoutes);
  fastify.register(capitalRoutes);
  fastify.register(goalRoutes);
  fastify.register(capitalBucketRoutes);
};

export default v1Routes;
