import { Cache } from "./cache/mod.ts";

export interface ServerOptions {
  /** The root location of the cache. Defaults to `.bench-reg` */
  cacheRoot?: string;
  /** Default https://jsr.io */
  jsrRegistryBaseUrl?: string;
  /** Default https://registry.npmjs.org */
  npmRegistryBaseUrl?: string;
  /** Port to listen on. */
  port?: number;
  /** Whether to put a memory cache in front of
   * the file system cache. */
  useMemCache?: boolean;
}

/** Starts a server with the provided options. */
export function startServer(
  opts: ServerOptions = {},
): Deno.HttpServer<Deno.NetAddr> {
  const baseJsrRegistryUrl = new URL(
    opts.jsrRegistryBaseUrl ?? "https://jsr.io",
  );
  const baseNpmRegistryUrl = new URL(
    opts.npmRegistryBaseUrl ?? "https://registry.npmjs.org",
  );
  const cacheRoot = opts.cacheRoot ?? ".bench-reg";
  const cache = new Cache({
    dirPath: cacheRoot,
    useMemCache: opts.useMemCache ?? false,
  });

  return Deno.serve({
    port: opts.port,
  }, async (req) => {
    const cacheKey = await cache.createCacheKey(req.url);
    let cached = await cache.get(cacheKey);
    if (cached == null) {
      const url = new URL(req.url);
      if (url.pathname.startsWith("/npm/")) {
        const newPath = url.pathname.replace("/npm/", "");
        if (newPath.startsWith("-/npm/v1/security/")) {
          return new Response("Not Found", { status: 404 });
        }
        const newUrl = `${baseNpmRegistryUrl.origin}/${newPath}`;
        console.error("Requesting", newUrl);
        const response = await fetch(newUrl);
        if (response.status !== 200) {
          return response;
        }
        let body = new Uint8Array(await response.arrayBuffer());
        if (response.headers.get("Content-Type") === "application/json") {
          const localNpmUrl = url.origin + "/npm/";
          const bodyText = new TextDecoder().decode(body);
          body = new TextEncoder().encode(
            bodyText.replaceAll("https://registry.npmjs.org/", localNpmUrl),
          );
        }
        await cache.set(cacheKey, { headers: response.headers, body });
      } else if (url.pathname.startsWith("/jsr/")) {
        const newPath = url.pathname.replace("/jsr/", "");
        const newUrl = `${baseJsrRegistryUrl.origin}/${newPath}`;
        console.error("Requesting", newUrl);
        const response = await fetch(newUrl);
        if (response.status !== 200) {
          return response;
        }
        const body = new Uint8Array(await response.arrayBuffer());
        await cache.set(cacheKey, { headers: response.headers, body });
      } else {
        return new Response("Not found", { status: 404 });
      }
      cached = await cache.get(cacheKey);
      if (cached == null) {
        throw new Error("Cache should have been populated.");
      }
    }
    return new Response(cached.body, { headers: cached.headers });
  });
}
