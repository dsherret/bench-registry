import type { CacheItem, CacheKey, SyncCache } from "./mod.ts";

export class MemCache implements SyncCache {
  #memCache = new Map<CacheKey, CacheItem>();

  set(key: CacheKey, value: CacheItem) {
    this.#memCache.set(key, value);
  }

  get(key: CacheKey) {
    return this.#memCache.get(key);
  }
}
