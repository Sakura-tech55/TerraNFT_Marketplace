/* Create an account: email, password, a display name, the terms. Open to anyone.
   The account is signed in straight away. */

import { cookies } from "next/headers";
import { createUser } from "@/lib/repo";
import { hashPassword, passwordProblem } from "@/lib/password";
import { SESSION_COOKIE, MissingSecretError, createSessionToken, sessionCookie } from "@/lib/session";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";
import { TERMS_VERSION } from "@/lib/site";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const bad = (error: string, status = 400) => Response.json({ ok: false, error }, { status });

export async function POST(request: Request) {
  const limited = rateLimit(`register:${clientIp(request.headers)}`, 5, 10 * 60_000);
  if (!limited.ok) return tooMany(limited.retryAfterSeconds);

  let body: { email?: string; password?: string; displayName?: string; acceptTerms?: boolean };
  try {
    body = await request.json();
  } catch {
    return bad("Invalid body");
  }

  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");
  const displayName = String(body.displayName ?? "").trim().slice(0, 60) || null;

  if (!EMAIL.test(email)) return bad("Enter a valid email address.");
  const weak = passwordProblem(password);
  if (weak) return bad(weak);
  if (body.acceptTerms !== true) return bad("Accept the terms of sale to create an account.");

  const user = await createUser({ email, passwordHash: await hashPassword(password), displayName, termsVersion: TERMS_VERSION });
  if (!user) return bad("An account with that email already exists. Sign in instead.", 409);

  try {
    (await cookies()).set(SESSION_COOKIE, createSessionToken({ sub: user.id }), sessionCookie);
  } catch (e) {
    if (e instanceof MissingSecretError) return bad("Sign-in is unavailable: server not configured.", 503);
    throw e;
  }
  return Response.json({ ok: true, user });
}
