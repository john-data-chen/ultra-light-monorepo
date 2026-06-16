import { defineConfig } from "prisma/config";

// Prisma CLI does not auto-load .env files. Load the local .env when present;
// CI has no .env file and relies on ambient environment variables instead.
try {
  process.loadEnvFile(".env");
} catch {
  // no .env file present (e.g. CI) — fall back to ambient env vars
}

// `prisma generate` only reads the schema to emit the client and never connects
// to the database, so the datasource URL is optional here. It is only required
// for migration / introspection commands, which run locally with DATABASE_URL
// set. Supplying it conditionally lets `generate` run in CI without a database.
const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {})
});
