import { describe, expect, it } from "vitest";
import { buildTwinPhotoRecords, allPhotosUploaded } from "../src/twin/logic";

describe("twin logic", () => {
  it("builds storage paths for required angles", () => {
    const records = buildTwinPhotoRecords("user-1", "set-1");
    expect(records.length).toBe(4);
    expect(records[0].storage_path).toContain("user-1/set-1");
  });

  it("detects if all photos are uploaded", () => {
    expect(allPhotosUploaded([{ uploaded_at: null }])).toBe(false);
    expect(allPhotosUploaded([{ uploaded_at: "2026-02-23T00:00:00Z" }])).toBe(true);
  });
});
