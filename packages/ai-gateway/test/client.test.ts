import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenRouterClient } from "../src";

const okResponse = {
  id: "1",
  model: "model",
  choices: [{ message: { content: "ok" } }]
};

describe("OpenRouterClient", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => okResponse
    } as any);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("uses the provided baseUrl", async () => {
    const client = new OpenRouterClient({ apiKey: "key", baseUrl: "https://example.com" });
    const res = await client.chat({ model: "m", messages: [{ role: "user", content: "hi" }] });

    expect(res.id).toBe("1");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://example.com/chat/completions",
      expect.objectContaining({ method: "POST" })
    );
  });
});
