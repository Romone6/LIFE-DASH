import { describe, expect, test } from "vitest";
import { checkPlanModes, commitmentsImmutable } from "../src/planner/rules";

const commitments = [
  { id: "c1", title: "Standup", start_at: "2026-02-22T09:00:00-08:00", end_at: "2026-02-22T09:30:00-08:00", hard_flag: true }
];

describe("planner rules", () => {
  test("requires modes A/B/C", () => {
    const violations = checkPlanModes([
      { mode: "A" },
      { mode: "B" }
    ]);
    expect(violations.length).toBeGreaterThan(0);
  });

  test("commitments immutable", () => {
    const violations = commitmentsImmutable({ commitments }, commitments);
    expect(violations.length).toBe(0);

    const mutated = commitmentsImmutable({ commitments: [] }, commitments);
    expect(mutated.length).toBeGreaterThan(0);
  });
});
