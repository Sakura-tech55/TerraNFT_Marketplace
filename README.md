# Terra Ledger — Collect, sell and launch NFTs

An NFT marketplace built with Next.js 16 (App Router), React 19 and TypeScript.
**Every listing, price, account, partner and trade on this build is demo data.**

## Purpose and mission

**Goal:** be the leading marketplace where people collect and sell NFT assets.

**Mission:** release new NFT creations continuously, season after season, through active and
long-term collaboration with client partners. The site is built around that commitment:
the landing page, the drop calendar and the partner programme all point collectors to
what is launching next, not only to what is already listed.

## Running it

```bash
nvm use          # Node 24
npm install
npm run dev      # http://localhost:3000
```

Production: `npm run build && npm start`.

## Routes

| Route | Access | Contents |
| --- | --- | --- |
| `/` | Public | Visual introduction: orbiting coins and tokens, live price ticker, how it works, key numbers, categories, the partner-release mission, top creators preview |
| `/explore` | Public | The marketplace: search, category filter (`?category=Art`), sorting |
| `/drops` | Public | Live drop, release calendar, how drops work, launch partners |
| `/creators` | Public | Top 10 NFT creators with profile, headline achievement and notable works |
| `/register` | Public | Account sign-up; the Ledger Pass is generated as you type |
| `/login` | Public | Sign-in for sales and clients |
| `/dashboard` | Signed in | Role-aware — see below |
| `/review/<token>` | Link only | Designer review surface, no sign-in |

## Top 10 creators — images need licences

`src/lib/creators.ts` holds the ranking, bios and works. The order is editorial (landmark
sales and influence) and can be changed by reordering the array.

Every `photo` and work `image` is `null` on purpose. Artist portraits and artworks are
protected by copyright and publicity rights, so **only add images you are licensed to use**,
for example supplied by the artist or their gallery. Put them in `public/creators/` and set
the path; the page switches from the generated placeholder to the real image automatically.
The page states that Terra Ledger is not affiliated with these creators — keep that notice
unless you have partnership agreements.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Sales | `nft10@gmail.com` | `123456` |
| Client | `client@northgate.example` | `123456` |

Self-registration creates a **client** account; sales seats are provisioned internally.

## The dashboard is role-aware

| Panel | Sales | Client |
| --- | --- | --- |
| KPI row | Yes | No |
| 🔴 Highest sale today | Yes | Yes |
| 🟢 Fairly priced, most liked | Yes | Yes |
| 🟡 Highest-volume buyers | Yes | **No** — replaced with the client's own holdings |
| Designer suggestions inbox and review links | Yes | No |
| Ranking by category | Yes | Yes |

## The designer review loop

1. Sales copies an asset's link from **Awaiting the designer** on the dashboard.
2. The designer opens `/review/<token>` — no account needed.
3. They see the artwork, the brief, the status and how the asset performs, and submit a suggestion.
4. It lands in the sales **Designer suggestions** inbox.

## Design system

- **Ground:** deep ink (`--bg`) with soft violet and cyan light.
- **Action colour:** lime (`--lime`) for primary buttons and live states.
- **Coins and tokens:** the iridescent gradient (`--iri`) plus tone palettes in
  `src/components/visuals/Coin.tsx`. All visuals are SVG + CSS; no image or animation library.
- **Data colours:** red, green and yellow (`--sig-*`) stay reserved for dashboard charts.
- **Type:** Unbounded (display), Manrope (body), JetBrains Mono (numbers and labels).
- **Motion:** orbit, float, coin spin and ticker animations all stop under `prefers-reduced-motion`.

Styles: `src/app/globals.css` (tokens, shared components, app screens) and
`src/app/site.css` (landing, explore, drops, creators).

## Loading real data

| File | Export | Drives |
| --- | --- | --- |
| `src/lib/data.ts` | `DESIGNS` | Explore grid, ticker, ranking table, review pages |
| | `CATEGORY_STATS`, `SALES_KPIS` | Landing numbers, category tiles, dashboard KPIs |
| | `TOP_SALES_TODAY`, `MOST_LIKED`, `TOP_BUYERS` | Dashboard charts |
| | `SEED_SUGGESTIONS`, `USD_PER_ETH` | Suggestions inbox, USD conversion |
| `src/lib/drops.ts` | `DROPS`, `PARTNERS` | Drop calendar, live drop, mission band, partners |
| `src/lib/creators.ts` | `CREATORS` | Creators page and landing preview |

## Artwork is not public

Asset files live in **`/private/nft`**, outside `public/`, so they have no URL of their own:
they cannot be fetched, hotlinked, crawled or indexed directly. Every image in the UI is
requested through `/api/media/<assetId>`, which decides what the viewer may see:

| Viewer | Gets |
| --- | --- |
| Not signed in | 480px, watermarked, low quality |
| Signed in (cookie) | Clean image, up to 1000px |
| Designer with a review link | Clean image for that one asset (`?rt=<reviewToken>`) |
| Direct file URL | 404 — there is no such URL |

Responses are `Cache-Control: private` with `Vary: Cookie`, so a CDN or shared proxy can never
serve one viewer's clean image to another, and `X-Robots-Tag: noindex, noimageindex` keeps them
out of image search.

**How access is proven.** Signing in calls `POST /api/session`, which sets a signed HttpOnly
cookie (`src/lib/session.ts`); signing out clears it. Set `SESSION_SECRET` (16+ characters) in
the environment before deploying — otherwise a development secret is used and cookies could be
forged.

```bash
SESSION_SECRET="$(openssl rand -base64 32)" npm start
```

**What this does and does not stop.** It stops the original files being downloadable, scraped in
bulk, hotlinked or indexed — which is what makes this a sales platform rather than a public image
host. It cannot stop a signed-in person screenshotting what their own screen displays; no web
platform can. Rendering is deliberately capped at display size so what reaches the browser is
never the full-resolution master.

Because the cookie is issued after a browser-side password check, it currently proves "this
browser signed in through the app", not a verified identity. Moving the password check to the
server (below) closes that gap — the media route needs no changes.

To add images: put files in `private/nft/` and point an asset's `image` field at them
(`/nft/<file>.jpg`, resolved inside `private/`). Never put sellable artwork in `public/`.

## Current limits

Authentication and suggestions run in the browser via `localStorage`. Before production:

- Server-side auth, hashed passwords and roles enforced on the server
- Data served from an API so sales-only data never reaches the browser bundle
- Shared storage for suggestions, and signed, expiring review tokens
- A real collect/checkout flow and wallet connection (the "Collect" actions are not wired yet)
- Per-asset rules once buying exists, e.g. full-resolution downloads for the holder only

## Images

The 16 files in `private/nft/` come from Unsplash and are placeholders for commissioned work.
Creator portraits and works belong in `public/creators/` and must be licensed — see above.
