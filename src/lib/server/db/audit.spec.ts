import { describe, expect, it, vi } from "vitest";

import { listRecentAudits, recordAudit } from "./audit";

import { db } from "./index";

vi.mock("./index", () => ({
  db: {
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn().mockResolvedValue([
        {
          id: 1,
          actor: { id: 1, name: "John", avatar: "🦊", email: "john@example.com" },
          action: "create",
          entity: "transaction",
          entityId: 10,
          summary: "income Salary 1000",
          createdAt: new Date()
        }
      ])
    }
  }
}));

describe("audit logs", () => {
  it("records an audit log successfully", async () => {
    const createMock = vi.mocked(db.auditLog.create);

    await recordAudit(1, "create", "transaction", 10, "income Salary 1000");

    expect(createMock).toHaveBeenCalledWith({
      data: {
        actorId: 1,
        action: "create",
        entity: "transaction",
        entityId: 10,
        summary: "income Salary 1000"
      }
    });
  });

  it("lists recent audits", async () => {
    const result = await listRecentAudits(5);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      action: "create",
      entity: "transaction",
      actor: { name: "John" }
    });
  });
});
