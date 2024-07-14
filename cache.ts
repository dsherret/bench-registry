import { encodeHex } from "@std/encoding/hex";
import * as path from "@std/path";

export type CacheKey = string & { __cacheKeyBrand: undefined };

export class Cache {
  #dirPath: string;

  constructor(dirPath: string) {
    this.#dirPath = path.resolve(dirPath);
    Deno.mkdirSync(dirPath, { recursive: true });
  }

  async createCacheKey(url: string) {
    return path.join(this.#dirPath, await hash(url)) as CacheKey;
  }

  async set(key: CacheKey, headers: Headers, body: Uint8Array) {
    await Deno.writeFile(key, body);
    await Deno.writeTextFile(
      key + ".headers",
      JSON.stringify(Object.fromEntries(headers)),
    );
  }

  async tryRead(key: CacheKey) {
    try {
      const body = await Deno.readFile(key);
      const headers = tryParseHeaders(
        await Deno.readTextFile(key + ".headers"),
      );
      if (headers == null) {
        return undefined;
      }
      return {
        headers,
        body,
      };
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
