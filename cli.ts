import { startServer } from "./server.ts";
import { parseArgs } from "@std/cli/parse-args";
import { join } from "@std/path/join";

const args = parseArgs(Deno.args, {
  boolean: ["cached-only"],
  string: ["port"],
});

const subcommand = args._[0];
const port = args.port == null ? undefined : parseInt(args.port, 10);

if (subcommand === "init") {
  await init(port ?? 8000);
} else {
  const server = startServer({
    useMemCache: true,
    cachedOnly: args["cached-only"],
    port,
  });
  console.error(`Server listening on http://localhost:${server.addr.port}`);
}

async function init(port: number) {
  const baseUrl = `http://localhost:${port}`;
  await writeIfNotExists(".npmrc", `registry=${baseUrl}/npm/\n`);
  const denoDir = join(Deno.cwd(), "deno_dir");
  await writeIfNotExists(
    ".env",
    `JSR_URL=${baseUrl}/jsr/\nDENO_DIR=${denoDir}\n`,
  );
}

async function writeIfNotExists(path: string, content: string) {
  try {
    await Deno.lstat(path);
    console.log(`Skipping ${path} (already exists)`);
  } catch {
    await Deno.writeTextFile(path, content);
    console.log(`Created ${path}`);
  }
}
