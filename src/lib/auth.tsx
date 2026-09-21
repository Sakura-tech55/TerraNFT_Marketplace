"use client";

/* ============================================================
   Authentication (demo — runs entirely in the browser).
   Swap this for a real API later; screens only use useAuth().
   Session is read through useSyncExternalStore so server and
   client renders never disagree during hydration.

   Two roles sign in: the sales team and clients.
   NFT designers do NOT have accounts — they review work through
   a scoped link at /review/<token>. See src/lib/suggestions.ts.
   ============================================================ */

import { createContext, useContext, useCallback, useEffect, useSyncExternalStore } from "react";
import { seedFrom, passIdFrom, walletFrom } from "./hash";

/** Only these two roles can sign in. Designers never do. */
export type Role = "sales" | "client";

export type User = {
  email: string;
  name: string;
  role: Role;
  org: string;
  seed: number;
  passId: string;
  wallet: string;
  createdAt: string;
};

type Stored = User & { password: string };

const KEY = "nftp.users";
const SESSION = "nftp.session";

/* Default sign-in for the demo */
export const DEFAULT_EMAIL = "nft10@gmail.com";
export const DEFAULT_PASSWORD = "123456";

/* A second demo account so the client-side view can be checked too */
export const DEMO_CLIENT_EMAIL = "client@northgate.example";
export const DEMO_CLIENT_PASSWORD = "123456";

function makeUser(email: string, name: string, role: Role, org: string): User {
  const seed = seedFrom(email.trim().toLowerCase());
  return {
    email: email.trim().toLowerCase(),
    name: name.trim() || email.split("@")[0],
    role,
    org,
    seed,
    passId: passIdFrom(seed),
    wallet: walletFrom(seed),
    createdAt: new Date().toISOString(),
  };
}

function readUsers(): Stored[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const list: Stored[] = raw ? JSON.parse(raw) : [];
    let seeded = false;
    if (!list.some((u) => u.email === DEFAULT_EMAIL)) {
      list.push({
        ...makeUser(DEFAULT_EMAIL, "Avery Cole", "sales", "Terra Ledger"),
        password: DEFAULT_PASSWORD,
      });
      seeded = true;
    }
    if (!list.some((u) => u.email === DEMO_CLIENT_EMAIL)) {
      list.push({
        ...makeUser(DEMO_CLIENT_EMAIL, "Northgate Capital", "client", "Northgate Capital"),
        password: DEMO_CLIENT_PASSWORD,
      });
      seeded = true;
    }
    if (seeded) window.localStorage.setItem(KEY, JSON.stringify(list));
    return list;
  } catch {
    return [];
  }
}

function writeUsers(list: Stored[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* keep the UI working even when storage is unavailable */
  }
}

/* ---------- external store ---------- */

type Snapshot = { user: User | null; ready: boolean };

const SERVER_SNAPSHOT: Snapshot = { user: null, ready: false };
let snapshot: Snapshot = SERVER_SNAPSHOT;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function commit(user: User | null) {
  snapshot = { user, ready: true };
  try {
    if (user) window.localStorage.setItem(SESSION, JSON.stringify(user));
    else window.localStorage.removeItem(SESSION);
  } catch {
    /* noop */
  }
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!hydrated) {
    hydrated = true;
    let restored: User | null = null;
    try {
      readUsers();
      const raw = window.localStorage.getItem(SESSION);
      restored = raw ? (JSON.parse(raw) as User) : null;
    } catch {
      restored = null;
    }
    snapshot = { user: restored, ready: true };
    /* avoid notifying synchronously inside subscribe */
    queueMicrotask(emit);
  }
  return () => {
    listeners.delete(cb);
  };
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => SERVER_SNAPSHOT;

/* ---------- server session ----------
   Artwork lives outside /public and is served by /api/media, which
   requires this HttpOnly cookie. Sign-in issues it, sign-out clears it.
   Fire-and-forget: the UI must not block on it. */

function openServerSession(user: User) {
  void fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: user.email, role: user.role }),
  }).catch(() => {
    /* artwork falls back to the watermarked preview */
  });
}

function closeServerSession() {
  void fetch("/api/session", { method: "DELETE" }).catch(() => {});
}

/* ---------- Context ---------- */

type Ctx = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (email: string, password: string, name: string, org: string) => { ok: boolean; error?: string };
  logout: () => void;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const login: Ctx["login"] = useCallback((email, password) => {
    const list = readUsers();
    const found = list.find((u) => u.email === email.trim().toLowerCase());
    if (!found) return { ok: false, error: "No account found for that email address." };
    if (found.password !== password) return { ok: false, error: "That password is incorrect." };
    const { password: _pw, ...rest } = found;
    void _pw;
    commit(rest);
    openServerSession(rest);
    return { ok: true };
  }, []);

  /* Self-registration creates a client account. Sales seats are provisioned internally. */
  const register: Ctx["register"] = useCallback((email, password, name, org) => {
    const mail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail))
      return { ok: false, error: "That email address is not valid." };
    if (password.length < 6)
      return { ok: false, error: "Password must be at least 6 characters." };
    const list = readUsers();
    if (list.some((u) => u.email === mail))
      return { ok: false, error: "An account already exists for that email address." };
    const u = makeUser(mail, name, "client", org.trim() || "Independent");
    list.push({ ...u, password });
    writeUsers(list);
    commit(u);
    openServerSession(u);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    closeServerSession();
    commit(null);
  }, []);

  /* A restored browser session (localStorage) needs its cookie re-issued. */
  useEffect(() => {
    if (state.ready && state.user) openServerSession(state.user);
  }, [state.ready, state.user]);

  return (
    <AuthCtx.Provider value={{ user: state.user, ready: state.ready, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): Ctx {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth must be called inside AuthProvider");
  return c;
}
