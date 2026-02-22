import { differenceInDays, parseISO } from "date-fns";

export type TerrainState = {
  gridResolution: number;
  peaks: Array<{ id: string; height: number; color: string }>;
  generatedAt: string;
};

export function computeTerrain(goals: any[]): TerrainState {
  const peaks = goals.map((goal) => {
    const base = (goal.priority_weight ?? 1) * 100;
    const deadlineDays = goal.deadline_date
      ? Math.max(1, differenceInDays(parseISO(goal.deadline_date), new Date()))
      : 365;
    const multiplier = 1 / deadlineDays;
    const height = base * multiplier * 100;
    const color = height > 80 ? "crimson" : height > 40 ? "amber" : "green";
    return { id: goal.id, height, color };
  });

  return {
    gridResolution: 64,
    peaks,
    generatedAt: new Date().toISOString()
  };
}
