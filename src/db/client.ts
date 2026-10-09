/* ============================================================
   Database connection (server only — never import from a
   "use client" component).

   DATABASE_URL set   → managed PostgreSQL (node-postgres)
   DATABASE_URL unset → PGlite, real PostgreSQL compiled to
                        WebAssembly, stored in .data/pglite
                        (on Vercel: a copy of the demo database
                        the build prepared — accounts temporary)

   Same schema and same SQL either way, so development matches
   production without installing a database locally.
   ============================================================ */

import * as schema from "./schema";

type Db = Awaited<ReturnType<typeof create>>;

/* Vercel's Postgres integrations set POSTGRES_URL; anything else uses DATABASE_URL. */
export const databaseUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

async function create() {
  const url = databaseUrl();

  if (url) {
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 10 });
    return drizzle(pool, { schema });
  }

  const { drizzle } = await import("drizzle-orm/pglite");
  const { PGlite } = await import("@electric-sql/pglite");
  const { mkdir } = await import("node:fs/promises");
  const dir = process.env.VERCEL ? await serverlessCopy() : process.env.PGLITE_DIR ?? ".data/pglite";
  await mkdir(dir, { recursive: true }); /* PGlite does not create parents */
  const client = new PGlite(dir);
  await client.waitReady;
  return drizzle(client, { schema });
}

/* Serverless hosts have a read-only disk except the temp folder. The build shipped a
   prepared demo database (.data/deploy-db, see scripts/setup.mjs); each server starts
   from its own copy in the temp folder. Accounts made there are temporary — set
   DATABASE_URL for a database that keeps them. */
async function serverlessCopy(): Promise<string> {
  const path = await import("node:path");
  const { tmpdir } = await import("node:os");
  const { access, chmod, cp, readdir } = await import("node:fs/promises");
  const snapshot = path.join(/*turbopackIgnore: true*/ process.cwd(), ".data", "deploy-db");
  const dir = path.join(tmpdir(), "cadastra-db");
  /* deployed files are read-only, and a copy keeps their permissions: make it writable */
  const writable = async (p: string): Promise<void> => {
    await chmod(p, 0o755);
    for (const e of await readdir(p, { withFileTypes: true })) {
      const child = path.join(p, e.name);
      if (e.isDirectory()) await writable(child);
      else await chmod(child, 0o644);
    }
  };

  try {
    await access(path.join(dir, ".ready"));
  } catch {
    try {
      await cp(snapshot, dir, { recursive: true, force: true });
      await writable(dir);
      await import("node:fs/promises").then((fs) => fs.writeFile(path.join(dir, ".ready"), ""));
    } catch {
      throw new Error("No database: set DATABASE_URL, or redeploy so the build can prepare the demo database.");
    }
  }
  return dir;
}

/* One connection per process, kept across hot reloads in development. */
const globalForDb = globalThis as unknown as { __terraDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  /* a failed start is not cached: the next request tries again */
  globalForDb.__terraDb ??= create().catch((e) => {
    globalForDb.__terraDb = undefined;
    throw e;
  });
  return globalForDb.__terraDb;
}

export { schema };
