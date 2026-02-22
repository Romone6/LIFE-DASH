import type { FastifyPluginAsync } from "fastify";
import { supabaseAdmin } from "../../supabase";

const profileRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/v1/profile/upsert", async (request) => {
    const userId = request.userId as string;
    const body = request.body as {
      profile: any;
      goals?: any[];
      commitments?: any[];
    };

    if (!body?.profile) {
      return fastify.httpErrors.badRequest("Missing profile");
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        user_id: userId,
        sleep_window: body.profile.sleep_window,
        preferences: body.profile.preferences,
        non_negotiables: body.profile.non_negotiables
      });

    if (profileError) {
      return fastify.httpErrors.internalServerError(profileError.message);
    }

    if (body.goals) {
      await supabaseAdmin.from("goals").delete().eq("user_id", userId);
      if (body.goals.length > 0) {
        const { error } = await supabaseAdmin.from("goals").insert(
          body.goals.map((goal) => ({
            id: goal.id,
            user_id: userId,
            title: goal.title,
            priority_weight: goal.priority_weight,
            deadline_date: goal.deadline_date,
            success_metric: goal.success_metric
          }))
        );
        if (error) {
          return fastify.httpErrors.internalServerError(error.message);
        }
      }
    }

    if (body.commitments) {
      await supabaseAdmin.from("commitments").delete().eq("user_id", userId);
      if (body.commitments.length > 0) {
        const { error } = await supabaseAdmin.from("commitments").insert(
          body.commitments.map((c) => ({
            id: c.id,
            user_id: userId,
            title: c.title,
            start_at: c.start_at,
            end_at: c.end_at,
            recurrence_rule: c.recurrence_rule,
            hard_flag: c.hard_flag
          }))
        );
        if (error) {
          return fastify.httpErrors.internalServerError(error.message);
        }
      }
    }

    return { status: "ok" };
  });
};

export default profileRoutes;
