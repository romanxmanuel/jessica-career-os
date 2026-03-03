import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 (native module) is only used in local dev CLI scripts.
  // Production/Vercel uses @libsql/client which is pure JS — no special config needed.
  serverExternalPackages: ["better-sqlite3"],

  // Include migration files in serverless function output
  outputFileTracingIncludes: {
    "/**": ["./db/migrations/**"],
  },
};

export default nextConfig;
