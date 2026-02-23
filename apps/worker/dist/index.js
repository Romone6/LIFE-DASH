import { createClient } from "@supabase/supabase-js";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import pino from "pino";
import { buildColmapCommands } from "./colmap.js";
import { loadEnv } from "./config.js";
import { buildModelPaths, buildWorkspacePaths } from "./paths.js";
import { runCommandSequence } from "./runner.js";
import { selectNextPendingJob } from "./worker.js";
import { buildModelRecord } from "./model.js";
import { allPhotosUploaded, validateTwinPhotoAngles } from "./validation.js";
const execFileAsync = promisify(execFile);
const logger = pino({ name: "twin-worker" });
const runCommand = async (cmd, args) => {
    logger.info({ cmd, args }, "run command");
    await execFileAsync(cmd, args);
};
const downloadPhoto = async (supabase, bucket, path, dest) => {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error || !data) {
        throw new Error(`download failed for ${path}`);
    }
    const buffer = Buffer.from(await data.arrayBuffer());
    await writeFile(dest, buffer);
};
const uploadFile = async (supabase, bucket, path, filePath) => {
    const file = await readFile(filePath);
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) {
        throw new Error(`upload failed for ${path}`);
    }
};
const processJob = async (supabase, env, job) => {
    const { data: photoRows, error: photoError } = await supabase
        .from("twin_photos")
        .select("storage_path, angle_label, uploaded_at")
        .eq("photo_set_id", job.photo_set_id);
    if (photoError || !photoRows) {
        throw new Error(photoError?.message ?? "Unable to load photos");
    }
    const photos = photoRows;
    const angleValidation = validateTwinPhotoAngles(photos.map((photo) => photo.angle_label));
    if (!angleValidation.ok) {
        throw new Error(`Missing required angles: ${angleValidation.missing.join(", ")}`);
    }
    if (!allPhotosUploaded(photos)) {
        throw new Error("All photos must be uploaded before processing");
    }
    const tmpRoot = env.WORKER_TMP_DIR ?? "/tmp";
    const workspace = buildWorkspacePaths(job.id, tmpRoot);
    const workspaceDir = workspace.workspaceDir;
    await mkdir(workspaceDir, { recursive: true });
    await mkdir(workspace.imageDir, { recursive: true });
    await mkdir(workspace.sparseDir, { recursive: true });
    await mkdir(workspace.denseDir, { recursive: true });
    for (const photo of photos) {
        const filename = `${photo.angle_label}.jpg`;
        await downloadPhoto(supabase, env.TWIN_BUCKET_PHOTOS, photo.storage_path, join(workspace.imageDir, filename));
    }
    if (env.WORKER_DRY_RUN) {
        logger.warn("Dry run enabled; skipping photogrammetry");
    }
    else {
        const commands = buildColmapCommands({
            workspaceDir: workspaceDir,
            imageDir: workspace.imageDir,
            dbPath: workspace.dbPath,
            sparseDir: workspace.sparseDir,
            denseDir: workspace.denseDir
        });
        const colmapBinary = env.COLMAP_PATH ?? "colmap";
        await runCommandSequence(commands.map((command) => ({ cmd: colmapBinary, args: command.args })), runCommand);
    }
    const fusedPly = join(workspace.denseDir, "fused.ply");
    const meshHigh = join(workspace.denseDir, "mesh_high.glb");
    const meshLow = join(workspace.denseDir, "mesh_low.glb");
    const meshDraco = join(workspace.denseDir, "mesh_low_draco.glb");
    if (!env.WORKER_DRY_RUN) {
        const assimp = env.ASSIMP_PATH ?? "assimp";
        await runCommand(assimp, ["export", fusedPly, meshHigh]);
        await runCommand("cp", [meshHigh, meshLow]);
        await runCommand("cp", [meshLow, meshDraco]);
    }
    else {
        await writeFile(meshHigh, "");
        await writeFile(meshLow, "");
        await writeFile(meshDraco, "");
    }
    const { data: photoSet } = await supabase
        .from("twin_photo_sets")
        .select("user_id")
        .eq("id", job.photo_set_id)
        .single();
    if (!photoSet?.user_id) {
        throw new Error("Photo set user not found");
    }
    const modelPaths = buildModelPaths(photoSet.user_id, job.photo_set_id);
    await uploadFile(supabase, env.TWIN_BUCKET_MODELS, modelPaths.meshHighPath, meshHigh);
    await uploadFile(supabase, env.TWIN_BUCKET_MODELS, modelPaths.meshLowPath, meshLow);
    await uploadFile(supabase, env.TWIN_BUCKET_MODELS, modelPaths.dracoPath, meshDraco);
    await supabase.from("twin_models").update({ active_flag: false }).eq("user_id", photoSet.user_id);
    await supabase.from("twin_models").insert(buildModelRecord({
        userId: photoSet.user_id,
        photoSetId: job.photo_set_id,
        paths: modelPaths
    }));
    await rm(workspaceDir, { recursive: true, force: true });
};
const runWorker = async () => {
    const env = loadEnv();
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
    });
    logger.info("Twin worker started");
    const poll = async () => {
        const { data: jobs, error } = await supabase
            .from("twin_jobs")
            .select("id, photo_set_id, status, created_at")
            .eq("status", "PENDING")
            .order("created_at", { ascending: true })
            .limit(10);
        if (error) {
            logger.error({ error }, "failed to fetch jobs");
            return;
        }
        const next = selectNextPendingJob(jobs ?? []);
        if (!next || !next.photo_set_id)
            return;
        const { data: claimed } = await supabase
            .from("twin_jobs")
            .update({ status: "PROCESSING", started_at: new Date().toISOString() })
            .eq("id", next.id)
            .eq("status", "PENDING")
            .select("id, photo_set_id")
            .maybeSingle();
        if (!claimed)
            return;
        await supabase.from("twin_photo_sets").update({ status: "PROCESSING" }).eq("id", claimed.photo_set_id);
        try {
            await processJob(supabase, env, { id: claimed.id, photo_set_id: claimed.photo_set_id });
            await supabase
                .from("twin_jobs")
                .update({ status: "DONE", ended_at: new Date().toISOString() })
                .eq("id", claimed.id);
            await supabase
                .from("twin_photo_sets")
                .update({ status: "READY" })
                .eq("id", claimed.photo_set_id);
        }
        catch (err) {
            logger.error({ err }, "job failed");
            await supabase
                .from("twin_jobs")
                .update({ status: "FAILED", ended_at: new Date().toISOString(), error_message: String(err?.message ?? err) })
                .eq("id", claimed.id);
            await supabase
                .from("twin_photo_sets")
                .update({ status: "FAILED" })
                .eq("id", claimed.photo_set_id);
        }
    };
    await poll();
    setInterval(poll, env.WORKER_POLL_INTERVAL_MS);
};
runWorker().catch((error) => {
    logger.error({ error }, "worker crashed");
    process.exit(1);
});
