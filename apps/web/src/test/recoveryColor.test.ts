import { describe, expect, it } from "vitest";
import { getRecoveryColor } from "../lib/recoveryColor";

describe("recovery color", () => {
  it("returns red for immediate recovery window", () => {
    expect(getRecoveryColor(1)).toBe("#ff4f6a");
  });

  it("returns orange for low rest", () => {
    expect(getRecoveryColor(18)).toBe("#ff924f");
  });

  it("returns yellow for medium rest", () => {
    expect(getRecoveryColor(36)).toBe("#ffd84f");
  });

  it("returns light green for high rest", () => {
    expect(getRecoveryColor(60)).toBe("#a8ff7a");
  });

  it("returns green for full recovery", () => {
    expect(getRecoveryColor(96)).toBe("#4cff9a");
  });
});
