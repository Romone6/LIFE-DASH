import { supabaseAdmin } from "../supabase";

export async function persistAuditReport(planId: string, report: any, modelId: string) {
  const { error } = await supabaseAdmin.from("audit_reports").insert({
    plan_id: planId,
    status: report.status,
    severity: report.severity,
    errors: report.errors,
    warnings: report.warnings,
    risk_register: report.risk_register,
    suggested_fixes: report.suggested_fixes,
    model_id: modelId
  });

  if (error) {
    throw new Error(`Failed to persist audit report: ${error.message}`);
  }
}

export async function updatePlanAuditStatus(planId: string, status: string, activate: boolean) {
  const { error } = await supabaseAdmin
    .from("plans")
    .update({
      audit_status: status,
      is_active: activate,
      activated_at: activate ? new Date().toISOString() : null,
      activated_by: activate ? "system" : null
    })
    .eq("id", planId);

  if (error) {
    throw new Error(`Failed to update plan audit status: ${error.message}`);
  }
}
