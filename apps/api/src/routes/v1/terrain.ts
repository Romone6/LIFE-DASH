import type { FastifyPluginAsync } from "fastify";
import { supabaseAdmin } from "../../supabase.js";
import { computeTerrain } from "../../terrain/engine.js";

const terrainRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/v1/terrain/state", async (request) => {
    const userId = request.userId as string;
    const { data: goals } = await supabaseAdmin
      .from("goals")
      .select("*")
      .eq("user_id", userId);

    const state = computeTerrain(goals ?? []);

    await supabaseAdmin
      .from("terrain_state")
      .upsert({
        user_id: userId,
        state,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });

    return { state };
  });
};

export default terrainRoutes;
