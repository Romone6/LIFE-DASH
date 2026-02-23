export type AngleValidationResult = {
  ok: boolean;
  missing: string[];
};

const REQUIRED_ANGLES = ["front", "back", "left", "right"] as const;

export const validateTwinPhotoAngles = (angles: string[]): AngleValidationResult => {
  const normalized = new Set(angles.map((angle) => angle.trim().toLowerCase()));
  const missing = REQUIRED_ANGLES.filter((angle) => !normalized.has(angle));
  return { ok: missing.length === 0, missing: [...missing] };
};

export const allPhotosUploaded = (photos: { uploaded_at: string | null }[]) => {
  return photos.length > 0 && photos.every((photo) => Boolean(photo.uploaded_at));
};
