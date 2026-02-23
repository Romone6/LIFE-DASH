import type { FastifyPluginAsync } from "fastify";
import { supabaseAdmin } from "../../supabase.js";

const healthConnectRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/v1/healthconnect/snapshots", async (request) => {
    const userId = request.userId as string;
    const body = request.body as any;

    if (!body?.dateLocal || !body?.timezone) {
      return fastify.httpErrors.badRequest("Invalid snapshot payload");
    }

    const { error } = await supabaseAdmin
      .from("signal_snapshots")
      .upsert({
        user_id: userId,
        date_local: body.dateLocal,
        timezone: body.timezone,
        snapshot: body
      }, { onConflict: "user_id,date_local" });

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { status: "ok" };
  });
};

export default healthConnectRoutes;
