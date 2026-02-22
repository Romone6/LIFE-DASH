import type { FastifyPluginAsync } from "fastify";
import { supabaseAdmin } from "../../supabase";
import { runCapitalSimulation } from "../../capital/engine";

const capitalRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/v1/capital/income", async (request) => {
    const userId = request.userId as string;
    const body = request.body as any;

    const { error } = await supabaseAdmin.from("capital_income_sources").upsert({
      id: body.source_id,
      user_id: userId,
      title: body.title,
      amount_monthly: body.amount_monthly,
      stability_score: body.stability_score,
      volatility_flag: body.volatility_flag
    });

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { status: "ok" };
  });

  fastify.post("/v1/capital/expense", async (request) => {
    const userId = request.userId as string;
    const body = request.body as any;

    const { error } = await supabaseAdmin.from("capital_expenses").upsert({
      id: body.expense_id,
      user_id: userId,
      category: body.category,
      amount_monthly: body.amount_monthly,
      fixed_flag: body.fixed_flag
    });

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { status: "ok" };
  });

  fastify.get("/v1/capital/simulation", async (request) => {
    const userId = request.userId as string;
    const { data: income } = await supabaseAdmin
      .from("capital_income_sources")
      .select("*")
      .eq("user_id", userId);

    const { data: expenses } = await supabaseAdmin
      .from("capital_expenses")
      .select("*")
      .eq("user_id", userId);

    const { data: buckets } = await supabaseAdmin
      .from("capital_buckets")
      .select("*")
      .eq("user_id", userId);

    const simulation = runCapitalSimulation({
      income: income ?? [],
      expenses: expenses ?? [],
      buckets: buckets ?? []
    });

    return { simulation };
  });
};

export default capitalRoutes;
