import { defineConfig, env } from "prisma/config";

// Prisma CLI does not auto-load .env files; CI provides DATABASE_URL directly.
try {
  process.loadEnvFile(".env");
} catch {
  // no .env file present
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL")
  }
});
