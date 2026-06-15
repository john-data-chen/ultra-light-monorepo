import { describe, expect, it, vi } from "vitest";

vi.mock("$lib/server/db/admin", () => ({
  listUsersWithStats: vi.fn()
}));
vi.mock("$lib/server/db/audit", () => ({
  listRecentAudits: vi.fn()
}));

import { listUsersWithStats } from "$lib/server/db/admin";
import { listRecentAudits } from "$lib/server/db/audit";

import { load } from "./+page.server";

const adminUser = { id: 1, name: "John", avatar: "🦊", role: "admin" as const };
const memberUser = { id: 2, name: "Sophia", avatar: "🐼", role: "member" as const };

function fakeEvent(user: App.Locals["user"]) {
  return { locals: { user } } as Parameters<typeof load>[0];
}

describe("admin page load", () => {
  it("redirects a member to /", async () => {
    await expect(load(fakeEvent(memberUser))).rejects.toMatchObject({ status: 303, location: "/" });
  });

  it("redirects an unauthenticated visitor to /login", async () => {
    await expect(load(fakeEvent(null))).rejects.toMatchObject({ status: 303, location: "/login" });
  });

  it("returns user data for an admin", async () => {
    const mockUsers = [
      {
        id: 1,
        name: "John",
        email: "john@example.com",
        avatar: "🦊",
        role: "admin",
        transactionCount: 5,
        totalIncome: 1000,
        totalExpense: 500
      }
    ];
    vi.mocked(listUsersWithStats).mockResolvedValue(mockUsers as any);
    const mockAudits: any[] = [];
    vi.mocked(listRecentAudits).mockResolvedValue(mockAudits);

    const result = await load(fakeEvent(adminUser));

    expect(result).toEqual({ users: mockUsers, recentAudits: mockAudits });
    expect(listUsersWithStats).toHaveBeenCalled();
    expect(listRecentAudits).toHaveBeenCalled();
  });
});
