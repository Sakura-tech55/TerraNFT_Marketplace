/* ============================================================
   Database connection (server only — never import from a
   "use client" component).

   DATABASE_URL set   → managed PostgreSQL (node-postgres)
   DATABASE_URL unset → PGlite, real PostgreSQL compiled to
                        WebAssembly, stored in .data/pglite

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

  /* PGlite writes to local disk, which serverless hosts do not have: every page that reads
     the database would fail. Say what is missing instead. */
  if (process.env.VERCEL) {
    throw new Error("No database configured: add a PostgreSQL database to the Vercel project so DATABASE_URL is set, then redeploy.");
  }

  const { drizzle } = await import("drizzle-orm/pglite");
  const { PGlite } = await import("@electric-sql/pglite");
  const { mkdir } = await import("node:fs/promises");
  const dir = process.env.PGLITE_DIR ?? ".data/pglite";
  await mkdir(dir, { recursive: true }); /* PGlite does not create parents */
  const client = new PGlite(dir);
  await client.waitReady;
  return drizzle(client, { schema });
}

/* One connection per process, kept across hot reloads in development. */
const globalForDb = globalThis as unknown as { __terraDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  globalForDb.__terraDb ??= create();
  return globalForDb.__terraDb;
}

export { schema };
