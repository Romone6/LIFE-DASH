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
export declare const buildColmapCommands: (paths: ColmapPaths) => ColmapCommand[];
export {};
