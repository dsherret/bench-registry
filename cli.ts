import { startServer } from "./mod.ts";

const server = startServer();
console.error(`Server listening on http://localhost:${server.addr.port}`);
