export const selectNextPendingJob = (jobs) => {
    const pending = jobs.filter((job) => job.status === "PENDING");
    if (pending.length === 0)
        return null;
    return pending.sort((a, b) => {
        const aTime = a.created_at ? Date.parse(a.created_at) : 0;
        const bTime = b.created_at ? Date.parse(b.created_at) : 0;
        return aTime - bTime;
    })[0];
};
