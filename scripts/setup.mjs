/* Prepares a local copy so `npm run dev` just works. Runs automatically before
   `npm run dev` (the "predev" script) and does only what is missing:

     1. checks the Node.js version
     2. creates or upgrades the database (always; it is idempotent)
     3. loads the demo data on an empty database
     4. downloads and renders the catalogue images, the first time only
     5. imports the catalogue, the first time only
     6. attaches artist photos, if private/creators/credits.json is present

   Each step is one of the scripts in this folder, run in turn — PGlite allows
   one process at a time, so they never overlap with each other or the server. */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { connect } from "./lib/db.mjs";

const ROOT = process.cwd();
const say = (m) => console.log(`\x1b[36m[cadastra]\x1b[0m ${m}`);

/* 1. Node.js */
const [major, minor] = process.versions.node.split(".").map(Number);
/* 22.18 is the first release that loads the TypeScript seed files without a flag */
if (major < 22 || (major === 22 && minor < 18)) {
  console.error(`Cadastra needs Node.js 22.18 or newer (24 recommended); this is ${process.versions.node}.\nRun: nvm install`);
  process.exit(1);
}

const run = (script, args = [], { optional = false } = {}) => {
  /* the seed files are TypeScript loaded directly; Node's notice about that is noise here */
  const r = spawnSync(process.execPath, ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", path.join("scripts", script), ...args], {
    stdio: "inherit",
    cwd: ROOT,
  });
  if (r.status !== 0 && !optional) {
    console.error(`\n${script} failed — see the message above.`);
    process.exit(r.status ?? 1);
  }
  return r.status === 0;
};

async function counts() {
  const db = await connect();
  const one = async (sql, p = []) => Number((await db.query(sql, p)).rows[0]?.n ?? 0);
  const c = {
    categories: await one(`SELECT count(*)::int AS n FROM categories`),
    catalogue: await one(
      /* museum and studio works exist only after an import; the demo seed also uses site images */
      `SELECT count(*)::int AS n FROM works WHERE media_key LIKE $1 OR media_key LIKE $2`,
      ["nft/open-access/%", "nft/studio/%"]),
    photos: await one(`SELECT count(*)::int AS n FROM creator_photos`),
  };
  await db.close();
  return c;
}

/* 2. database */
run("db-setup.mjs");
let c = await counts();

/* 3. demo data */
if (c.categories === 0) {
  say("Loading demo data…");
  run("seed.mjs");
}

/* 4. catalogue images */
const csv = path.join(ROOT, "private", "nft", "catalog.csv");
if (!existsSync(csv)) {
  say("First run: downloading and rendering the catalogue images (a few minutes)…");
  if (!run("catalog-fetch.mjs", [], { optional: true }) && !existsSync(csv)) {
    say("The catalogue could not be prepared (see the message above). Starting with the demo data; it will retry next time.");
  }
}

/* 5. catalogue */
c = await counts();
if (c.catalogue === 0 && existsSync(csv)) {
  say("Importing the catalogue…");
  run("catalog-import.mjs");
}

/* 6. artist photos */
if (c.photos === 0 && existsSync(path.join(ROOT, "private", "creators", "credits.json"))) {
  say("Attaching artist photos…");
  run("creator-photos.mjs", [], { optional: true });
}

say("Ready.");
