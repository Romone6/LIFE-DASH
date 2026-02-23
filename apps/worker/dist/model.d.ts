import type { buildModelPaths } from "./paths.js";
type ModelPaths = ReturnType<typeof buildModelPaths>;
type ModelRecordInput = {
    userId: string;
    photoSetId: string;
    paths: ModelPaths;
};
export declare const buildModelRecord: ({ userId, photoSetId, paths }: ModelRecordInput) => {
    user_id: string;
    photo_set_id: string;
    mesh_high_path: string;
    mesh_low_path: string;
    draco_path: string;
    fit_coeffs: null;
    measurements_json: null;
    active_flag: boolean;
};
export {};
