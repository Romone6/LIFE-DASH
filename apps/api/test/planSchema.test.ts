import { describe, expect, test } from "vitest";
import { validatePlanJson } from "../src/planner/validator";

const minimalPlan = {
  plan_id: "plan-1",
  user_id: "user-1",
  date_local: "2026-02-22",
  timezone: "America/Los_Angeles",
  schema_version: "1.0",
  mode: "A",
  profile_snapshot: {
    sleep_window: {
      start: "2026-02-22T23:00:00-08:00",
      end: "2026-02-23T07:00:00-08:00",
      hard_flag: true
    },
    preferences: {
      aggression_level: "normal",
      deep_work_preference: true,
      meal_count: 3
    },
    non_negotiables: []
  },
  commitments: [],
  blocks: [
    {
      block_id: "b1",
      title: "Deep Work",
      type: "deep_work",
      start_at: "2026-02-22T10:00:00-08:00",
      end_at: "2026-02-22T11:00:00-08:00"
    }
  ],
  contingencies: [],
  rationale_per_block: {},
  integrity_report_stub: {}
};

describe("validatePlanJson", () => {
  test("accepts valid plan", () => {
    const result = validatePlanJson(minimalPlan);
    expect(result.valid).toBe(true);
  });

  test("rejects plan missing required fields", () => {
    const invalid = { ...minimalPlan } as any;
    delete invalid.plan_id;

    const result = validatePlanJson(invalid);
    expect(result.valid).toBe(false);
  });
});
