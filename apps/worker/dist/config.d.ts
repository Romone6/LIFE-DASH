export declare const parseWorkerEnv: (raw: Record<string, string | undefined>) => {
    WORKER_POLL_INTERVAL_MS: number;
    WORKER_DRY_RUN: boolean;
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    TWIN_BUCKET_PHOTOS: string;
    TWIN_BUCKET_MODELS: string;
    COLMAP_PATH?: string | undefined;
    ASSIMP_PATH?: string | undefined;
    WORKER_TMP_DIR?: string | undefined;
};
export declare const loadEnv: (raw?: Record<string, string | undefined>) => {
    WORKER_POLL_INTERVAL_MS: number;
    WORKER_DRY_RUN: boolean;
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    TWIN_BUCKET_PHOTOS: string;
    TWIN_BUCKET_MODELS: string;
    COLMAP_PATH?: string | undefined;
    ASSIMP_PATH?: string | undefined;
    WORKER_TMP_DIR?: string | undefined;
};
