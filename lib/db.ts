import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/db/schema";
import path from "path";

function getDb() {
  // During `next build`, Next.js imports all route modules to analyse them
  // but never actually calls any handlers. Use in-memory SQLite so the build
  // doesn't make network calls to Turso (which would fail or be wasteful).
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";

  const url = isBuild
    ? "file::memory:"
    : process.env.TURSO_DATABASE_URL ||
      `file:${path.join(process.cwd(), process.env.DATABASE_URL || "career.db")}`;

  const authToken = isBuild ? undefined : process.env.TURSO_AUTH_TOKEN || undefined;

  const client = createClient({ url, authToken });
  return drizzle(client, { schema });
}

// Singleton — reuse across requests in the same Node.js process
declare global {
  // eslint-disable-next-line no-var
  var __db: ReturnType<typeof drizzle> | undefined;
}

export const db = globalThis.__db ?? (globalThis.__db = getDb());
