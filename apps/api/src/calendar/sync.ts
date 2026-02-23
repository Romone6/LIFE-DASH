import { sha256 } from "../utils/hash.js";

export type Block = {
  block_id: string;
  title: string;
  type: string;
  start_at: string;
  end_at: string;
  rationale?: any;
};

export type CalendarMapping = {
  block_id: string;
  gcal_event_id: string;
  last_synced_hash: string;
};

export function blockHash(block: Block) {
  return sha256(`${block.block_id}|${block.start_at}|${block.end_at}|${block.title}`);
}

export type DiffResult = {
  create: Block[];
  update: Array<{ block: Block; mapping: CalendarMapping }>;
  remove: CalendarMapping[];
};

export function diffBlocks(blocks: Block[], mappings: CalendarMapping[]): DiffResult {
  const mappingById = new Map(mappings.map((m) => [m.block_id, m]));
  const create: Block[] = [];
  const update: Array<{ block: Block; mapping: CalendarMapping }> = [];

  for (const block of blocks) {
    const mapping = mappingById.get(block.block_id);
    if (!mapping) {
      create.push(block);
      continue;
    }

    const hash = blockHash(block);
    if (hash !== mapping.last_synced_hash) {
      update.push({ block, mapping });
    }
  }

  const blockIds = new Set(blocks.map((b) => b.block_id));
  const remove = mappings.filter((m) => !blockIds.has(m.block_id));

  return { create, update, remove };
}

export async function listCalendars(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) throw new Error("Failed to list calendars");
  return res.json();
}

export async function createEvent(
  accessToken: string,
  calendarId: string,
  event: any
) {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(event)
    }
  );
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
}

export async function updateEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  event: any
) {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(event)
    }
  );
  if (!res.ok) throw new Error("Failed to update event");
  return res.json();
}

export async function deleteEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
) {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
  if (!res.ok) throw new Error("Failed to delete event");
}

export function buildEvent(block: Block, timezone: string, planId: string) {
  return {
    summary: `[LifeOS] ${block.type}: ${block.title}`,
    description: `Plan: ${planId}\nBlock: ${block.block_id}`,
    start: { dateTime: block.start_at, timeZone: timezone },
    end: { dateTime: block.end_at, timeZone: timezone },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: reminderMinutes(block.type) }
      ]
    },
    visibility: "private"
  };
}

function reminderMinutes(type: string) {
  switch (type) {
    case "sleep":
      return 30;
    case "training":
      return 20;
    case "meal":
      return 5;
    case "deep_work":
      return 10;
    default:
      return 10;
  }
}
