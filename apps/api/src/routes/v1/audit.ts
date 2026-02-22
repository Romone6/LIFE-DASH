import type { FastifyPluginAsync } from "fastify";
import { supabaseAdmin } from "../../supabase";
import { runAudit } from "../../auditor/generator";
import { persistAuditReport, updatePlanAuditStatus } from "../../auditor/persist";

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
};

export default auditRoutes;
