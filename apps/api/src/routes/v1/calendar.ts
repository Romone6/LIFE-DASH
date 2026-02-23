import type { FastifyPluginAsync } from "fastify";
import { supabaseAdmin } from "../../supabase.js";
import { buildAuthUrl, exchangeCode, decryptRefreshToken, encryptRefreshToken, refreshToken } from "../../calendar/google.js";
import { blockHash, buildEvent, createEvent, deleteEvent, diffBlocks, listCalendars, updateEvent } from "../../calendar/sync.js";

const calendarRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/v1/calendar/connect", async (request, reply) => {
    const userId = request.userId as string;
    const url = buildAuthUrl(userId);
    reply.redirect(url);
  });

  fastify.get("/v1/calendar/oauth/callback", async (request) => {
    const { code, state } = request.query as { code: string; state: string };
    if (!code || !state) {
      return fastify.httpErrors.badRequest("Missing code or state");
    }

    const token = await exchangeCode(code);
    if (!token.refresh_token) {
      return fastify.httpErrors.badRequest("Missing refresh token");
    }

    const encrypted = encryptRefreshToken(token.refresh_token);
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ google_refresh_token: encrypted })
      .eq("user_id", state);

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { status: "ok" };
  });

  fastify.get("/v1/calendar/list", async (request) => {
    const userId = request.userId as string;
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("google_refresh_token")
      .eq("user_id", userId)
      .single();

    if (!profile?.google_refresh_token) {
      return fastify.httpErrors.badRequest("No connected Google account");
    }

    const access = await refreshToken(decryptRefreshToken(profile.google_refresh_token));
    const calendars = await listCalendars(access.access_token);
    return calendars;
  });

  fastify.post("/v1/calendar/select", async (request) => {
    const userId = request.userId as string;
    const body = request.body as { calendar_id: string };
    if (!body?.calendar_id) {
      return fastify.httpErrors.badRequest("Missing calendar_id");
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ google_calendar_id: body.calendar_id })
      .eq("user_id", userId);

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { status: "ok" };
  });

  fastify.get("/v1/calendar/:plan_id/status", async (request) => {
    const userId = request.userId as string;
    const planId = (request.params as { plan_id: string }).plan_id;

    const { data, error } = await supabaseAdmin
      .from("calendar_syncs")
      .select("*")
      .eq("plan_id", planId)
      .single();

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    const { data: plan } = await supabaseAdmin
      .from("plans")
      .select("user_id")
      .eq("id", planId)
      .single();

    if (plan?.user_id !== userId) {
      return fastify.httpErrors.unauthorized("Unauthorized");
    }

    return { status: data };
  });

  fastify.post("/v1/calendar/:plan_id/sync", async (request) => {
    const userId = request.userId as string;
    const planId = (request.params as { plan_id: string }).plan_id;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("google_refresh_token, google_calendar_id")
      .eq("user_id", userId)
      .single();

    if (!profile?.google_refresh_token || !profile.google_calendar_id) {
      return fastify.httpErrors.badRequest("Google calendar not connected or selected");
    }

    const { data: plan } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("id", planId)
      .eq("user_id", userId)
      .single();

    if (!plan) {
      return fastify.httpErrors.notFound("Plan not found");
    }

    const { data: syncRow } = await supabaseAdmin
      .from("calendar_syncs")
      .select("*")
      .eq("plan_id", planId)
      .single();

    const mappings = (syncRow?.mapping ?? []) as any[];

    const access = await refreshToken(decryptRefreshToken(profile.google_refresh_token));
    const diff = diffBlocks(plan.plan_json.blocks, mappings);

    const newMappings = [...mappings];

    for (const block of diff.create) {
      const event = buildEvent(block, plan.timezone, planId);
      const created = await createEvent(access.access_token, profile.google_calendar_id, event);
      newMappings.push({
        block_id: block.block_id,
        gcal_event_id: created.id,
        last_synced_hash: blockHash(block)
      });
    }

    for (const { block, mapping } of diff.update) {
      const event = buildEvent(block, plan.timezone, planId);
      await updateEvent(access.access_token, profile.google_calendar_id, mapping.gcal_event_id, event);
      mapping.last_synced_hash = blockHash(block);
    }

    for (const mapping of diff.remove) {
      await deleteEvent(access.access_token, profile.google_calendar_id, mapping.gcal_event_id);
    }

    const { error } = await supabaseAdmin
      .from("calendar_syncs")
      .upsert({
        plan_id: planId,
        calendar_id: profile.google_calendar_id,
        mapping: newMappings,
        sync_status: "OK",
        last_sync_at: new Date().toISOString(),
        errors: []
      }, { onConflict: "plan_id" });

    if (error) {
      return fastify.httpErrors.internalServerError(error.message);
    }

    return { status: "ok" };
  });
};

export default calendarRoutes;
