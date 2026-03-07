# @david/bench-registry

npm and jsr proxy registry that caches responses from the original registries so
you can get more reliable benchmarks.

## Starting server

```ts
deno run --allow-net --allow-read=. --allow-write=. jsr:@david/bench-registry
```

### Options

- `--cached-only` - Run using only packages that have previously been cached.

## Setting up benchmark

Run `init` in your project directory to create `.npmrc` and `.env` files:

```sh
deno run -R=. -W=. jsr:@david/bench-registry init
```

Use `--port` if the server is running on a different port.

### Manual setup

Alternatively, create an `.npmrc` with:

```ini
registry=http://localhost:8000/npm/
```

And set the `JSR_URL` env var:

```
export JSR_URL=http://localhost:8000/jsr/
```

Note: You probably want to run the server on a separate computer on your local
network instead of using the same computer that's running the benchmark.

## Programmatic usage

```ts
import { startServer } from "jsr:@david/bench-registry/server";

await using server = startServer({
  port: 8000,
  useMemCache: true,
});
```

Options:

- `cacheRoot` - The root location of the cache. Defaults to `.bench-reg`.
- `jsrRegistryBaseUrl` - The upstream JSR registry URL. Defaults to `https://jsr.io`.
- `npmRegistryBaseUrl` - The upstream npm registry URL. Defaults to `https://registry.npmjs.org`.
- `port` - Port to listen on.
- `useMemCache` - Whether to put a memory cache in front of the file system cache.
- `cachedOnly` - Whether to only serve cached responses.
