import type { FastifyPluginAsync } from "fastify";
import { fetchPlannerInput } from "../../planner/input.js";
import { generatePlans } from "../../planner/generator.js";
import { persistAiRun, persistPlans } from "../../planner/persist.js";
import { runAudit } from "../../auditor/generator.js";
import { persistAuditReport, updatePlanAuditStatus } from "../../auditor/persist.js";
import { applyEvidenceGate } from "../../planner/evidenceGate.js";
import { supabaseAdmin } from "../../supabase.js";
import { computeGovernorState } from "../../governor/engine.js";
import { generateStabilityPlan } from "../../planner/stabilityPlan.js";

const planRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/v1/plans/:date/generate", async (request) => {
    const userId = request.userId as string;
    const dateLocal = (request.params as { date: string }).date;
    const body = (request.body ?? {}) as { timezone?: string };

    const inputData = await fetchPlannerInput(userId, dateLocal);

    const governorState = await computeGovernorState(userId);

    const plannerInput = {
      user_id: userId,
      date_local: dateLocal,
      timezone: body.timezone ?? "UTC",
      profile: inputData.profile,
      goals: inputData.goals,
      commitments: inputData.commitments,
      governor_state: governorState
    };

    if (governorState.zone === "CRITICAL") {
      const base = generateStabilityPlan(plannerInput as any);
      const plans = [
        { ...base, mode: "A" },
        { ...base, mode: "B", plan_id: `${base.plan_id}-B` },
        { ...base, mode: "C", plan_id: `${base.plan_id}-C` }
      ];
      const persisted = await persistPlans(userId, dateLocal, plannerInput.timezone, plans);
      for (const plan of plans) {
        await updatePlanAuditStatus(plan.plan_id, "PASS_WITH_WARNINGS", plan.mode === "A");
      }
      return { plans: persisted, stability: true };
    }

    let lastError: string | null = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const generated = await generatePlans(plannerInput);
      if (generated.plans.length !== 3) {
        await persistAiRun(userId, null, generated.aiRun);
        lastError = "Invalid plan output";
        continue;
      }

      const { data: evidenceCards } = await supabaseAdmin
        .from("evidence_cards")
        .select("id,population_applicability,certainty_level")
        .eq("user_id", userId);

      const gatedPlans = applyEvidenceGate(
        generated.plans as any[],
        (evidenceCards ?? []) as any[]
      );

      const auditResults = [];
      let failed = false;

      for (const plan of gatedPlans) {
        if (governorState.zone === "HIGH" || governorState.zone === "CRITICAL") {
          const minutes = (plan.blocks ?? []).reduce((sum: number, block: any) => {
            const start = new Date(block.start_at).getTime();
            const end = new Date(block.end_at).getTime();
            return sum + Math.max(0, (end - start) / 60000);
          }, 0);
          const cap = governorState.zone === "HIGH" ? 12 * 60 : 8 * 60;
          if (minutes > cap) {
            failed = true;
            continue;
          }
        }

        const audit = await runAudit(plan);
        auditResults.push({ plan, audit });
        if (!audit.report) {
          failed = true;
        } else if (audit.report.status === "FAIL") {
          failed = true;
        }
      }

      if (failed) {
        await persistAiRun(userId, null, generated.aiRun);
        lastError = "Audit failed";
        continue;
      }

      const persisted = await persistPlans(userId, dateLocal, plannerInput.timezone, gatedPlans);
      await persistAiRun(userId, persisted?.[0]?.id ?? null, generated.aiRun);

      for (const { plan, audit } of auditResults) {
        if (!audit.report) continue;
        await persistAuditReport(plan.plan_id, audit.report, audit.aiRun.model_id);
        const activate = plan.mode === "A" && audit.report.status !== "FAIL";
        await updatePlanAuditStatus(plan.plan_id, audit.report.status, activate);
      }

      return { plans: persisted };
    }

    return fastify.httpErrors.badRequest(lastError ?? "Plan generation failed");
  });

  fastify.get("/v1/plans/:date", async (request) => {
    const userId = request.userId as string;
    const dateLocal = (request.params as { date: string }).date;
    const mode = (request.query as { mode?: string }).mode;

    let query = supabaseAdmin
      .from("plans")
      .select("*")
      .eq("user_id", userId)
      .eq("date_local", dateLocal);

    if (mode) {
      query = query.eq("mode", mode);
    }

    const { data, error } = await query;
    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { plans: data };
  });

  fastify.post("/v1/plans/:plan_id/events", async (request) => {
    const userId = request.userId as string;
    const planId = (request.params as { plan_id: string }).plan_id;
    const body = (request.body ?? {}) as { event_type: string; payload?: any };

    const { error } = await supabaseAdmin.from("plan_events").insert({
      plan_id: planId,
      user_id: userId,
      event_type: body.event_type,
      payload: body.payload
    });

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { status: "ok" };
  });

  fastify.post("/v1/plans/:date/mode", async (request) => {
    const userId = request.userId as string;
    const dateLocal = (request.params as { date: string }).date;
    const body = request.body as { mode: string };

    if (!body?.mode) {
      return fastify.httpErrors.badRequest("Missing mode");
    }

    await supabaseAdmin
      .from("plans")
      .update({ is_active: false })
      .eq("user_id", userId)
      .eq("date_local", dateLocal);

    const { error } = await supabaseAdmin
      .from("plans")
      .update({ is_active: true, activated_at: new Date().toISOString(), activated_by: "user" })
      .eq("user_id", userId)
      .eq("date_local", dateLocal)
      .eq("mode", body.mode);

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { status: "ok" };
  });
};

export default planRoutes;
