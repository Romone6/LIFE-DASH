import { describe, expect, it } from "vitest";
import { runCommandSequence } from "../src/runner";

describe("runner", () => {
  it("runs commands in order", async () => {
    const calls: string[] = [];
    await runCommandSequence(
      [
        { cmd: "one", args: ["a"] },
        { cmd: "two", args: ["b"] }
      ],
      async (cmd, args) => {
        calls.push(`${cmd}:${args.join(",")}`);
      }
    );
    expect(calls).toEqual(["one:a", "two:b"]);
  });
});
