import { describe, expect, it, vi } from "vitest";

vi.mock("$lib/server/api", () => ({
  apiFetch: vi.fn(),
  getCookieHeader: vi.fn(() => "")
}));

import { apiFetch } from "$lib/server/api";

import { load } from "./+page.server";

const adminUser = { id: 1, name: "John", avatar: "🦊", role: "admin" as const };
const memberUser = { id: 2, name: "Sophia", avatar: "🐼", role: "member" as const };

function fakeEvent(user: App.Locals["user"]) {
  return {
    locals: { user },
    cookies: { get: vi.fn(() => undefined) }
  } as unknown as Parameters<typeof load>[0];
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
        transactionCount: 5,
        totalAmount: 1500
      }
    ];
    const mockAudits: any[] = [];

    vi.mocked(apiFetch).mockResolvedValueOnce(mockUsers).mockResolvedValueOnce(mockAudits);

    const result = await load(fakeEvent(adminUser));

    expect(result).toEqual({ users: mockUsers, recentAudits: mockAudits });
    expect(apiFetch).toHaveBeenCalledTimes(2);
  });
});
