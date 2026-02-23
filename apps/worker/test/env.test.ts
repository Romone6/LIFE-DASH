import { describe, expect, it } from "vitest";
import { parseWorkerEnv } from "../src/config";

describe("worker env", () => {
  it("parses required env", () => {
    const env = parseWorkerEnv({
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "key",
      TWIN_BUCKET_PHOTOS: "twin-photos",
      TWIN_BUCKET_MODELS: "twin-models",
      WORKER_POLL_INTERVAL_MS: "5000"
    });
    expect(env.WORKER_POLL_INTERVAL_MS).toBe(5000);
  });
});
