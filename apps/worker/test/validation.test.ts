import { describe, expect, it } from "vitest";
import { allPhotosUploaded, validateTwinPhotoAngles } from "../src/validation";

describe("worker validation", () => {
  it("detects missing required angles", () => {
    const result = validateTwinPhotoAngles(["front", "left", "right"]);
    expect(result.ok).toBe(false);
    expect(result.missing).toContain("back");
  });

  it("verifies uploads", () => {
    expect(allPhotosUploaded([{ uploaded_at: null }])).toBe(false);
    expect(allPhotosUploaded([{ uploaded_at: "2026-02-23T00:00:00Z" }])).toBe(true);
  });
});
