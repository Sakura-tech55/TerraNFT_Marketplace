"use client";

/* RED — highest price achieved today, hour by hour */

import { useState } from "react";
import { TOP_SALES_TODAY, usd } from "@/lib/data";

const W = 520;
const H = 206;
const L = 40;
const R = 14;
const T = 18;
const B = 34;
const RED = "var(--sig-red)";

export function PriceChart() {
  const data = TOP_SALES_TODAY;
  const peakIdx = data.reduce((b, d, i) => (d.eth > data[b].eth ? i : b), 0);
  const [hover, setHover] = useState<number | null>(null);
  const active = hover ?? peakIdx;
  const d0 = data[active];

  const yMax = 30;
  const px = (i: number) => L + (i / (data.length - 1)) * (W - L - R);
  const py = (v: number) => H - B - (v / yMax) * (H - B - T);

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(d.eth).toFixed(1)}`).join(" ");
  const area = `${line} L${px(data.length - 1).toFixed(1)},${H - B} L${px(0).toFixed(1)},${H - B} Z`;

  return (
    <>
      <div className="panel-body" style={{ paddingBottom: 6 }}>
        <p className="chart-figure" style={{ color: RED }}>
          {d0.eth.toFixed(2)} ETH
        </p>
        <p className="label" style={{ letterSpacing: ".1em" }}>
          {d0.hour}:00 UTC · {d0.name} · {usd(d0.eth)}
        </p>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="chartsvg"
        role="img"
        aria-label="Highest sale price by hour today. Peak of 27.45 ETH on Mercer Block at 16:00 UTC."
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="redfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff4d4d" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#ff4d4d" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 10, 20, 30].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={py(v)} y2={py(v)} stroke="var(--line)" strokeWidth="1" />
            <text x={L - 8} y={py(v) + 3.5} fontSize="9.5" fill="var(--ink-4)" textAnchor="end">
              {v}
            </text>
          </g>
        ))}

        <path d={area} fill="url(#redfill)" />
        <path d={line} fill="none" stroke={RED} strokeWidth="2" strokeLinejoin="round" />

        <line
          x1={px(active)}
          x2={px(active)}
          y1={T - 4}
          y2={H - B}
          stroke="var(--line-2)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <circle cx={px(active)} cy={py(d0.eth)} r="5" fill={RED} stroke="var(--panel)" strokeWidth="2" />

        {data.map((d, i) => (
          <g key={d.hour}>
            {i % 2 === 0 && (
              <text x={px(i)} y={H - B + 16} fontSize="9.5" fill="var(--ink-4)" textAnchor="middle">
                {d.hour}
              </text>
            )}
            <rect
              x={px(i) - 16}
              y={T - 8}
              width="32"
              height={H - B - T + 12}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              style={{ cursor: "pointer" }}
            />
          </g>
        ))}
        <text x={L} y={H - 4} fontSize="9" fill="var(--ink-4)" letterSpacing="1.4">
          Hour (UTC)
        </text>
        <text x={W - R} y={H - 4} fontSize="9" fill="var(--ink-4)" textAnchor="end" letterSpacing="1.4">
          ETH
        </text>
      </svg>
      <p className="chart-note">
        Highest sale settled in each hour. Mercer Block set today&rsquo;s high at 27.45 ETH at 16:00 UTC.
      </p>
    </>
  );
}
