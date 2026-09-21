import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroOrbit } from "@/components/visuals/HeroOrbit";
import { Coin, Token, type CoinGlyph, type CoinTone } from "@/components/visuals/Coin";
import { TokenArt } from "@/components/visuals/TokenArt";
import { CATEGORY_STATS, DESIGNS, SALES_KPIS } from "@/lib/data";
import { CREATORS } from "@/lib/creators";
import { DROPS, fmtDate, partnerOf } from "@/lib/drops";

const FLOW: { glyph: CoinGlyph; tone: CoinTone; title: string; text: string }[] = [
  { glyph: "brush", tone: "cyan", title: "Create", text: "Creators design with our partner brands" },
  { glyph: "hex", tone: "violet", title: "Mint", text: "Every piece is minted with its full history" },
  { glyph: "spark", tone: "pink", title: "Drop", text: "New releases launch each season" },
  { glyph: "gem", tone: "gold", title: "Collect", text: "Collectors own the asset and its story" },
  { glyph: "ledger", tone: "lime", title: "Trade", text: "Resell on the market at any time" },
];

const CATS: { name: string; glyph: CoinGlyph; tone: CoinTone }[] = [
  { name: "Entertainment", glyph: "play", tone: "cyan" },
  { name: "Art", glyph: "brush", tone: "violet" },
  { name: "Real estate", glyph: "home", tone: "gold" },
  { name: "Avatar", glyph: "face", tone: "pink" },
];

function CoinStack({ c1, c2, n = 5 }: { c1: string; c2: string; n?: number }) {
  return (
    <div className="stack" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <i key={i} style={{ bottom: i * 11, left: i % 2 ? 4 : 0, "--c1": c1, "--c2": c2 } as React.CSSProperties} />
      ))}
    </div>
  );
}

export default function Home() {
  const assets = CATEGORY_STATS.reduce((s, c) => s + c.designs, 0);
  const creators = CATEGORY_STATS.reduce((s, c) => s + c.designers, 0);
  const volume = CATEGORY_STATS.reduce((s, c) => s + c.volumeEth, 0);
  const collectors = SALES_KPIS.find((k) => k.label === "Active holders")?.value ?? "—";
  const live = DESIGNS.filter((d) => d.status === "Live");
  const seasons = [...DROPS.filter((d) => d.status === "Live"), ...DROPS.filter((d) => d.status === "Upcoming")].slice(0, 4);

  const ticker = live.map((d) => ({
    id: d.id,
    name: d.name,
    price: d.priceEth.toFixed(2),
    change: ((d.likes % 97) / 10 - 2.5).toFixed(1),
  }));

  return (
    <>
      <TopBar />

      <main>
        {/* ── Hero ── */}
        <section className="hero2 shell">
          <div className="hero2-grid">
            <div>
              <span className="eyebrow">
                <i /> New drops every season
              </span>
              <h1>
                Collect.
                <br />
                Sell.
                <br />
                <span className="iri-text">Launch.</span>
              </h1>
              <p className="hero2-lede">
                The NFT marketplace where collectors trade digital assets and new creations are
                released with the partners who shape them.
              </p>
              <div className="hero2-cta">
                <Link href="/explore" className="btn btn-primary btn-lg">
                  Explore the market
                </Link>
                <Link href="/drops" className="btn btn-lg">
                  Upcoming drops
                </Link>
              </div>
              <div className="hero2-proof">
                <span className="dots">
                  <Coin size={34} tone="lime" glyph="gem" uid="p1" />
                  <Coin size={34} tone="violet" glyph="face" uid="p2" />
                  <Coin size={34} tone="gold" glyph="spark" uid="p3" />
                </span>
                <span>
                  <b>{collectors}</b> collectors · <b>{creators}</b> creators
                </span>
              </div>
            </div>
            <HeroOrbit />
          </div>
        </section>

        {/* ── Live ticker ── */}
        <div className="ticker" aria-label="Live market prices">
          <div className="ticker-track">
            {[0, 1].map((copy) => (
              <div key={copy} style={{ display: "flex" }} aria-hidden={copy === 1}>
                {ticker.map((t) => (
                  <span className="ticker-item" key={t.id}>
                    <Coin size={18} tone="lime" glyph="ledger" uid={`tick-${copy}-${t.id}`} />
                    <b>{t.name}</b> {t.price} ETH
                    <span className={Number(t.change) >= 0 ? "up" : ""}>
                      {Number(t.change) >= 0 ? "▲" : "▼"} {Math.abs(Number(t.change))}%
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── How it moves ── */}
        <section className="section shell">
          <div className="section-head" style={{ justifyContent: "center", textAlign: "center" }}>
            <div>
              <p className="kicker">How it works</p>
              <h2>From an idea to your wallet</h2>
            </div>
          </div>
          <div className="flow">
            {FLOW.map((s, i) => (
              <div className="flow-step" key={s.title}>
                <div className="flow-icon">
                  <Coin size={76} tone={s.tone} glyph={s.glyph} uid={`flow${i}`} className={i % 2 ? "float-b" : "float-a"} />
                </div>
                <span className="n">0{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Numbers as coins ── */}
        <section className="shell" style={{ paddingBottom: "clamp(56px,8vw,110px)" }}>
          <div className="coinstats">
            <div className="coinstat">
              <CoinStack c1="#f2ffb0" c2="#6f8f00" />
              <b>{assets.toLocaleString("en-US")}</b>
              <span>Assets minted</span>
            </div>
            <div className="coinstat">
              <CoinStack c1="#d9c8ff" c2="#3b1d8f" n={6} />
              <b>{collectors}</b>
              <span>Active collectors</span>
            </div>
            <div className="coinstat">
              <div className="bars" aria-hidden="true">
                {[34, 52, 41, 66, 58, 80, 72, 100].map((h, i) => (
                  <i key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
              <b>{Math.round(volume).toLocaleString("en-US")}</b>
              <span>ETH traded, lifetime</span>
            </div>
            <div className="coinstat">
              <CoinStack c1="#fff1b8" c2="#a8680a" n={4} />
              <b>{creators}</b>
              <span>Creators on the platform</span>
            </div>
          </div>
        </section>

        {/* ── Categories ── */}
        <section className="shell" style={{ paddingBottom: "clamp(56px,8vw,110px)" }}>
          <div className="section-head">
            <div>
              <p className="kicker">Categories</p>
              <h2>Four markets, one ledger</h2>
            </div>
            <Link href="/explore" className="btn">
              Browse all assets →
            </Link>
          </div>
          <div className="cats">
            {CATS.map((c) => {
              const stat = CATEGORY_STATS.find((s) => s.category === c.name);
              return (
                <Link key={c.name} href={`/explore?category=${encodeURIComponent(c.name)}`} className="cat-tile">
                  <Coin size={64} tone={c.tone} glyph={c.glyph} uid={`cat-${c.glyph}`} className="spin" />
                  <span className="arrow">↗</span>
                  <h3>{c.name}</h3>
                  <span>{stat?.designs.toLocaleString("en-US")} assets</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Mission: releases with long-term partners ── */}
        <section className="shell" style={{ paddingBottom: "clamp(56px,8vw,110px)" }}>
          <div className="mission">
            <div className="mission-in">
              <div>
                <p className="kicker">Our mission</p>
                <h2>New creations, released with partners who stay.</h2>
                <p>
                  We don&rsquo;t list and leave. Every client partner launches season after season
                  on Terra Ledger, so collectors always have something new to discover.
                </p>
                <Link href="/drops" className="btn btn-primary">
                  See the drop calendar
                </Link>
              </div>
              <div className="seasons">
                {seasons.map((d) => {
                  const p = partnerOf(d.partner);
                  return (
                    <div className="season" key={d.id} data-live={d.status === "Live"}>
                      <Coin size={48} tone={p?.tone ?? "lime"} glyph="ledger" uid={`ms-${d.id}`} />
                      <span>
                        <b>{d.title}</b>
                        <small>
                          {p?.name} · {d.season}
                        </small>
                      </span>
                      <span className="when">{d.status === "Live" ? "● Live now" : fmtDate(d.date)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Creators teaser ── */}
        <section className="shell" style={{ paddingBottom: "clamp(56px,8vw,110px)" }}>
          <div className="section-head">
            <div>
              <p className="kicker">Top creators</p>
              <h2>The artists who defined NFTs</h2>
            </div>
            <Link href="/creators" className="btn">
              See the top 10 →
            </Link>
          </div>
          <div className="ctease">
            {CREATORS.slice(0, 3).map((c) => (
              <Link key={c.slug} href={`/creators#${c.slug}`}>
                <TokenArt seed={c.slug} hue={c.hue} variant="portrait" label={`${c.name} portrait placeholder`} />
                <span className="ctease-shade" />
                <span className="ctease-meta">
                  <span className="r">{String(c.rank).padStart(2, "0")}</span>
                  <h3>{c.name}</h3>
                  <p>
                    {c.headline.value} · {c.headline.caption}
                  </p>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Final call to action ── */}
        <section className="shell">
          <div className="cta-band">
            <Coin size={96} tone="gold" glyph="spark" uid="cta1" className="deco float-a" style={{ top: "12%", left: "6%" }} />
            <Token size={110} tone="violet" uid="cta2" className="deco float-b" style={{ bottom: "10%", right: "6%" }} />
            <Coin size={60} tone="cyan" glyph="gem" uid="cta3" className="deco float-c" style={{ top: "18%", right: "16%" }} />
            <h2>Start your collection today</h2>
            <p>Create a free account and your Ledger Pass is issued instantly.</p>
            <Link href="/register" className="btn btn-primary btn-lg">
              Get started
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
