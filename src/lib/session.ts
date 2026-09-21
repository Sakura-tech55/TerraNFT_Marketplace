/* ============================================================
   Server-side session cookie (HttpOnly, signed).

   This is what the media route checks before it hands out an
   artwork file. It proves the request comes from a browser that
   signed in through this app — it does NOT verify identity,
   because passwords are still checked in the browser
   (src/lib/auth.tsx). Replace the issuing step with a real
   server-side login before production; the media route needs no
   changes when you do.
   ============================================================ */

import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "tl.session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; /* 7 days */

const DEV_SECRET = "terra-ledger-dev-secret-change-me";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") {
    console.warn("[session] SESSION_SECRET is not set — using the development secret. Set it before deploying.");
  }
  return DEV_SECRET;
}

export type SessionPayload = { email: string; role: "sales" | "client"; exp: number };

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64url");
const unb64 = (s: string) => Buffer.from(s, "base64url").toString("utf8");
const sign = (body: string) => createHmac("sha256", secret()).update(body).digest("base64url");

export function createSessionToken(payload: Omit<SessionPayload, "exp">): string {
  const full: SessionPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE };
  const body = b64(JSON.stringify(full));
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;

  const expected = sign(body);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(unb64(body)) as SessionPayload;
    if (!payload?.exp || payload.exp * 1000 < Date.now()) return null;
    if (payload.role !== "sales" && payload.role !== "client") return null;
    return payload;
  } catch {
    return null;
  }
}
