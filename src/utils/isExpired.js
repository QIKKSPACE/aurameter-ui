// utils/isExpired.js
export const isExpired = (lastFetchedAt, ttlMs = 30 * 60 * 1000) => {
  if (!lastFetchedAt) return true;
  return Date.now() - new Date(lastFetchedAt).getTime() > ttlMs;
};
