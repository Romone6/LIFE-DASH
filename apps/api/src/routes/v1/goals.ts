import type { FastifyPluginAsync } from "fastify";
import { supabaseAdmin } from "../../supabase.js";

const goalRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/v1/goals", async (request) => {
    const userId = request.userId as string;
    const { data, error } = await supabaseAdmin
      .from("goals")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { goals: data };
  });
};

export default goalRoutes;
