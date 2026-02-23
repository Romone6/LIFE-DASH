import type { FastifyPluginAsync } from "fastify";
import { supabaseAdmin } from "../../supabase.js";
import { runAudit } from "../../auditor/generator.js";
import { persistAuditReport, updatePlanAuditStatus } from "../../auditor/persist.js";

const auditRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/v1/audit/:plan_id/run", async (request) => {
    const userId = request.userId as string;
    const planId = (request.params as { plan_id: string }).plan_id;

    const { data: planRow, error } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("id", planId)
      .eq("user_id", userId)
      .single();

    if (error || !planRow) {
      return fastify.httpErrors.notFound("Plan not found");
    }

    const audit = await runAudit(planRow.plan_json);
    if (!audit.report) {
      return fastify.httpErrors.badRequest("Invalid audit output");
    }

    await persistAuditReport(planId, audit.report, audit.aiRun.model_id);
    const activate = planRow.mode === "A" && audit.report.status !== "FAIL";
    await updatePlanAuditStatus(planId, audit.report.status, activate);

    return { audit: audit.report };
  });

  fastify.get("/v1/audit/:plan_id", async (request) => {
    const userId = request.userId as string;
    const planId = (request.params as { plan_id: string }).plan_id;

    const { data, error } = await supabaseAdmin
      .from("audit_reports")
      .select("*")
      .eq("plan_id", planId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    const { data: plan } = await supabaseAdmin
      .from("plans")
      .select("user_id")
      .eq("id", planId)
      .single();

    if (plan?.user_id !== userId) {
      return fastify.httpErrors.unauthorized("Unauthorized");
    }

    return { audit: data };
  });
};

export default auditRoutes;
