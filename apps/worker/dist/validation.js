const REQUIRED_ANGLES = ["front", "back", "left", "right"];
export const validateTwinPhotoAngles = (angles) => {
    const normalized = new Set(angles.map((angle) => angle.trim().toLowerCase()));
    const missing = REQUIRED_ANGLES.filter((angle) => !normalized.has(angle));
    return { ok: missing.length === 0, missing: [...missing] };
};
export const allPhotosUploaded = (photos) => {
    return photos.length > 0 && photos.every((photo) => Boolean(photo.uploaded_at));
};
