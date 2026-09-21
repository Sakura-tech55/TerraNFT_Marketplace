/* Issues and clears the HttpOnly session cookie used to gate artwork.
   Called by src/lib/auth.tsx after a successful sign-in / sign-out. */

import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken } from "@/lib/session";

export async function POST(request: Request) {
  let body: { email?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = body.role === "sales" ? "sales" : "client";
  if (!email) return Response.json({ ok: false, error: "Missing email" }, { status: 400 });

  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken({ email, role }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return Response.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}
