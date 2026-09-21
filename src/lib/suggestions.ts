"use client";

/* ============================================================
   Improvement suggestions left by NFT designers.

   Designers have no account. They open a scoped link
   (/review/<reviewToken>) and submit suggestions against one
   asset. The sales team reads them from the dashboard inbox.

   Demo storage is localStorage; swap readAll/append for API
   calls and the screens stay unchanged.
   ============================================================ */

import { useSyncExternalStore } from "react";
import { SEED_SUGGESTIONS, type Suggestion } from "./data";

const KEY = "nftp.suggestions";

let cache: Suggestion[] = SEED_SUGGESTIONS;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function load(): Suggestion[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(SEED_SUGGESTIONS));
      return SEED_SUGGESTIONS;
    }
    return JSON.parse(raw) as Suggestion[];
  } catch {
    return SEED_SUGGESTIONS;
  }
}

function save(list: Suggestion[]) {
  cache = list;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* keep the UI working even when storage is unavailable */
  }
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!hydrated) {
    hydrated = true;
    cache = load();
    queueMicrotask(emit);
  }
  return () => {
    listeners.delete(cb);
  };
}

const getSnapshot = () => cache;
const getServerSnapshot = () => SEED_SUGGESTIONS;

export function useSuggestions(designId?: string): Suggestion[] {
  const all = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const sorted = [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return designId ? sorted.filter((s) => s.designId === designId) : sorted;
}

export function addSuggestion(designId: string, author: string, body: string) {
  const entry: Suggestion = {
    id: `sg-${Date.now().toString(36)}`,
    designId,
    author: author.trim() || "Anonymous designer",
    createdAt: new Date().toISOString(),
    body: body.trim(),
    status: "Open",
  };
  save([entry, ...cache]);
  return entry;
}

export function setSuggestionStatus(id: string, status: Suggestion["status"]) {
  save(cache.map((s) => (s.id === id ? { ...s, status } : s)));
}
