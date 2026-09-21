"use client";

import Link from "next/link";
import { PassCanvas } from "./PassCanvas";
import { Logo } from "./Logo";
import { seedFrom, passIdFrom, walletFrom } from "@/lib/hash";

export function AuthArtPanel({
  email,
  handle,
  caption,
}: {
  email: string;
  handle: string;
  caption: string;
}) {
  const key = (email || "unclaimed").trim().toLowerCase();
  const seed = seedFrom(key);

  return (
    <aside className="auth-art">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <Link href="/">
          <Logo />
        </Link>
        <span className="label">Ledger Pass</span>
      </div>

      <div className="passframe">
        <div className="passcard">
          <PassCanvas seed={seed} />
          <div className="passcard-meta">
            <div style={{ marginBottom: 10 }}>
              <div className="k">Holder</div>
              <div className="v">{handle || email || "— not set —"}</div>
            </div>
            <div className="passcard-row">
              <div>
                <div className="k">Pass ID</div>
                <div className="v">{email ? passIdFrom(seed) : "LP-————-————"}</div>
              </div>
              <div>
                <div className="k">Wallet</div>
                <div className="v">{email ? walletFrom(seed) : "0x————…————"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mono" style={{ fontSize: 10.5, color: "var(--ink-4)", lineHeight: 1.8, margin: 0, maxWidth: "46ch" }}>
        {caption}
      </p>
    </aside>
  );
}
