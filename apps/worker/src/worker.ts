export type TwinJob = {
  id: string;
  status: string;
  created_at?: string | null;
  photo_set_id?: string | null;
};

export const selectNextPendingJob = (jobs: TwinJob[]): TwinJob | null => {
  const pending = jobs.filter((job) => job.status === "PENDING");
  if (pending.length === 0) return null;
  return pending.sort((a, b) => {
    const aTime = a.created_at ? Date.parse(a.created_at) : 0;
    const bTime = b.created_at ? Date.parse(b.created_at) : 0;
    return aTime - bTime;
  })[0];
};
