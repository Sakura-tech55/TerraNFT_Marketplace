"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthArtPanel } from "@/components/AuthArtPanel";
import {
  useAuth,
  DEFAULT_EMAIL,
  DEFAULT_PASSWORD,
  DEMO_CLIENT_EMAIL,
  DEMO_CLIENT_PASSWORD,
} from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, ready } = useAuth();

  /* Default sign-in is filled in for the demo */
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = login(email, password);
    if (!r.ok) {
      setError(r.error ?? "Sign-in failed.");
      setBusy(false);
      return;
    }
    router.push("/dashboard");
  };

  const fillDemo = (m: string, p: string) => {
    setEmail(m);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="auth">
      <AuthArtPanel
        email={email}
        handle=""
        caption="Your Ledger Pass is generated from your email address. The same address restores the same artwork on any device, so the pass itself identifies the account."
      />

      <main className="auth-form">
        <div className="auth-form-in">
          <p className="label">Sign in</p>
          <h1>Unlock your pass</h1>
          <p className="sub">
            For the Terra Ledger sales team and its clients. NFT designers do not sign in — they
            work from a review link instead.
          </p>

          {error && <p className="err">{error}</p>}

          <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? "Unlocking…" : "Sign in"}
            </button>
          </form>

          <div className="authswap">
            <p style={{ margin: "0 0 10px" }}>Demo accounts</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="mini" onClick={() => fillDemo(DEFAULT_EMAIL, DEFAULT_PASSWORD)}>
                Sales — {DEFAULT_EMAIL}
              </button>
              <button className="mini" onClick={() => fillDemo(DEMO_CLIENT_EMAIL, DEMO_CLIENT_PASSWORD)}>
                Client — {DEMO_CLIENT_EMAIL}
              </button>
            </div>
            <p style={{ margin: "12px 0 0" }}>
              No account yet? <Link href="/register">Create a client account</Link>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
