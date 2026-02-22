export const evidenceSchemaVersion = "1.0";

export const evidenceCardSchema = {
  $id: "lifeos.evidence_card",
  type: "object",
  required: [
    "evidence_id",
    "title",
    "domain",
    "claim",
    "population_applicability",
    "study_type",
    "effect_direction",
    "certainty_level",
    "risk_notes",
    "source_citation",
    "date_added",
    "last_reviewed"
  ]
} as const;
