import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Database drivers must stay outside the bundle: pg is native,
     PGlite ships WebAssembly. */
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
};

export default nextConfig;
