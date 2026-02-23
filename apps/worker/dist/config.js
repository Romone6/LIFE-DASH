import dotenv from "dotenv";
import { z } from "zod";
dotenv.config({ path: process.env.ENV_FILE ?? ".env.local" });
const envSchema = z.object({
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    TWIN_BUCKET_PHOTOS: z.string().min(1),
    TWIN_BUCKET_MODELS: z.string().min(1),
    WORKER_POLL_INTERVAL_MS: z.string().default("5000"),
    COLMAP_PATH: z.string().optional(),
    ASSIMP_PATH: z.string().optional(),
    WORKER_TMP_DIR: z.string().optional(),
    WORKER_DRY_RUN: z.string().optional()
});
export const parseWorkerEnv = (raw) => {
    const parsed = envSchema.safeParse(raw);
    if (!parsed.success) {
        throw new Error("Invalid worker environment");
    }
    return {
        ...parsed.data,
        WORKER_POLL_INTERVAL_MS: Number(parsed.data.WORKER_POLL_INTERVAL_MS),
        WORKER_DRY_RUN: parsed.data.WORKER_DRY_RUN === "true"
    };
};
export const loadEnv = (raw = process.env) => parseWorkerEnv(raw);
