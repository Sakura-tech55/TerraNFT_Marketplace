"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthArtPanel } from "@/components/AuthArtPanel";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, ready } = useAuth();

  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = register(email, password, name, org);
    if (!r.ok) {
      setError(r.error ?? "Registration failed.");
      setBusy(false);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="auth">
      <AuthArtPanel
        email={email}
        handle={name}
        caption="Your Ledger Pass is drawn as you type. It is issued the moment you create the account, and it is what identifies you across the marketplace."
      />

      <main className="auth-form">
        <div className="auth-form-in">
          <p className="label">Create account</p>
          <h1>Open a client account</h1>
          <p className="sub">
            Enter your email and your pass is generated on the left. Creating the account opens
            your dashboard. Sales seats are provisioned internally, not here.
          </p>

          {error && <p className="err">{error}</p>}

          <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                value={name}
                autoComplete="name"
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Marchetti"
              />
            </div>

            <div className="field">
              <label htmlFor="org">Organisation</label>
              <input
                id="org"
                value={org}
                autoComplete="organization"
                onChange={(e) => setOrg(e.target.value)}
                placeholder="Northgate Capital"
              />
            </div>

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
              <p className="field-hint">This string determines your pass artwork and ID.</p>
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? "Issuing…" : "Issue pass and create account"}
            </button>
          </form>

          <p className="authswap">
            Already have an account? <Link href="/login">Sign in</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
