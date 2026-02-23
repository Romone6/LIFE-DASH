export const getRecoveryColor = (hoursSinceTraining: number): string => {
  if (hoursSinceTraining < 12) return "#ff4f6a"; // red
  if (hoursSinceTraining < 24) return "#ff924f"; // orange
  if (hoursSinceTraining < 48) return "#ffd84f"; // yellow
  if (hoursSinceTraining < 72) return "#a8ff7a"; // light green
  return "#4cff9a"; // full recovery green
};
