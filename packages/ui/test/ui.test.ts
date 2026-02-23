import { describe, it, expect } from "vitest";
import { uiPlaceholder } from "../src";

describe("ui package", () => {
  it("exports placeholder", () => {
    expect(uiPlaceholder).toBe(true);
  });
});
