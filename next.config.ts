import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native module — must stay outside the webpack bundle
  serverExternalPackages: ["better-sqlite3"],

  // Include migration files in serverless function output (needed on Vercel)
  outputFileTracingIncludes: {
    "/**": ["./db/migrations/**"],
  },
};

export default nextConfig;
