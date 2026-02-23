export type AngleValidationResult = {
    ok: boolean;
    missing: string[];
};
export declare const validateTwinPhotoAngles: (angles: string[]) => AngleValidationResult;
export declare const allPhotosUploaded: (photos: {
    uploaded_at: string | null;
}[]) => boolean;
