import { describe, expect, it } from "vitest";
import { validateTwinPhotoAngles } from "../src/twin/pipeline";

describe("twin pipeline", () => {
  it("requires front, back, left, and right angles", () => {
    const result = validateTwinPhotoAngles(["front", "back", "left"]);
    expect(result.ok).toBe(false);
    expect(result.missing).toContain("right");
  });

  it("accepts required angles", () => {
    const result = validateTwinPhotoAngles(["front", "back", "left", "right"]);
    expect(result.ok).toBe(true);
    expect(result.missing).toEqual([]);
  });
});
