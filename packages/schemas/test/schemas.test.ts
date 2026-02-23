import { describe, it, expect } from "vitest";
import { planSchema } from "../src/plan";
import { auditSchema } from "../src/audit";

describe("schemas", () => {
  it("exports plan schema", () => {
    expect(planSchema).toBeTruthy();
    expect((planSchema as any).type).toBe("object");
  });

  it("exports audit schema", () => {
    expect(auditSchema).toBeTruthy();
    expect((auditSchema as any).type).toBe("object");
  });
});
