import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../packages/db/src/generated/client";

// Removes the audit rows this run created: expense.spec.ts signs in as John and
// creates + deletes a Food 999 expense (summary "expense Food 999" per the
// `${type} ${category} ${amount}` format in the transaction actions). Runs once
// after all projects finish — a per-test afterAll would race across the four
// parallel browser projects. Scoped to ids above the global-setup baseline so
// audit history from before this run is never touched.
export default async function globalTeardown() {
  const baseline = Number(process.env.E2E_AUDIT_BASELINE_ID);
  if (!Number.isInteger(baseline)) {
    console.warn("E2E_AUDIT_BASELINE_ID is not set; skipping e2e audit cleanup.");
    return;
  }

  // DATABASE_URL was loaded into this process by global-setup.
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl, max: 1 });
  const db = new PrismaClient({ adapter });
  try {
    const john = await db.user.findUnique({
      where: { email: "john@example.com" },
      select: { id: true }
    });
    if (!john) {
      return;
    }

    const { count } = await db.auditLog.deleteMany({
      where: {
        id: { gt: baseline },
        actorId: john.id,
        summary: "expense Food 999"
      }
    });
    if (count > 0) {
      console.log(`Cleaned up ${count} e2e audit log rows.`);
    }
  } finally {
    await db.$disconnect();
  }
}
