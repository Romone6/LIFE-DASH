import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { supabaseAdmin } from "../supabase";

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("onRequest", async (request, reply) => {
    if (!request.url.startsWith("/v1")) return;

    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice("Bearer ".length).trim();
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !data.user?.id) {
        reply.code(401).send({ error: "Invalid Supabase JWT" });
        return;
      }
      request.userId = data.user.id;
      return;
    }

    const userId = request.headers["x-user-id"];
    if (!userId || Array.isArray(userId)) {
      reply.code(401).send({ error: "Missing x-user-id header" });
      return;
    }

    request.userId = userId;
  });
};

export default fp(authPlugin);
