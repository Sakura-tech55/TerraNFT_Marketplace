"use client";

import { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, DESIGNS, usd, type Category } from "@/lib/data";
import { assetSrc } from "@/lib/media";

type Sort = "trending" | "newest" | "price-asc" | "price-desc";

const SORTS: Record<Sort, { label: string; fn: (a: (typeof DESIGNS)[number], b: (typeof DESIGNS)[number]) => number }> = {
  trending: { label: "Trending", fn: (a, b) => b.likes - a.likes },
  newest: { label: "Newest", fn: (a, b) => b.mintedAt.localeCompare(a.mintedAt) },
  "price-asc": { label: "Price: low to high", fn: (a, b) => a.priceEth - b.priceEth },
  "price-desc": { label: "Price: high to low", fn: (a, b) => b.priceEth - a.priceEth },
};

export function Gallery() {
  const params = useSearchParams();
  const initial = params.get("category");
  const [cat, setCat] = useState<Category | "All">(
    CATEGORIES.includes(initial as Category) ? (initial as Category) : "All",
  );
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("trending");

  const needle = q.trim().toLowerCase();
  const shown = DESIGNS.filter((d) => d.status === "Live")
    .filter((d) => cat === "All" || d.category === cat)
    .filter((d) => !needle || `${d.name} ${d.studio} ${d.id}`.toLowerCase().includes(needle))
    .sort(SORTS[sort].fn);

  return (
    <section className="shell" style={{ paddingBottom: 80 }}>
      <div className="toolbar">
        <label className="search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ color: "var(--ink-3)" }}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search assets, creators or IDs" aria-label="Search assets" />
        </label>
        <div className="filters">
          {(["All", ...CATEGORIES] as const).map((c) => (
            <button key={c} className="chip" data-on={cat === c} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort assets">
          {(Object.keys(SORTS) as Sort[]).map((s) => (
            <option key={s} value={s}>
              {SORTS[s].label}
            </option>
          ))}
        </select>
      </div>

      <p className="result-count">
        {shown.length} {shown.length === 1 ? "asset" : "assets"} available
      </p>

      {shown.length === 0 ? (
        <div className="empty">No assets match that search. Try another name or category.</div>
      ) : (
        <div className="grid">
          {shown.map((d) => (
            <article className="card" key={d.id}>
              <div className="card-img">
                <Image
                  src={assetSrc(d.id)}
                  alt={`${d.name}, an NFT by ${d.designer}`}
                  fill
                  unoptimized
                  sizes="(max-width:480px) 100vw, (max-width:780px) 50vw, (max-width:1100px) 33vw, 25vw"
                />
                <span className="card-id">{d.id}</span>
                <span className="card-cat">{d.category}</span>
              </div>
              <div className="card-body">
                <h3>{d.name}</h3>
                <p className="card-artist">{d.studio}</p>
                <div className="card-foot">
                  <span>
                    <span className="label" style={{ display: "block", letterSpacing: ".08em" }}>Price</span>
                    <span className="card-price">{d.priceEth.toFixed(2)} ETH</span>
                    <span className="mono" style={{ display: "block", fontSize: 11, color: "var(--ink-4)" }}>
                      {usd(d.priceEth)}
                    </span>
                  </span>
                  <span className="card-likes">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 21s-8-4.9-8-10.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.6C20 16.1 12 21 12 21z" />
                    </svg>
                    {(d.likes / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
