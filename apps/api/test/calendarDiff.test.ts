import { describe, expect, test } from "vitest";
import { diffBlocks } from "../src/calendar/sync";

describe("diffBlocks", () => {
  test("creates new blocks", () => {
    const diff = diffBlocks([{ block_id: "b1", title: "A", type: "deep_work", start_at: "s", end_at: "e" }], []);
    expect(diff.create.length).toBe(1);
    expect(diff.update.length).toBe(0);
  });
});
