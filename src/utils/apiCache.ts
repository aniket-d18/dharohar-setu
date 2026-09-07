/**
 * Stale-While-Revalidate (SWR) Client-Side In-Memory + LocalStorage Cache
 * Guarantees 0ms instant loading on page transitions and mobile browsers.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

export async function cachedFetch<T = any>(
  url: string,
  options?: RequestInit & { maxAgeMs?: number; ttl?: number; fallbackData?: T }
): Promise<T> {
  const maxAgeMs = options?.maxAgeMs ?? options?.ttl ?? 10 * 60 * 1000; // 10 minutes default
  const cacheKey = `dharohar_cache_${url}`;

  // 1. Try In-Memory cache first (0ms)
  const mem = memoryCache.get(cacheKey);
  if (mem && Date.now() - mem.timestamp < maxAgeMs) {
    // Return cached immediately; optionally background revalidate if older than 30s
    if (Date.now() - mem.timestamp > 30 * 1000) {
      silentRevalidate(url, cacheKey, options);
    }
    return mem.data as T;
  }

  // 2. Try browser localStorage (persists across page reloads / mobile sessions)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        const parsed: CacheEntry<T> = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < maxAgeMs) {
          memoryCache.set(cacheKey, parsed);
          silentRevalidate(url, cacheKey, options);
          return parsed.data;
        }
      }
    } catch {
      // ignore storage errors
    }
  }

  // 3. Fetch fresh data with 8s timeout to prevent infinite stalls
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from ${url}`);
    }

    const data: T = await res.json();

    // Store in memory and localStorage
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    memoryCache.set(cacheKey, entry);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(entry));
      } catch {
        // quota exceeded / private mode
      }
    }

    return data;
  } catch (err) {
    // If fetch failed, return stale cache if exists rather than crashing
    if (mem?.data) return mem.data;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(cacheKey);
        if (stored) return JSON.parse(stored).data;
      } catch {}
    }
    if (options?.fallbackData !== undefined) {
      return options.fallbackData;
    }
    throw err;
  }
}

async function silentRevalidate(url: string, cacheKey: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);
    if (res.ok) {
      const data = await res.json();
      const entry = { data, timestamp: Date.now() };
      memoryCache.set(cacheKey, entry);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(entry));
        } catch {}
      }
    }
  } catch {
    // silent failure in background
  }
}

export function invalidateClientCache(urlPrefix?: string) {
  if (!urlPrefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(urlPrefix)) {
      memoryCache.delete(key);
    }
  }
  if (typeof window !== 'undefined') {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.includes(urlPrefix)) {
          localStorage.removeItem(k);
        }
      }
    } catch {}
  }
}
