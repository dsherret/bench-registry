import { startServer } from "./mod.ts";
import { parseArgs } from "@std/cli/parse-args";

const args = parseArgs(Deno.args, {
  boolean: ["cached-only"]
});

const server = startServer({
  useMemCache: true,
  cachedOnly: args["cached-only"],
});
console.error(`Server listening on http://localhost:${server.addr.port}`);
