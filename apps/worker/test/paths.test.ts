import { describe, expect, it } from "vitest";
import { buildModelPaths, buildWorkspacePaths } from "../src/paths";

describe("worker paths", () => {
  it("builds workspace paths", () => {
    const paths = buildWorkspacePaths("job-1");
    expect(paths.workspaceDir).toContain("job-1");
    expect(paths.imageDir).toContain("images");
  });

  it("builds model output paths", () => {
    const paths = buildModelPaths("user-1", "set-1");
    expect(paths.meshHighPath).toBe("user-1/set-1/mesh_high.glb");
    expect(paths.meshLowPath).toBe("user-1/set-1/mesh_low.glb");
    expect(paths.dracoPath).toBe("user-1/set-1/mesh_low_draco.glb");
  });
});
