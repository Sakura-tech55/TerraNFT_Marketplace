/* ============================================================
   Server-side session cookie (HttpOnly, signed).

   Issued only after the password has been checked (or the
   account created), and carries the account id. The media route
   checks this cookie before handing out artwork.
   ============================================================ */

import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "tl.session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; /* 7 days */

/* Development only. This value is public (it is in the repository), so a
   production server must never sign or accept cookies with it. */
const DEV_SECRET = "terra-ledger-dev-secret-change-me";

export class MissingSecretError extends Error {
  constructor() {
    super("SESSION_SECRET is not set (16+ characters required in production).");
  }
}

function secret(): string {
  /* DEPLOY_SESSION_SECRET is generated per deployment by the build when SESSION_SECRET
     is not set (scripts/setup.mjs, next.config.ts) */
  const s = process.env.SESSION_SECRET || process.env.DEPLOY_SESSION_SECRET;
  if (s && s.length >= 16) return s;
  /* Fail closed: without a real secret, production issues no sessions and accepts none. */
  if (process.env.NODE_ENV === "production") throw new MissingSecretError();
  return DEV_SECRET;
}

/* The role is deliberately not in the cookie: it is read from the database on
   every request (src/lib/viewer.ts), so promoting or demoting a wallet takes
   effect at once rather than when the cookie expires. */
export type SessionPayload = {
  /** Id of the signed-in account (users.id). */
  sub: string;
  /** Issued at, in milliseconds — compared with users.sessions_valid_after. */
  iat: number;
  exp: number;
};

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64url");
const unb64 = (s: string) => Buffer.from(s, "base64url").toString("utf8");
const sign = (body: string) => createHmac("sha256", secret()).update(body).digest("base64url");

export function createSessionToken(payload: { sub: string }, now = Date.now()): string {
  const full: SessionPayload = { sub: payload.sub, iat: now, exp: Math.floor(now / 1000) + SESSION_MAX_AGE };
  const body = b64(JSON.stringify(full));
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;

  let expected: string;
  try {
    expected = sign(body);
  } catch {
    return null; /* no secret configured: treat every cookie as invalid */
  }
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(unb64(body)) as SessionPayload;
    if (!payload?.exp || payload.exp * 1000 < Date.now()) return null;
    if (typeof payload.iat !== "number" || !payload.sub) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Cookie attributes for the session: never readable by scripts, sent only to this site. */
export const sessionCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
