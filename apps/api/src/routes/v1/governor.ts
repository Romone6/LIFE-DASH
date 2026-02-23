import type { FastifyPluginAsync } from "fastify";
import { supabaseAdmin } from "../../supabase.js";
import { computeGovernorState } from "../../governor/engine.js";

const governorRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/v1/governor/state", async (request) => {
    const userId = request.userId as string;
    const { data } = await supabaseAdmin
      .from("governor_state")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!data) {
      const state = await computeGovernorState(userId);
      return { state };
    }

    return { state: data };
  });

  fastify.post("/v1/governor/override", async (request) => {
    const userId = request.userId as string;
    const body = request.body as { reason?: string };

    await supabaseAdmin.from("plan_events").insert({
      user_id: userId,
      plan_id: null,
      event_type: "GOVERNOR_OVERRIDE",
      payload: { reason: body?.reason ?? "user override" }
    });

    return { status: "ok" };
  });
};

export default governorRoutes;
