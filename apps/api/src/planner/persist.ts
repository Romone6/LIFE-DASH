import { supabaseAdmin } from "../supabase";

export async function persistPlans(userId: string, dateLocal: string, timezone: string, plans: any[]) {
  const rows = plans.map((plan) => ({
    id: plan.plan_id,
    user_id: userId,
    date_local: dateLocal,
    timezone,
    mode: plan.mode,
    schema_version: plan.schema_version,
    plan_json: plan,
    audit_status: "PENDING",
    is_active: false
  }));

  const { data, error } = await supabaseAdmin
    .from("plans")
    .upsert(rows, { onConflict: "user_id,date_local,mode" })
    .select();

  if (error) {
    throw new Error(`Failed to persist plans: ${error.message}`);
  }

  return data;
}

export async function persistAiRun(userId: string, planId: string | null, aiRun: any) {
  const { error } = await supabaseAdmin.from("ai_runs").insert({
    user_id: userId,
    plan_id: planId,
    model_id: aiRun.model_id,
    prompt_version: aiRun.prompt_version,
    input_hash: aiRun.input_hash,
    output_hash: aiRun.output_hash,
    status: aiRun.status
  });

  if (error) {
    throw new Error(`Failed to persist ai run: ${error.message}`);
  }
}
