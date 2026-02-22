import { describe, expect, test } from "vitest";
import { checkPlanIntegrity } from "../src/planner/integrity";

const basePlan = () => ({
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
  commitments: [
    {
      id: "c1",
      title: "Standup",
      start_at: "2026-02-22T09:00:00-08:00",
      end_at: "2026-02-22T09:30:00-08:00",
      hard_flag: true
    }
  ],
  blocks: [
    {
      block_id: "b1",
      title: "Deep Work",
      type: "deep_work",
      start_at: "2026-02-22T10:00:00-08:00",
      end_at: "2026-02-22T11:00:00-08:00",
      intensity: "high"
    },
    {
      block_id: "b2",
      title: "Training",
      type: "training",
      start_at: "2026-02-22T11:10:00-08:00",
      end_at: "2026-02-22T12:00:00-08:00",
      intensity: "high"
    }
  ],
  contingencies: [],
  rationale_per_block: {},
  integrity_report_stub: {}
});

describe("checkPlanIntegrity", () => {
  test("detects overlapping blocks", () => {
    const plan = basePlan();
    plan.blocks[1].start_at = "2026-02-22T10:30:00-08:00";

    const result = checkPlanIntegrity(plan);

    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.code === "OVERLAP")).toBe(true);
  });

  test("detects sleep window violations", () => {
    const plan = basePlan();
    plan.blocks.push({
      block_id: "b3",
      title: "Late Work",
      type: "deep_work",
      start_at: "2026-02-23T00:30:00-08:00",
      end_at: "2026-02-23T01:00:00-08:00",
      intensity: "high"
    });

    const result = checkPlanIntegrity(plan);

    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.code === "SLEEP_WINDOW"))
      .toBe(true);
  });

  test("detects missing 10-minute buffers", () => {
    const plan = basePlan();
    plan.blocks[1].start_at = "2026-02-22T11:05:00-08:00";

    const result = checkPlanIntegrity(plan);

    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.code === "BUFFER"))
      .toBe(true);
  });

  test("detects deep work shorter than 30 minutes", () => {
    const plan = basePlan();
    plan.blocks[0].end_at = "2026-02-22T10:20:00-08:00";

    const result = checkPlanIntegrity(plan);

    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.code === "DEEP_WORK_MIN"))
      .toBe(true);
  });

  test("passes valid plan", () => {
    const plan = basePlan();

    const result = checkPlanIntegrity(plan);

    expect(result.ok).toBe(true);
    expect(result.violations.length).toBe(0);
  });
});
