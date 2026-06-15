import { env } from "$env/dynamic/private";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "./generated/client";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const db = new PrismaClient({ adapter });
