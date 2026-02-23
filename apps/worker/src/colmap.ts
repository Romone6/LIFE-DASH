export type ColmapCommand = {
  cmd: string;
  args: string[];
};

type ColmapPaths = {
  workspaceDir: string;
  imageDir: string;
  dbPath: string;
  sparseDir: string;
  denseDir: string;
};

export const buildColmapCommands = (paths: ColmapPaths): ColmapCommand[] => {
  return [
    {
      cmd: "colmap",
      args: [
        "feature_extractor",
        "--database_path",
        paths.dbPath,
        "--image_path",
        paths.imageDir
      ]
    },
    {
      cmd: "colmap",
      args: [
        "exhaustive_matcher",
        "--database_path",
        paths.dbPath
      ]
    },
    {
      cmd: "colmap",
      args: [
        "mapper",
        "--database_path",
        paths.dbPath,
        "--image_path",
        paths.imageDir,
        "--output_path",
        paths.sparseDir
      ]
    },
    {
      cmd: "colmap",
      args: [
        "image_undistorter",
        "--image_path",
        paths.imageDir,
        "--input_path",
        `${paths.sparseDir}/0`,
        "--output_path",
        paths.denseDir
      ]
    },
    {
      cmd: "colmap",
      args: [
        "patch_match_stereo",
        "--workspace_path",
        paths.denseDir
      ]
    },
    {
      cmd: "colmap",
      args: [
        "stereo_fusion",
        "--workspace_path",
        paths.denseDir,
        "--output_path",
        `${paths.denseDir}/fused.ply`
      ]
    },
    {
      cmd: "colmap",
      args: [
        "model_converter",
        "--input_path",
        `${paths.denseDir}/sparse`,
        "--output_path",
        `${paths.denseDir}/sparse.ply`,
        "--output_type",
        "PLY"
      ]
    }
  ];
};
