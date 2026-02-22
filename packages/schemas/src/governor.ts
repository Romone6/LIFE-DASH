export const governorSchemaVersion = "1.0";

export const governorStateSchema = {
  $id: "lifeos.governor_state",
  type: "object",
  required: [
    "user_id",
    "burnout_score",
    "injury_score",
    "cognitive_score",
    "zone",
    "intervention_active",
    "last_updated"
  ]
} as const;
