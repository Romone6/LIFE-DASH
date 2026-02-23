export type AngleValidationResult = {
  ok: boolean;
  missing: string[];
};

export const REQUIRED_ANGLES = ["front", "back", "left", "right"] as const;

export const validateTwinPhotoAngles = (angles: string[]): AngleValidationResult => {
  const normalized = new Set(angles.map((angle) => angle.trim().toLowerCase()));
  const missing = REQUIRED_ANGLES.filter((angle) => !normalized.has(angle));
  return { ok: missing.length === 0, missing: [...missing] };
};
