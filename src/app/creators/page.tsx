import type { Metadata } from "next";
import Image from "next/image";
import { TopBar } from "@/components/TopBar";
import { SiteFooter } from "@/components/SiteFooter";
import { TokenArt } from "@/components/visuals/TokenArt";
import { CREATORS, CREATORS_UPDATED } from "@/lib/creators";

export const metadata: Metadata = {
  title: "Top 10 NFT creators — Terra Ledger",
  description: "The ten creators who defined NFTs, from Beeple to FEWOCiOUS — with their landmark works.",
};

export default function CreatorsPage() {
  return (
    <>
      <TopBar />
      <main className="shell">
        <header className="page-head">
          <p className="kicker">Top 10 creators</p>
          <h1>The artists who defined NFTs</h1>
          <p>
            From the world&rsquo;s best-selling digital artist to the pioneers of generative art —
            the ten creators every collector should know, and the works that made their names.
          </p>
          <nav className="rankrail" aria-label="Jump to creator">
            {CREATORS.map((c) => (
              <a key={c.slug} href={`#${c.slug}`}>
                <i>{c.rank}</i>
                {c.name}
              </a>
            ))}
          </nav>
        </header>

        {CREATORS.map((c) => (
          <article className="creator" id={c.slug} key={c.slug} data-first={c.rank === 1}>
            <div className="creator-portrait">
              {c.photo ? (
                <Image src={c.photo} alt={`Portrait of ${c.name}`} fill sizes="(max-width:900px) 100vw, 34vw" />
              ) : (
                <>
                  <TokenArt seed={c.slug} hue={c.hue} variant="portrait" label={`${c.name} — portrait placeholder`} />
                  <span className="ph-note">Portrait placeholder · licensed photo pending</span>
                </>
              )}
              <span className="creator-rank">{String(c.rank).padStart(2, "0")}</span>
            </div>

            <div>
              {c.rank === 1 && <span className="crown">★ World&rsquo;s No. 1 NFT artist</span>}
              <div className="creator-top">
                <div>
                  <h2>{c.name}</h2>
                  <p className="creator-sub">
                    {[c.realName, c.base, c.known].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="creator-headline">
                  <b className="iri-text">{c.headline.value}</b>
                  <small>{c.headline.caption}</small>
                </div>
              </div>

              <p className="creator-bio">{c.bio}</p>

              <p className="label" style={{ margin: "0 0 12px" }}>Notable works</p>
              <div className="works">
                {c.works.map((w) => (
                  <div className="work" key={w.title}>
                    <div className="work-art">
                      {w.image ? (
                        <Image src={w.image} alt={`${w.title} by ${c.name}`} fill sizes="(max-width:600px) 50vw, 220px" />
                      ) : (
                        <TokenArt seed={`${c.slug}:${w.title}`} hue={c.hue} label={`${w.title} — artwork placeholder`} />
                      )}
                    </div>
                    <div className="work-body">
                      <span className="yr">{w.year}</span>
                      <h3>{w.title}</h3>
                      <p>{w.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}

        <p className="disclaimer">
          Editorial feature, updated {CREATORS_UPDATED}. Ranking reflects landmark sales and influence
          and is compiled from public reporting. Terra Ledger is not affiliated with or endorsed by
          these creators. Portraits and artworks are shown as placeholders until licensed images are
          supplied.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
