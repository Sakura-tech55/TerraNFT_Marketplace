/* ============================================================
   The only route that can reach artwork.

   Source files live in /private/nft, outside /public, so they
   have no URL of their own and cannot be fetched, hotlinked or
   crawled directly.

   Who gets what:
     visitor (no session)  → 480px, watermarked, low quality
     signed in             → 1000px, clean
     designer review link  → 1000px, clean, for that asset only
                             (?rt=<reviewToken>)

   A rendered image can always be screenshotted — this stops the
   original file from being downloadable, which is what makes it
   a sales platform rather than a public image host.
   ============================================================ */

import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { cookies } from "next/headers";
import { DESIGNS } from "@/lib/data";
import { DROPS } from "@/lib/drops";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export const dynamic = "force-dynamic";

const MEDIA_ROOT = path.join(process.cwd(), "private");

const PREVIEW = { width: 480, quality: 58 };
const FULL = { width: 1000, quality: 82 };

/** Resolve an asset id to its file — ids come from our own data, never from the URL path. */
function fileFor(id: string): string | null {
  const design = DESIGNS.find((d) => d.id === id);
  if (design) return design.image;
  const drop = DROPS.find((d) => d.id === id);
  if (drop) return drop.image;
  return null;
}

const WATERMARK_TEXT = "TERRA LEDGER · PREVIEW";

function watermark(width: number, height: number): Buffer {
  const fontSize = Math.max(11, Math.round(width / 26));
  /* keep tiles wider than the text itself, or the copies overlap into noise */
  const stepX = Math.round(fontSize * WATERMARK_TEXT.length * 0.64 + fontSize * 3);
  const stepY = Math.round(fontSize * 5);

  const tiles: string[] = [];
  let row = 0;
  for (let y = -height; y < height * 2; y += stepY, row++) {
    const offset = row % 2 ? stepX / 2 : 0; /* brick pattern */
    for (let x = -width + offset; x < width * 2; x += stepX) {
      tiles.push(`<text x="${Math.round(x)}" y="${y}" class="w">${WATERMARK_TEXT}</text>`);
    }
  }

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
       <style>
         .w{fill:#ffffff;fill-opacity:.32;font-family:sans-serif;font-size:${fontSize}px;font-weight:700;letter-spacing:1px}
       </style>
       <g transform="rotate(-30 ${width / 2} ${height / 2})">${tiles.join("")}</g>
     </svg>`,
  );
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const rel = fileFor(id);
  if (!rel) return new Response("Not found", { status: 404 });

  /* Access tier */
  const store = await cookies();
  const session = verifySessionToken(store.get(SESSION_COOKIE)?.value);
  const reviewToken = new URL(request.url).searchParams.get("rt");
  const reviewOk = Boolean(reviewToken) && DESIGNS.some((d) => d.id === id && d.reviewToken === reviewToken);
  const full = Boolean(session) || reviewOk;
  const spec = full ? FULL : PREVIEW;

  /* rel is a value from our data module (e.g. "/nft/nft-01.jpg"); normalise and confine it. */
  const file = path.join(MEDIA_ROOT, path.normalize(rel).replace(/^([/\\])+/, ""));
  if (!file.startsWith(MEDIA_ROOT + path.sep)) return new Response("Not found", { status: 404 });

  let source: Buffer;
  try {
    source = await readFile(file);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  let pipeline = sharp(source).rotate().resize({ width: spec.width, withoutEnlargement: true });

  if (!full) {
    const meta = await sharp(source).resize({ width: spec.width, withoutEnlargement: true }).toBuffer({ resolveWithObject: true });
    pipeline = sharp(meta.data).composite([{ input: watermark(meta.info.width, meta.info.height), blend: "over" }]);
  }

  const out = await pipeline.jpeg({ quality: spec.quality, progressive: true }).toBuffer();

  return new Response(new Uint8Array(out), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(out.byteLength),
      "Content-Disposition": `inline; filename="${id}${full ? "" : "-preview"}.jpg"`,
      /* per-viewer output: never store in a shared cache */
      "Cache-Control": "private, max-age=300, must-revalidate",
      Vary: "Cookie",
      "X-Robots-Tag": "noindex, noimageindex",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
