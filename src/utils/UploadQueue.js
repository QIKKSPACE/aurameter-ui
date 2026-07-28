import RNFS from "react-native-fs";

/* -------------------------------------------------- */
/* Config                                             */
/* -------------------------------------------------- */

const QUEUE_PATH = `${RNFS.DocumentDirectoryPath}/upload_queue.json`;
const TMP_PATH = `${QUEUE_PATH}.tmp`;
const VERSION = 1;

/* -------------------------------------------------- */
/* Write Lock (GLOBAL, STRICT)                         */
/* -------------------------------------------------- */

let lock = Promise.resolve();

const withLock = async (fn) => {
  const run = lock.then(fn);
  lock = run.catch(err => {
    console.error("❌ UploadQueue lock error:", err);
  });
  return run;
};

/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */

const emptyQueue = () => ({
  version: VERSION,
  updatedAt: Date.now(),
  items: [],
});

const safeParse = (raw) => {
  if (!raw || typeof raw !== "object") return emptyQueue();
  if (!Array.isArray(raw.items)) return emptyQueue();
  return raw;
};

const readFileSafe = async () => {
  try {
    const exists = await RNFS.exists(QUEUE_PATH);
    if (!exists) return emptyQueue();

    const content = await RNFS.readFile(QUEUE_PATH, "utf8");
    return safeParse(JSON.parse(content));
  } catch (err) {
    console.error("❌ Failed to read upload queue:", err);
    return emptyQueue();
  }
};

const atomicWrite = async (payload) => {
  await RNFS.writeFile(TMP_PATH, JSON.stringify(payload), "utf8");
  await RNFS.unlink(QUEUE_PATH).catch(() => {});
  await RNFS.moveFile(TMP_PATH, QUEUE_PATH);
};

/* -------------------------------------------------- */
/* Public API                                         */
/* -------------------------------------------------- */

/**
 * Read queue (safe, unlocked)
 * Use ONLY for non-mutating reads (UI, debugging)
 */
export const readUploadQueue = async () => {
  const data = await readFileSafe();
  return data.items;
};

/**
 * Add item to queue
 */
export const addToUploadQueue = async (item) =>
  withLock(async () => {
    const data = await readFileSafe();

    if (data.items.some(q => q.local_id === item.local_id)) {
      return;
    }

    const items = [
      ...data.items,
      {
        ...item,
        status: "PENDING",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    await atomicWrite({
      version: VERSION,
      updatedAt: Date.now(),
      items,
    });
  });

/**
 * Update upload status (STRICTLY ATOMIC)
 */
export const updateUploadStatus = async (update) =>
  withLock(async () => {
    if (!update?.local_id) return;

    const data = await readFileSafe();

    let changed = false;

    const items = data.items.map(item => {
      if (String(item.local_id) !== String(update.local_id)) {
        return item;
      }

      changed = true;

      return {
        ...item,
        ...Object.fromEntries(
          Object.entries(update).filter(([, v]) => v !== undefined)
        ),
        updatedAt: Date.now(),
      };
    });

    if (!changed) return;

    await atomicWrite({
      version: VERSION,
      updatedAt: Date.now(),
      items,
    });
  });

/**
 * Remove item once accepted by server
 */
export const markUploadAccepted = async (local_id) =>
  withLock(async () => {
    const data = await readFileSafe();

    const items = data.items.filter(
      q => String(q.local_id) !== String(local_id)
    );

    if (items.length === data.items.length) return;

    await atomicWrite({
      version: VERSION,
      updatedAt: Date.now(),
      items,
    });
  });

/**
 * Get retryable uploads
 */
export const getRetryableUploads = async () => {
  const data = await readFileSafe();
  return data.items.filter(q => q.status === "FAILED");
};

/**
 * Clear queue (debug / logout)
 */
export const clearUploadQueue = async () =>
  withLock(async () => {
    await atomicWrite(emptyQueue());
  });
