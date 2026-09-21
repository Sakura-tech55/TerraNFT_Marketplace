import Link from "next/link";
import { Logo } from "./Logo";

export function SiteFooter({ note }: { note?: string }) {
  return (
    <footer className="site">
      <div className="shell">
        <div className="foot-grid">
          <div>
            <Logo />
            <p style={{ color: "var(--ink-3)", fontSize: 14, maxWidth: "34ch", margin: "16px 0 0" }}>
              Collect, sell and launch NFTs — with new releases every season from long-term partners.
            </p>
          </div>
          <div>
            <h4>Marketplace</h4>
            <ul>
              <li><Link href="/explore">Explore assets</Link></li>
              <li><Link href="/drops">Drop calendar</Link></li>
              <li><Link href="/creators">Top creators</Link></li>
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul>
              <li><Link href="/register">Create account</Link></li>
              <li><Link href="/login">Sign in</Link></li>
              <li><Link href="/dashboard">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4>Partners</h4>
            <ul>
              <li><Link href="/drops#partners">Launch with us</Link></li>
              <li><Link href="/drops#how">How drops work</Link></li>
            </ul>
          </div>
        </div>
        <div className="foot-base">
          <span>© 2026 Terra Ledger</span>
          <span>{note ?? "Listings, prices and accounts on this build are demo data."}</span>
        </div>
      </div>
    </footer>
  );
}
