import type { FastifyPluginAsync } from "fastify";
import { supabaseAdmin } from "../../supabase.js";
import { env } from "../../config.js";

const evidenceRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/v1/evidence/create", async (request) => {
    const adminToken = request.headers["x-admin-token"];
    if (!adminToken || adminToken !== env.ADMIN_TOKEN) {
      return fastify.httpErrors.unauthorized("Admin token required");
    }

    const userId = request.userId as string;
    const body = request.body as any;

    const { error } = await supabaseAdmin.from("evidence_cards").insert({
      user_id: userId,
      title: body.title,
      domain: body.domain,
      claim: body.claim,
      population_applicability: body.population_applicability,
      study_type: body.study_type,
      effect_direction: body.effect_direction,
      certainty_level: body.certainty_level,
      risk_notes: body.risk_notes,
      source_citation: body.source_citation,
      date_added: body.date_added ?? new Date().toISOString(),
      last_reviewed: body.last_reviewed ?? new Date().toISOString()
    });

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { status: "ok" };
  });

  fastify.get("/v1/evidence", async (request) => {
    const userId = request.userId as string;
    const { data, error } = await supabaseAdmin
      .from("evidence_cards")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { evidence: data };
  });
};

export default evidenceRoutes;
