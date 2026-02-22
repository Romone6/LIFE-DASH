export const planSchemaVersion = "1.0";

export const planSchema = {
  $id: "lifeos.plan",
  type: "object",
  additionalProperties: false,
  required: [
    "plan_id",
    "user_id",
    "date_local",
    "timezone",
    "schema_version",
    "mode",
    "profile_snapshot",
    "commitments",
    "blocks",
    "contingencies",
    "rationale_per_block",
    "integrity_report_stub"
  ],
  properties: {
    plan_id: { type: "string" },
    user_id: { type: "string" },
    date_local: { type: "string" },
    timezone: { type: "string" },
    schema_version: { type: "string" },
    mode: { enum: ["A", "B", "C"] },
    profile_snapshot: {
      type: "object",
      additionalProperties: false,
      required: ["sleep_window", "preferences", "non_negotiables"],
      properties: {
        sleep_window: {
          type: "object",
          additionalProperties: false,
          required: ["start", "end", "hard_flag"],
          properties: {
            start: { type: "string", format: "date-time" },
            end: { type: "string", format: "date-time" },
            hard_flag: { type: "boolean" }
          }
        },
        preferences: {
          type: "object",
          additionalProperties: true,
          required: ["aggression_level", "deep_work_preference", "meal_count"],
          properties: {
            aggression_level: { type: "string" },
            deep_work_preference: { type: "boolean" },
            meal_count: { type: "number" }
          }
        },
        non_negotiables: {
          type: "array",
          items: { type: "string" }
        }
      }
    },
    commitments: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "title", "start_at", "end_at", "hard_flag"],
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          start_at: { type: "string", format: "date-time" },
          end_at: { type: "string", format: "date-time" },
          recurrence_rule: { type: "string", nullable: true },
          hard_flag: { type: "boolean" }
        }
      }
    },
    blocks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["block_id", "title", "type", "start_at", "end_at"],
        properties: {
          block_id: { type: "string" },
          title: { type: "string" },
          type: { type: "string" },
          start_at: { type: "string", format: "date-time" },
          end_at: { type: "string", format: "date-time" },
          intensity: { type: "string" },
          confidence_level: { type: "string" },
          evidence_refs: { type: "array", items: { type: "string" } },
          experimental_flag: { type: "boolean" }
        }
      }
    },
    contingencies: {
      type: "array",
      items: { type: "object" }
    },
    rationale_per_block: {
      type: "object",
      additionalProperties: true
    },
    integrity_report_stub: {
      type: "object",
      additionalProperties: true
    }
  }
} as const;
