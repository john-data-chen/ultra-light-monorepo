import { describe, expect, it } from "vitest";

import { AuditAction, TransactionType, UserRole } from "./generated/client";

// The Prisma schema is structurally validated by `prisma validate` (db:generate);
// these tests pin the enum values the app logic branches on.
describe("database schema enums", () => {
  it("defines transaction types", () => {
    expect(Object.values(TransactionType)).toEqual(["income", "expense"]);
  });

  it("defines user roles", () => {
    expect(Object.values(UserRole)).toEqual(["member", "admin"]);
  });

  it("defines audit actions", () => {
    expect(Object.values(AuditAction)).toEqual(["create", "update", "delete"]);
  });
});
