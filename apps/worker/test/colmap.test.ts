import { describe, expect, it } from "vitest";
import { buildColmapCommands } from "../src/colmap";

describe("colmap commands", () => {
  it("builds the expected command sequence", () => {
    const commands = buildColmapCommands({
      workspaceDir: "/tmp/work",
      imageDir: "/tmp/work/images",
      dbPath: "/tmp/work/database.db",
      sparseDir: "/tmp/work/sparse",
      denseDir: "/tmp/work/dense"
    });

    const names = commands.map((cmd) => cmd.args[0]);
    expect(names).toEqual([
      "feature_extractor",
      "exhaustive_matcher",
      "mapper",
      "image_undistorter",
      "patch_match_stereo",
      "stereo_fusion",
      "model_converter"
    ]);
  });
});
