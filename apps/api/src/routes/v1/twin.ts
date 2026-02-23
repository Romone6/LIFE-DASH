import type { FastifyPluginAsync } from "fastify";
import { supabaseAdmin } from "../../supabase.js";

const twinRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/v1/twin/update", async (request) => {
    const userId = request.userId as string;
    const body = request.body as any;

    const { error } = await supabaseAdmin
      .from("twin_state")
      .upsert({
        user_id: userId,
        state: body,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { status: "ok" };
  });

  fastify.get("/v1/twin", async (request) => {
    const userId = request.userId as string;
    const { data, error } = await supabaseAdmin
      .from("twin_state")
      .select("state")
      .eq("user_id", userId)
      .single();

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { twin: data?.state ?? null };
  });
};

export default twinRoutes;
