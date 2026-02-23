import { describe, expect, it } from "vitest";
import { buildModelRecord } from "../src/model";

describe("model record", () => {
  it("builds active model record", () => {
    const record = buildModelRecord({
      userId: "user-1",
      photoSetId: "set-1",
      paths: {
        meshHighPath: "a",
        meshLowPath: "b",
        dracoPath: "c",
        coeffsPath: "d",
        measurementsPath: "e"
      }
    });
    expect(record.user_id).toBe("user-1");
    expect(record.active_flag).toBe(true);
  });
});
