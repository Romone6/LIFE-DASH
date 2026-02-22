import { supabaseAdmin } from "../supabase";

export async function proposeExperiments() {
  const { data: profiles } = await supabaseAdmin.from("profiles").select("user_id");
  for (const profile of profiles ?? []) {
    const { data: active } = await supabaseAdmin
      .from("experiments")
      .select("id")
      .eq("user_id", profile.user_id)
      .in("status", ["PROPOSED", "ACTIVE"]);

    if ((active ?? []).length > 0) continue;

    await supabaseAdmin.from("experiments").insert({
      user_id: profile.user_id,
      domain: "schedule",
      hypothesis: "Shifting deep work by 30m improves success rate",
      parameter_modified: "deep_work_start_shift",
      control_window_days: 7,
      experiment_window_days: 7,
      evaluation_metric: "deep_work_success_rate",
      confidence_threshold: 0.6,
      status: "PROPOSED"
    });
  }
}

export function startExperimentScheduler() {
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  proposeExperiments().catch(() => undefined);
  setInterval(() => {
    proposeExperiments().catch(() => undefined);
  }, oneWeek);
}
