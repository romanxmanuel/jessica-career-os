import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "@/db/schema";
import path from "path";
import { existsSync } from "fs";

// On Vercel, /tmp is the only writable directory.
// Locally, use the project root (respects DATABASE_URL env var).
const DB_PATH = process.env.VERCEL
  ? "/tmp/career.db"
  : path.join(process.cwd(), process.env.DATABASE_URL ?? "career.db");

const MIGRATIONS_PATH = path.join(process.cwd(), "db/migrations");

// Singleton — reuse connection across hot reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var __db: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

function createDb() {
  const isNew = !existsSync(DB_PATH);

  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema });

  // Run migrations — always safe (idempotent).
  // On Vercel, also seeds demo data on a fresh /tmp DB.
  migrate(db, { migrationsFolder: MIGRATIONS_PATH });

  if (isNew && process.env.VERCEL) {
    // Lazy import to keep bundle clean; only runs on Vercel cold starts.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { seedDemo } = require("@/db/demo-seed");
    seedDemo(db);
  }

  return db;
}

export const db = globalThis.__db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalThis.__db = db;
}
