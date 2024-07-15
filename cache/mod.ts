import { FsCache } from "./fs-cache.ts";
import { MemCache } from "./mem-cache.ts";

export type CacheKey = string & { __cacheKeyBrand: undefined };

export interface CacheItem {
  headers: Readonly<Headers>;
  body: Readonly<Uint8Array>;
}

export interface SyncCache {
  get(key: CacheKey): CacheItem | undefined;
  set(key: CacheKey, value: CacheItem): void;
}

export class NullCache {
  get(_key: CacheKey): CacheItem | undefined {
    return undefined;
  }

  set(_key: CacheKey, _value: CacheItem) {
    // do nothing
  }
}

export interface CacheOptions {
  dirPath: string;
  useMemCache: boolean;
}

export class Cache {
  #memCache: SyncCache;
  #fsCache: FsCache;

  constructor(opts: CacheOptions) {
    this.#memCache = opts.useMemCache ? new MemCache() : new NullCache();
    this.#fsCache = new FsCache(opts.dirPath);
  }

  createCacheKey(url: string) {
    return this.#fsCache.createCacheKey(url);
  }

  async get(key: CacheKey) {
    let cacheItem = this.#memCache.get(key);
    if (cacheItem == null) {
      cacheItem = await this.#fsCache.get(key);
      if (cacheItem != null) {
        this.#memCache.set(key, cacheItem);
      }
    }
    return cacheItem;
  }

  async set(key: CacheKey, value: CacheItem) {
    this.#memCache.set(key, value);
    await this.#fsCache.set(key, value);
  }
}
