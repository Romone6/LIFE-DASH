import { join } from "node:path";
export const buildWorkspacePaths = (jobId, rootDir = "/tmp") => {
    const workspaceDir = join(rootDir, "lifeos-twin", jobId);
    return {
        workspaceDir,
        imageDir: join(workspaceDir, "images"),
        sparseDir: join(workspaceDir, "sparse"),
        denseDir: join(workspaceDir, "dense"),
        dbPath: join(workspaceDir, "database.db")
    };
};
export const buildModelPaths = (userId, photoSetId) => {
    const base = `${userId}/${photoSetId}`;
    return {
        meshHighPath: `${base}/mesh_high.glb`,
        meshLowPath: `${base}/mesh_low.glb`,
        dracoPath: `${base}/mesh_low_draco.glb`,
        coeffsPath: `${base}/fit_coeffs.json`,
        measurementsPath: `${base}/measurements.json`
    };
};
