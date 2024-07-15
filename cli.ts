import { startServer } from "./mod.ts";

const server = startServer({
  useMemCache: true,
});
console.error(`Server listening on http://localhost:${server.addr.port}`);
