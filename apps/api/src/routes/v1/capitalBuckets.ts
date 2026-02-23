import type { FastifyPluginAsync } from "fastify";
import { supabaseAdmin } from "../../supabase.js";

const capitalBucketRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/v1/capital/bucket", async (request) => {
    const userId = request.userId as string;
    const body = request.body as any;

    const { error } = await supabaseAdmin.from("capital_buckets").upsert({
      id: body.bucket_id,
      user_id: userId,
      name: body.name,
      target_amount: body.target_amount,
      current_amount: body.current_amount,
      priority_weight: body.priority_weight
    });

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { status: "ok" };
  });
};

export default capitalBucketRoutes;
