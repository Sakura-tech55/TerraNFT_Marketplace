/* Landing hero: a central NFT token with coins orbiting on three rings,
   plus floating trade tickets. Pure SVG + CSS. */

import { Coin, Token, type CoinGlyph, type CoinTone } from "./Coin";

type Orbiter = { start: number; tone: CoinTone; glyph: CoinGlyph; size: number };

const RINGS: { inset: string; dur: string; items: Orbiter[] }[] = [
  {
    inset: "20%",
    dur: "26s",
    items: [
      { start: 20, tone: "lime", glyph: "ledger", size: 64 },
      { start: 200, tone: "cyan", glyph: "gem", size: 50 },
    ],
  },
  {
    inset: "9%",
    dur: "40s",
    items: [
      { start: 110, tone: "gold", glyph: "spark", size: 72 },
      { start: 250, tone: "pink", glyph: "face", size: 56 },
      { start: 330, tone: "violet", glyph: "hex", size: 46 },
    ],
  },
  {
    inset: "0%",
    dur: "60s",
    items: [
      { start: 60, tone: "iri", glyph: "brush", size: 58 },
      { start: 170, tone: "lime", glyph: "play", size: 44 },
      { start: 290, tone: "gold", glyph: "home", size: 52 },
    ],
  },
];

export function HeroOrbit() {
  return (
    <div className="orbit" role="img" aria-label="Coins and NFT tokens orbiting the Terra Ledger marketplace">
      {RINGS.map((ring, ri) => (
        <div key={ri}>
          <div className={`orbit-ring${ri === 1 ? " solid" : ""}`} style={{ "--inset": ring.inset } as React.CSSProperties} />
          {ring.items.map((it, i) => (
            <div
              key={i}
              className="orbit-track"
              style={{ "--inset": ring.inset, "--dur": ring.dur, "--start": `${it.start}deg` } as React.CSSProperties}
            >
              <div className="orbit-item">
                <Coin size={it.size} tone={it.tone} glyph={it.glyph} uid={`o${ri}${i}`} className="spin" />
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="orbit-core">
        <Token size={220} tone="iri" uid="core" className="float-a" />
      </div>

      <div className="ticket float-b" style={{ top: "12%", left: "-2%" }}>
        <Coin size={30} tone="lime" glyph="ledger" uid="tk1" />
        <span>
          <b>
            2.44 ETH <span className="up">↑</span>
          </b>
          <small>Halo Fragment · collected</small>
        </span>
      </div>
      <div className="ticket float-c" style={{ bottom: "16%", right: "-3%" }}>
        <Coin size={30} tone="cyan" glyph="spark" uid="tk2" />
        <span>
          <b>New drop</b>
          <small>Bracket Finals · Sep 24</small>
        </span>
      </div>
      <div className="ticket float-a" style={{ bottom: "4%", left: "8%" }}>
        <Coin size={30} tone="gold" glyph="gem" uid="tk3" />
        <span>
          <b>
            +18.2% <span className="up">volume</span>
          </b>
          <small>last 24 hours</small>
        </span>
      </div>
    </div>
  );
}
