export declare const buildWorkspacePaths: (jobId: string, rootDir?: string) => {
    workspaceDir: string;
    imageDir: string;
    sparseDir: string;
    denseDir: string;
    dbPath: string;
};
export declare const buildModelPaths: (userId: string, photoSetId: string) => {
    meshHighPath: string;
    meshLowPath: string;
    dracoPath: string;
    coeffsPath: string;
    measurementsPath: string;
};
