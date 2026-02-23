import { REQUIRED_ANGLES } from "./pipeline.js";

type PhotoRecord = {
  photo_set_id: string;
  angle_label: string;
  storage_path: string;
};

type PhotoUpload = { uploaded_at: string | null };

export const buildTwinPhotoRecords = (userId: string, photoSetId: string): PhotoRecord[] => {
  return REQUIRED_ANGLES.map((angle) => ({
    photo_set_id: photoSetId,
    angle_label: angle,
    storage_path: `${userId}/${photoSetId}/${angle}.jpg`
  }));
};

export const allPhotosUploaded = (photos: PhotoUpload[]): boolean => {
  return photos.length > 0 && photos.every((photo) => Boolean(photo.uploaded_at));
};
