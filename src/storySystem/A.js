import RNFS from "react-native-fs";

const UPLOAD_FILE_PATH = `${RNFS.DocumentDirectoryPath}/upload_queue.json`;

/**
 * Safely read the current upload queue.
 * Falls back to [] if the file is missing or corrupted.
 */
export const readUploadQueue = async () => {
  try {
    const exists = await RNFS.exists(UPLOAD_FILE_PATH);
    if (!exists) return [];

    const content = await RNFS.readFile(UPLOAD_FILE_PATH, "utf8");
    return JSON.parse(content || "[]");
  } catch (err) {
    console.error("Failed to read upload queue:", err);
    return [];
  }
};

/**
 * Atomically write the upload queue.
 */
export const writeUploadQueue = async (queue) => {
  try {
    const tmpPath = `${UPLOAD_FILE_PATH}.tmp`;

    // Write to temp file first
    await RNFS.writeFile(tmpPath, JSON.stringify(queue), "utf8");

    // Replace original file atomically
    await RNFS.unlink(UPLOAD_FILE_PATH).catch(() => {});
    await RNFS.moveFile(tmpPath, UPLOAD_FILE_PATH);

    console.log("📝 Upload queue written:", UPLOAD_FILE_PATH);
  } catch (err) {
    console.error("Failed to write upload queue:", err);
  }
};

/**
 * Add a new item to the queue.
 */
export const addToUploadQueue = async (item) => {
  const queue = await readUploadQueue();
  queue.push(item);
  await writeUploadQueue(queue);
};

/**
 * Remove an item from the queue by storyId.
 */
export const removeFromUploadQueue = async (storyId) => {
  const queue = await readUploadQueue();
  const updated = queue.filter((item) => item.storyId !== storyId);
  await writeUploadQueue(updated);
};  

/**
 * Mark an upload as failed (syncs with native update logic).
 */
export const markUploadFailed = async (storyId) => {
  const queue = await readUploadQueue();
  const updated = queue.map((item) =>
    item.storyId === storyId 
       ? { ...item, status: "failed", isSending: false, isFailed: true }
      : item
  );
  await writeUploadQueue(updated);
};

export const clearUploadQueue = async () => {
  await writeUploadQueue([]);
};