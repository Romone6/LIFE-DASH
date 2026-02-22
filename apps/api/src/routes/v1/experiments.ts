import type { FastifyPluginAsync } from "fastify";
import { supabaseAdmin } from "../../supabase";

const experimentRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/v1/experiments", async (request) => {
    const userId = request.userId as string;
    const { data, error } = await supabaseAdmin
      .from("experiments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { experiments: data };
  });

  fastify.post("/v1/experiments/create", async (request) => {
    const userId = request.userId as string;
    const body = request.body as any;

    const { error } = await supabaseAdmin.from("experiments").insert({
      user_id: userId,
      domain: body.domain,
      hypothesis: body.hypothesis,
      parameter_modified: body.parameter_modified,
      control_window_days: body.control_window_days ?? 7,
      experiment_window_days: body.experiment_window_days ?? 7,
      evaluation_metric: body.evaluation_metric,
      confidence_threshold: body.confidence_threshold ?? 0.6,
      status: body.status ?? "PROPOSED"
    });

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { status: "ok" };
  });

  fastify.post("/v1/experiments/abort", async (request) => {
    const userId = request.userId as string;
    const body = request.body as { experiment_id: string };

    const { error } = await supabaseAdmin
      .from("experiments")
      .update({ status: "ABORTED", ended_at: new Date().toISOString() })
      .eq("id", body.experiment_id)
      .eq("user_id", userId);

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { status: "ok" };
  });

  fastify.post("/v1/experiments/approve", async (request) => {
    const userId = request.userId as string;
    const body = request.body as { experiment_id: string };

    const { error } = await supabaseAdmin
      .from("experiments")
      .update({ status: "ACTIVE", started_at: new Date().toISOString() })
      .eq("id", body.experiment_id)
      .eq("user_id", userId);

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { status: "ok" };
  });
};

export default experimentRoutes;
