import { describe, expect, it } from "vitest";
import { selectNextPendingJob } from "../src/worker";

describe("worker selection", () => {
  it("picks earliest pending job", () => {
    const jobs = [
      { id: "job-1", status: "PROCESSING", created_at: "2026-02-22T10:00:00Z" },
      { id: "job-2", status: "PENDING", created_at: "2026-02-22T09:00:00Z" },
      { id: "job-3", status: "PENDING", created_at: "2026-02-22T11:00:00Z" }
    ];
    expect(selectNextPendingJob(jobs)?.id).toBe("job-2");
  });
});
