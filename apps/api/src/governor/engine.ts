import { subDays } from "date-fns";
import { supabaseAdmin } from "../supabase.js";

export type GovernorState = {
  burnout_score: number;
  injury_score: number;
  cognitive_score: number;
  zone: string;
};

const clamp = (n: number) => Math.max(0, Math.min(100, n));

function zoneFromScores(burnout: number, injury: number, cognitive: number) {
  const maxScore = Math.max(burnout, injury, cognitive);
  if (maxScore >= 86) return "CRITICAL";
  if (maxScore >= 66) return "HIGH";
  if (maxScore >= 41) return "ELEVATED";
  return "STABLE";
}

export async function computeGovernorState(userId: string): Promise<GovernorState> {
  const since = subDays(new Date(), 7).toISOString();

  const { data: signals } = await supabaseAdmin
    .from("signal_snapshots")
    .select("snapshot")
    .eq("user_id", userId)
    .gte("created_at", since);

  const { data: plans } = await supabaseAdmin
    .from("plans")
    .select("plan_json")
    .eq("user_id", userId)
    .gte("created_at", since);

  const sleepMinutes = (signals ?? [])
    .map((s: any) => s.snapshot?.sleep?.durationMinutes)
    .filter((v: any) => typeof v === "number") as number[];

  const avgSleep = sleepMinutes.length
    ? sleepMinutes.reduce((a, b) => a + b, 0) / sleepMinutes.length
    : 0;

  const deepWorkBlocks = (plans ?? []).flatMap((p: any) =>
    (p.plan_json?.blocks ?? []).filter((b: any) => b.type === "deep_work")
  );

  const highEffortBlocks = (plans ?? []).flatMap((p: any) =>
    (p.plan_json?.blocks ?? []).filter(
      (b: any) => b.intensity === "high" || b.type === "training"
    )
  );

  const sleepDeficit = avgSleep > 0 ? clamp((480 - avgSleep) / 4) : 20;
  const deepWorkDensity = clamp(deepWorkBlocks.length * 4);
  const workloadDensity = clamp(highEffortBlocks.length * 3);

  const burnoutScore = clamp(sleepDeficit + deepWorkDensity);
  const injuryScore = clamp(workloadDensity + Math.max(0, 60 - avgSleep) / 2);
  const cognitiveScore = clamp(deepWorkDensity + workloadDensity / 2);

  return {
    burnout_score: burnoutScore,
    injury_score: injuryScore,
    cognitive_score: cognitiveScore,
    zone: zoneFromScores(burnoutScore, injuryScore, cognitiveScore)
  };
}
