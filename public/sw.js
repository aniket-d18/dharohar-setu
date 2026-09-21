/**
 * Dharohar Service Worker – Background Sync Support
 * Registered by the capture page to handle Background Sync API tag "dharohar-sync".
 * Falls back gracefully: if the tag is not available the syncManager.ts
 * online-event listener handles it in the main thread instead.
 */

const CACHE_NAME = "dharohar-sw-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Background Sync: fired when the browser thinks it has connectivity.
self.addEventListener("sync", (event) => {
  if (event.tag === "dharohar-sync") {
    event.waitUntil(notifyClientsToFlush());
  }
});

/**
 * Tell all open tabs to run their syncManager.flushQueue().
 * We message instead of duplicating the DB logic in the SW to avoid
 * opening two writers on the IndexedDB simultaneously.
 */
async function notifyClientsToFlush() {
  const allClients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
  for (const client of allClients) {
    client.postMessage({ type: "DHAROHAR_FLUSH_QUEUE" });
  }
}

// Push notifications (optional, placeholder for future use)
self.addEventListener("push", (event) => {
  // reserved for future remote push
});
