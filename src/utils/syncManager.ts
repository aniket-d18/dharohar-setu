/**
 * Dharohar Offline Sync Manager
 * Uses IndexedDB (via idb) to persist capture submissions when the user is
 * offline or the upload fails. Automatically retries when connectivity is
 * restored.
 */
import { openDB, IDBPDatabase } from "idb";

export type SyncStatus = "QUEUED" | "SYNCED" | "FAILED";

export interface SyncItem {
  id?: number;
  status: SyncStatus;
  retry_count: number;
  created_at: string;
  payload: Record<string, unknown>;
  mediaBlob: Blob | null;
  mediaName: string | null;
  mediaType: string | null;
  apiUrl: string;
}

export interface SyncItemWithId extends SyncItem {
  id: number;
}

const DB_NAME = "dharohar_offline";
const DB_VERSION = 1;
const STORE = "sync_queue";
const MAX_RETRIES = 5;

let _db: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
        store.createIndex("by_status", "status");
      }
    },
  });
  return _db;
}

/** Enqueue a submission for later sync. Returns the auto-assigned id. */
export async function enqueueSubmission(
  payload: Record<string, unknown>,
  mediaBlob: Blob | null,
  mediaName: string | null,
  mediaType: string | null,
  apiUrl: string
): Promise<number> {
  const db = await getDB();
  const item: SyncItem = {
    status: "QUEUED",
    retry_count: 0,
    created_at: new Date().toISOString(),
    payload,
    mediaBlob,
    mediaName,
    mediaType,
    apiUrl,
  };
  const id = await db.add(STORE, item);
  flushQueue().catch(() => {});
  return id as number;
}

/** Count QUEUED items (for the UI badge). */
export async function countQueued(): Promise<number> {
  const db = await getDB();
  return db.countFromIndex(STORE, "by_status", "QUEUED");
}

/** Return only QUEUED items. */
export async function getQueuedItems(): Promise<SyncItemWithId[]> {
  const db = await getDB();
  return db.getAllFromIndex(STORE, "by_status", "QUEUED") as Promise<SyncItemWithId[]>;
}

/** Attempt to upload a single queued item. Returns true if succeeded. */
async function uploadItem(item: SyncItemWithId): Promise<boolean> {
  const db = await getDB();
  try {
    let finalMediaUrl: string = (item.payload.mediaUrl as string) || "";

    if (item.mediaBlob) {
      const formData = new FormData();
      formData.append(
        "file",
        new File([item.mediaBlob], item.mediaName || ("recording-" + item.id + ".webm"), {
          type: item.mediaType || "application/octet-stream",
        })
      );
      const uploadRes = await fetch(item.apiUrl + "/api/records/upload", {
        method: "POST",
        body: formData,
      });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        finalMediaUrl = uploadData.url.startsWith("http")
          ? uploadData.url
          : item.apiUrl + uploadData.url;
      }
    }

    const payloadWithUrl = { ...item.payload, mediaUrl: finalMediaUrl };
    const res = await fetch(item.apiUrl + "/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadWithUrl),
    });

    if (res.ok) {
      await db.put(STORE, { ...item, status: "SYNCED", mediaBlob: null });
      return true;
    } else {
      throw new Error("HTTP " + res.status);
    }
  } catch (err) {
    const nextRetry = item.retry_count + 1;
    const newStatus: SyncStatus = nextRetry >= MAX_RETRIES ? "FAILED" : "QUEUED";
    await db.put(STORE, { ...item, status: newStatus, retry_count: nextRetry });
    console.warn("[SyncManager] Item " + item.id + " failed (attempt " + nextRetry + "):", err);
    return false;
  }
}

/** Flush all QUEUED items. Skips silently if offline. */
export async function flushQueue(): Promise<{ synced: number; failed: number }> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }
  const items = await getQueuedItems();
  let synced = 0;
  let failed = 0;
  for (const item of items) {
    const ok = await uploadItem(item);
    if (ok) synced++;
    else failed++;
  }
  return { synced, failed };
}

/** Delete all SYNCED entries (housekeeping). */
export async function clearSynced(): Promise<void> {
  const db = await getDB();
  const synced = (await db.getAllFromIndex(STORE, "by_status", "SYNCED")) as SyncItemWithId[];
  for (const item of synced) {
    await db.delete(STORE, item.id);
  }
}

// Auto-flush when browser comes back online
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("[SyncManager] Browser came online -- flushing offline queue...");
    flushQueue()
      .then(function(result) {
        if (result.synced > 0) {
          window.dispatchEvent(new CustomEvent("dharohar:sync-complete", { detail: { synced: result.synced } }));
        }
      })
      .catch(function(e) { console.error("[SyncManager] Flush error:", e); });
  });
}