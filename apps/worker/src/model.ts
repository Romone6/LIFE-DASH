import type { buildModelPaths } from "./paths.js";

type ModelPaths = ReturnType<typeof buildModelPaths>;

type ModelRecordInput = {
  userId: string;
  photoSetId: string;
  paths: ModelPaths;
};

export const buildModelRecord = ({ userId, photoSetId, paths }: ModelRecordInput) => {
  return {
    user_id: userId,
    photo_set_id: photoSetId,
    mesh_high_path: paths.meshHighPath,
    mesh_low_path: paths.meshLowPath,
    draco_path: paths.dracoPath,
    fit_coeffs: null,
    measurements_json: null,
    active_flag: true
  };
};
