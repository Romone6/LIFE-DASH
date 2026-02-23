import type { FastifyPluginAsync } from "fastify";
import { supabaseAdmin } from "../../supabase.js";
import { validateTwinPhotoAngles } from "../../twin/pipeline.js";
import { allPhotosUploaded, buildTwinPhotoRecords } from "../../twin/logic.js";

const twinRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/v1/twin/photo-set", async (request) => {
    const userId = request.userId as string;
    const { data: photoSet, error: photoSetError } = await supabaseAdmin
      .from("twin_photo_sets")
      .insert({ user_id: userId, status: "PENDING" })
      .select("id")
      .single();

    if (photoSetError) {
      return fastify.httpErrors.internalServerError(photoSetError.message);
    }

    const photosToInsert = buildTwinPhotoRecords(userId, photoSet.id);

    const { data: photoRows, error: photoError } = await supabaseAdmin
      .from("twin_photos")
      .insert(photosToInsert)
      .select("id, angle_label, storage_path");

    if (photoError) {
      return fastify.httpErrors.internalServerError(photoError.message);
    }

    const bucket = "twin-photos";
    const photos = await Promise.all(
      (photoRows ?? []).map(async (row) => {
        const { data, error } = await supabaseAdmin.storage
          .from(bucket)
          .createSignedUploadUrl(row.storage_path, 60 * 60);
        return {
          photo_id: row.id,
          angle_label: row.angle_label,
          path: row.storage_path,
          upload_url: error ? null : data?.signedUrl ?? null
        };
      })
    );

    return { photo_set_id: photoSet.id, photos };
  });

  fastify.post("/v1/twin/photo", async (request) => {
    const body = request.body as {
      photo_id: string;
      width?: number;
      height?: number;
      checksum?: string;
    };

    if (!body?.photo_id) {
      return fastify.httpErrors.badRequest("Missing photo_id");
    }

    const { error } = await supabaseAdmin
      .from("twin_photos")
      .update({
        width: body.width ?? null,
        height: body.height ?? null,
        checksum: body.checksum ?? null,
        uploaded_at: new Date().toISOString()
      })
      .eq("id", body.photo_id);

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { status: "ok" };
  });

  fastify.post("/v1/twin/reconstruct", async (request) => {
    const userId = request.userId as string;
    const body = request.body as { photo_set_id: string };
    if (!body?.photo_set_id) {
      return fastify.httpErrors.badRequest("Missing photo_set_id");
    }

    const { data: photoSet, error: setError } = await supabaseAdmin
      .from("twin_photo_sets")
      .select("id, user_id")
      .eq("id", body.photo_set_id)
      .single();

    if (setError || !photoSet) {
      return fastify.httpErrors.notFound("Photo set not found");
    }

    if (photoSet.user_id !== userId) {
      return fastify.httpErrors.forbidden("Photo set access denied");
    }

    const { data: photos, error: photosError } = await supabaseAdmin
      .from("twin_photos")
      .select("angle_label, uploaded_at")
      .eq("photo_set_id", body.photo_set_id);

    if (photosError) {
      return fastify.httpErrors.internalServerError(photosError.message);
    }

    const angleLabels = (photos ?? []).map((photo) => photo.angle_label);
    const validation = validateTwinPhotoAngles(angleLabels);
    if (!validation.ok) {
      return fastify.httpErrors.badRequest(
        `Missing required angles: ${validation.missing.join(", ")}`
      );
    }

    if (!allPhotosUploaded(photos ?? [])) {
      return fastify.httpErrors.badRequest("All photos must be uploaded before reconstructing");
    }

    const { data: job, error: jobError } = await supabaseAdmin
      .from("twin_jobs")
      .insert({
        photo_set_id: body.photo_set_id,
        status: "PENDING",
        worker_version: "v1"
      })
      .select("id, status")
      .single();

    if (jobError) {
      return fastify.httpErrors.internalServerError(jobError.message);
    }

    await supabaseAdmin
      .from("twin_photo_sets")
      .update({ status: "PROCESSING" })
      .eq("id", body.photo_set_id);

    return { status: "queued", job };
  });

  fastify.get("/v1/twin/status", async (request) => {
    const userId = request.userId as string;
    const { photo_set_id: photoSetId, job_id: jobId } = request.query as {
      photo_set_id?: string;
      job_id?: string;
    };

    if (!photoSetId && !jobId) {
      return fastify.httpErrors.badRequest("photo_set_id or job_id required");
    }

    if (jobId) {
      const { data, error } = await supabaseAdmin
        .from("twin_jobs")
        .select("id, photo_set_id, status, started_at, ended_at, error_message")
        .eq("id", jobId)
        .single();

      if (error) {
        return fastify.httpErrors.internalServerError(error.message);
      }

      return { job: data };
    }

    const { data: photoSet, error: setError } = await supabaseAdmin
      .from("twin_photo_sets")
      .select("id, status")
      .eq("id", photoSetId as string)
      .eq("user_id", userId)
      .single();

    if (setError) {
      return fastify.httpErrors.internalServerError(setError.message);
    }

    const { data: job, error: jobError } = await supabaseAdmin
      .from("twin_jobs")
      .select("id, status, started_at, ended_at, error_message")
      .eq("photo_set_id", photoSetId as string)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (jobError) {
      return fastify.httpErrors.internalServerError(jobError.message);
    }

    return { photo_set: photoSet, job };
  });

  fastify.get("/v1/twin/model", async (request) => {
    const userId = request.userId as string;
    const { data, error } = await supabaseAdmin
      .from("twin_models")
      .select("id, mesh_high_path, mesh_low_path, draco_path, fit_coeffs, measurements_json, created_at")
      .eq("user_id", userId)
      .eq("active_flag", true)
      .maybeSingle();

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    if (!data) {
      return { model: null };
    }

    const bucket = "twin-models";
    const signed = await Promise.all(
      [data.mesh_high_path, data.mesh_low_path, data.draco_path]
        .filter(Boolean)
        .map(async (path) => {
          const { data: signedData } = await supabaseAdmin.storage
            .from(bucket)
            .createSignedUrl(path as string, 60 * 60);
          return { path, url: signedData?.signedUrl ?? null };
        })
    );

    return { model: { ...data, signed } };
  });

  fastify.post("/v1/twin/update", async (request) => {
    const userId = request.userId as string;
    const body = request.body as any;

    const { error } = await supabaseAdmin
      .from("twin_state")
      .upsert({
        user_id: userId,
        state: body,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { status: "ok" };
  });

  fastify.get("/v1/twin", async (request) => {
    const userId = request.userId as string;
    const { data, error } = await supabaseAdmin
      .from("twin_state")
      .select("state")
      .eq("user_id", userId)
      .single();

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { twin: data?.state ?? null };
  });
};

export default twinRoutes;
