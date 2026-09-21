"use client";

/* Designer feedback, as seen by the sales team. */

import { useState } from "react";
import { DESIGNS } from "@/lib/data";
import { useSuggestions, setSuggestionStatus } from "@/lib/suggestions";

const AGO = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
};

export function SuggestionsInbox() {
  const all = useSuggestions();
  const [onlyOpen, setOnlyOpen] = useState(false);
  const list = onlyOpen ? all.filter((s) => s.status === "Open") : all;
  const openCount = all.filter((s) => s.status === "Open").length;

  return (
    <>
      <div className="panel-head">
        <div className="chart-title">
          <b>Designer suggestions</b>
        </div>
        <div className="filters">
          <button className="chip" data-on={!onlyOpen} onClick={() => setOnlyOpen(false)}>
            All {all.length}
          </button>
          <button className="chip" data-on={onlyOpen} onClick={() => setOnlyOpen(true)}>
            Open {openCount}
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="panel-body">
          <p style={{ margin: 0, color: "var(--ink-3)", fontSize: 13.5 }}>
            Nothing open. New suggestions arrive here when a designer submits one from their
            review link.
          </p>
        </div>
      ) : (
        <ul className="inbox">
          {list.map((s) => {
            const design = DESIGNS.find((d) => d.id === s.designId);
            return (
              <li key={s.id}>
                <div className="inbox-top">
                  <span className="inbox-who">
                    <b>{s.author}</b>
                    <span className="inbox-asset">
                      {s.designId} · {design?.name ?? "Unknown asset"}
                    </span>
                  </span>
                  <span className={`pill pill-${s.status.toLowerCase()}`}>{s.status}</span>
                </div>
                <p>{s.body}</p>
                <div className="inbox-actions">
                  <span className="label" style={{ marginRight: 4 }}>{AGO(s.createdAt)}</span>
                  {s.status !== "Acknowledged" && (
                    <button className="mini" onClick={() => setSuggestionStatus(s.id, "Acknowledged")}>
                      Acknowledge
                    </button>
                  )}
                  {s.status !== "Applied" && (
                    <button className="mini" onClick={() => setSuggestionStatus(s.id, "Applied")}>
                      Mark applied
                    </button>
                  )}
                  {s.status !== "Open" && (
                    <button className="mini" onClick={() => setSuggestionStatus(s.id, "Open")}>
                      Reopen
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/* Assets waiting on a designer, with the link to send them. */
export function ReviewLinks() {
  const pending = DESIGNS.filter((d) => d.status !== "Live");
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (token: string) => {
    const url = `${window.location.origin}/review/${token}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard may be blocked; the link is visible either way */
    }
    setCopied(token);
    window.setTimeout(() => setCopied(null), 1800);
  };

  return (
    <>
      <div className="panel-head">
        <div className="chart-title">
          <b>Awaiting the designer</b>
        </div>
        <span className="label">{pending.length} assets</span>
      </div>
      <div className="panel-body" style={{ paddingBottom: 8 }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)" }}>
          Designers have no account here. Send them the link for the asset and they can review the
          work and reply with suggestions.
        </p>
      </div>
      {pending.map((d) => (
        <div className="linkrow" key={d.id}>
          <span className={`status status-${d.status.replace(/\s/g, "-").toLowerCase()}`}>
            {d.status}
          </span>
          <code>/review/{d.reviewToken}</code>
          <button className="mini" onClick={() => copy(d.reviewToken)}>
            {copied === d.reviewToken ? "Copied" : "Copy"}
          </button>
          <a className="mini" href={`/review/${d.reviewToken}`} target="_blank" rel="noopener noreferrer">
            Open
          </a>
        </div>
      ))}
    </>
  );
}
