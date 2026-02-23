import type { FastifyPluginAsync } from "fastify";
import { supabaseAdmin } from "../../supabase.js";

const strategicRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/v1/strategic-goals", async (request) => {
    const userId = request.userId as string;
    const body = request.body as any;

    const { error } = await supabaseAdmin.from("strategic_goals").insert({
      user_id: userId,
      title: body.title,
      category: body.category,
      time_horizon_years: body.time_horizon_years,
      success_metric: body.success_metric,
      target_value: body.target_value,
      current_value: body.current_value,
      risk_level: body.risk_level,
      confidence_score: body.confidence_score
    });

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { status: "ok" };
  });

  fastify.get("/v1/strategic-goals", async (request) => {
    const userId = request.userId as string;
    const { data, error } = await supabaseAdmin
      .from("strategic_goals")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { goals: data };
  });

  fastify.post("/v1/milestones/generate", async (request) => {
    const userId = request.userId as string;
    const body = request.body as { strategic_goal_id: string };

    const { data: goal } = await supabaseAdmin
      .from("strategic_goals")
      .select("*")
      .eq("id", body.strategic_goal_id)
      .eq("user_id", userId)
      .single();

    if (!goal) {
      return fastify.httpErrors.notFound("Goal not found");
    }

    // Minimal milestone scaffold: quarterly milestones for next 4 quarters
    const milestones = Array.from({ length: 4 }).map((_, idx) => ({
      user_id: userId,
      strategic_goal_id: goal.id,
      level: "quarterly",
      title: `${goal.title} Q${idx + 1}`
    }));

    const { error } = await supabaseAdmin.from("milestones").insert(milestones);
    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { status: "ok" };
  });
};

export default strategicRoutes;
