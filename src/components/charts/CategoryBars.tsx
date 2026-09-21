"use client";

/* Designs registered in the system, by category */

import { CATEGORY_STATS } from "@/lib/data";

export function CategoryBars() {
  const max = Math.max(...CATEGORY_STATS.map((c) => c.designs));
  const total = CATEGORY_STATS.reduce((s, c) => s + c.designs, 0);
  return (
    <>
      <div className="panel-body" style={{ paddingBottom: 4 }}>
        <p className="chart-figure">{total.toLocaleString("en-US")}</p>
        <p className="label" style={{ letterSpacing: ".1em" }}>
          Registered designs · four categories
        </p>
      </div>
      <div className="panel-body" style={{ paddingTop: 8 }}>
        {CATEGORY_STATS.map((c) => (
          <div className="catbar" key={c.category}>
            <span className="catbar-name">{c.category}</span>
            <span className="catbar-track">
              <span className="catbar-fill" style={{ width: `calc(${(c.designs / max) * 100}% - 2px)` }} />
            </span>
            <span className="catbar-val">{c.designs.toLocaleString("en-US")}</span>
          </div>
        ))}
      </div>
      <p className="chart-note">
        Real estate is one asset per property, so the count is low — but it is 39.6% of lifetime volume.
      </p>
    </>
  );
}
