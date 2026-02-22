export const signalSnapshotSchemaVersion = "1.0";

export const signalSnapshotSchema = {
  $id: "lifeos.signal_snapshot",
  type: "object",
  required: [
    "snapshot_id",
    "user_id",
    "date_local",
    "timezone",
    "generated_at",
    "sleep",
    "activity",
    "nutrition",
    "provenance",
    "confidence"
  ]
} as const;
