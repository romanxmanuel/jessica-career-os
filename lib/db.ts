import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/db/schema";
import path from "path";

// Local dev: reads from career.db file
// Vercel / production: reads from Turso cloud DB (persistent)
function getDb() {
  // Use || not ?? so empty-string env vars fall through to the local file path
  const url =
    process.env.TURSO_DATABASE_URL ||
    `file:${path.join(process.cwd(), process.env.DATABASE_URL || "career.db")}`;

  const authToken = process.env.TURSO_AUTH_TOKEN || undefined;
  const client = createClient({ url, authToken });
  return drizzle(client, { schema });
}

// Singleton — reuse across requests in the same Node.js process
declare global {
  // eslint-disable-next-line no-var
  var __db: ReturnType<typeof drizzle> | undefined;
}

export const db = globalThis.__db ?? (globalThis.__db = getDb());
