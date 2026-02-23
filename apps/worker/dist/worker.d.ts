export type TwinJob = {
    id: string;
    status: string;
    created_at?: string | null;
    photo_set_id?: string | null;
};
export declare const selectNextPendingJob: (jobs: TwinJob[]) => TwinJob | null;
