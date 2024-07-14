# @david/bench-registry

npm and jsr proxy registry that caches responses from the original registries so
you can get more reliable benchmarks.

## Starting server

```ts
deno run --allow-net --allow-read=. --allow-write=. jsr:@david/bench-registry/cli
```

## Setting up benchmark

Use an `.npmrc` with:

```ini
registry=http://localhost:8000/npm/
```

And set the `JSR_URL` env var:

```
export JSR_URL=http://localhost:8000/jsr/
```

Note: You probably want to run the server on a separate computer on your
local network instead of using the same computer that's running the benchmark.
