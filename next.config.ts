import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Database drivers must stay outside the bundle: pg is native,
     PGlite ships WebAssembly. */
  serverExternalPackages: ["@electric-sql/pglite", "pg"],

  /* The image routes read originals from private/ at run time. Serverless hosts
     only ship files the build traces, so include them explicitly. */
  outputFileTracingIncludes: {
    "/api/media/[id]": ["./private/nft/**/*"],
    "/api/media/creator/[slug]": ["./private/creators/**/*"],
    "/api/health": ["./private/nft/catalog.csv"],
  },
};

export default nextConfig;
