import { encodeHex } from "@std/encoding/hex";
import * as path from "@std/path";
import type { CacheItem, CacheKey } from "./mod.ts";

export class FsCache {
  #dirPath: string;

  constructor(dirPath: string) {
    this.#dirPath = path.resolve(dirPath);
    Deno.mkdirSync(dirPath, { recursive: true });
  }

  async createCacheKey(url: string) {
    return path.join(this.#dirPath, await hash(url)) as CacheKey;
  }

  async set(key: CacheKey, item: CacheItem) {
    const headersObj = Object.fromEntries(item.headers);
    await Deno.writeFile(key, item.body);
    await Deno.writeTextFile(
      key + ".headers",
      JSON.stringify(headersObj),
    );
  }

  async get(key: CacheKey) {
    try {
      const body = await Deno.readFile(key);
      const headers = tryParseHeaders(
        await Deno.readTextFile(key + ".headers"),
      );
      if (headers == null) {
        return undefined;
      }
      return { headers, body };
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        return undefined;
      } else {
        throw err;
      }
    }
  }
}

function tryParseHeaders(data: string) {
  try {
    return JSON.parse(data);
  } catch {
    return undefined;
  }
}

async function hash(pathname: string) {
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(pathname),
  );
  return encodeHex(hashBuffer);
}
