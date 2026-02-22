import { supabaseAdmin } from "../supabase";
import { parseISO, startOfDay, endOfDay } from "date-fns";

export async function fetchPlannerInput(userId: string, dateLocal: string) {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (profileError) {
    throw new Error(`Profile not found for user ${userId}`);
  }

  const { data: goals } = await supabaseAdmin
    .from("goals")
    .select("*")
    .eq("user_id", userId);

  const start = startOfDay(parseISO(dateLocal));
  const end = endOfDay(parseISO(dateLocal));

  const { data: commitments } = await supabaseAdmin
    .from("commitments")
    .select("*")
    .eq("user_id", userId)
    .gte("start_at", start.toISOString())
    .lte("start_at", end.toISOString());

  return {
    profile,
    goals: goals ?? [],
    commitments: commitments ?? []
  };
}
