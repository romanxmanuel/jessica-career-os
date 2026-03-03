import type { Config } from "drizzle-kit";

const isTurso = !!process.env.TURSO_DATABASE_URL;

export default {
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "sqlite",
  dbCredentials: isTurso
    ? {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }
    : {
        url: "file:./career.db",
      },
} satisfies Config;
