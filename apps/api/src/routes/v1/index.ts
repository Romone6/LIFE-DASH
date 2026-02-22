import type { FastifyPluginAsync } from "fastify";
import profileRoutes from "./profile";
import planRoutes from "./plans";
import auditRoutes from "./audit";
import healthConnectRoutes from "./healthconnect";
import calendarRoutes from "./calendar";
import evidenceRoutes from "./evidence";
import governorRoutes from "./governor";
import twinRoutes from "./twin";
import terrainRoutes from "./terrain";
import experimentRoutes from "./experiments";
import strategicRoutes from "./strategic";
import capitalRoutes from "./capital";

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
};

export default v1Routes;
