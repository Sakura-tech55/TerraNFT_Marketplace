import type { Metadata } from "next";
import { Unbounded, Manrope, JetBrains_Mono } from "next/font/google";
import { AccountProvider } from "@/lib/account";
import { getViewer } from "@/lib/viewer";
import { PriceStrip } from "@/components/PriceStrip";
import "./globals.css";
import "./site.css";

const display = Unbounded({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});
const body = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cadastra — The NFT marketplace by Terra Ledger",
  description:
    "Cadastra is Terra Ledger's NFT marketplace where collectors buy and sell digital assets in tez, and where new creations launch every season with long-term client partners.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  /* Resolve the session here so the header renders signed-in on first paint. */
  const account = await getViewer();

  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <AccountProvider initialAccount={account}>
          <PriceStrip />
          {children}
        </AccountProvider>
      </body>
    </html>
  );
}
