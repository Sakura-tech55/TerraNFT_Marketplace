import { Suspense } from "react";
import type { Metadata } from "next";
import { TopBar } from "@/components/TopBar";
import { SiteFooter } from "@/components/SiteFooter";
import { Gallery } from "@/components/Gallery";

export const metadata: Metadata = {
  title: "Explore assets — Terra Ledger",
  description: "Browse, search and collect NFT assets across entertainment, art, real estate and avatars.",
};

export default function ExplorePage() {
  return (
    <>
      <TopBar />
      <main>
        <header className="page-head shell">
          <p className="kicker">Explore</p>
          <h1>Find your next asset</h1>
          <p>Every listing on the market, with its creator, price and how many collectors love it.</p>
        </header>
        {/* useSearchParams needs a Suspense boundary on a prerendered route */}
        <Suspense fallback={<div className="shell"><p className="result-count">Loading assets…</p></div>}>
          <Gallery />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
