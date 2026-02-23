import { describe, it, expectTypeOf } from "vitest";
import type { PlanMode } from "../src";

describe("types", () => {
  it("exposes PlanMode union", () => {
    expectTypeOf<PlanMode>().toEqualTypeOf<"A" | "B" | "C">();
  });
});
