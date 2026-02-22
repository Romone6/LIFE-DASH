import { computeGovernorState } from "./engine";
import { supabaseAdmin } from "../supabase";

export async function runGovernorOnce() {
  const { data: profiles } = await supabaseAdmin.from("profiles").select("user_id");
  for (const profile of profiles ?? []) {
    const state = await computeGovernorState(profile.user_id);
    await supabaseAdmin.from("governor_state").upsert({
      user_id: profile.user_id,
      burnout_score: state.burnout_score,
      injury_score: state.injury_score,
      cognitive_score: state.cognitive_score,
      zone: state.zone,
      intervention_active: state.zone !== "STABLE",
      last_updated: new Date().toISOString()
    }, { onConflict: "user_id" });
  }
}

export function startGovernorScheduler() {
  const oneDay = 24 * 60 * 60 * 1000;
  runGovernorOnce().catch(() => undefined);
  setInterval(() => {
    runGovernorOnce().catch(() => undefined);
  }, oneDay);
}
