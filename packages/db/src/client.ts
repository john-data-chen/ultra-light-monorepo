import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "./generated/client";

export { PrismaClient } from "./generated/client";
export type { AuditAction, AuditLog, User, UserRole } from "./generated/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const db = new PrismaClient({ adapter });
