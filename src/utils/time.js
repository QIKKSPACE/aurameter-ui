export const timeAgo = (timestamp) => {
  if (!timestamp) return "";

  let date;

  // Firestore Timestamp
  if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }

  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffSeconds = Math.floor((now - date) / 1000);

  if (diffSeconds < 60) return "1m"; // less than a minute → 1 minute
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m`; // minutes
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h`; // hours
  if (diffSeconds < 2592000) return `${Math.floor(diffSeconds / 86400)}d`; // days
  if (diffSeconds < 31536000) return `${Math.floor(diffSeconds / 2592000)}mo`; // months
  return `${Math.floor(diffSeconds / 31536000)}y`; // years
};