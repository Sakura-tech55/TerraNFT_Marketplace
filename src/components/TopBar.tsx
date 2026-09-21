"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";

const NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/drops", label: "Drops" },
  { href: "/creators", label: "Creators" },
];

export function TopBar() {
  const { user, ready, logout } = useAuth();
  const path = usePathname();
  const links = user ? [...NAV, { href: "/dashboard", label: "Dashboard" }] : NAV;

  return (
    <header className="topbar">
      <div className="shell topbar-in">
        <Link href="/" aria-label="Terra Ledger home">
          <Logo />
        </Link>

        <nav className="topbar-nav" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={path.startsWith(l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="topbar-actions">
          {ready && user ? (
            <>
              <span className="topbar-who" title={user.email}>
                {user.role === "sales" ? "Sales" : "Collector"} · {user.passId}
              </span>
              <button className="btn" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn">
                Sign in
              </Link>
              <Link href="/register" className="btn btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
