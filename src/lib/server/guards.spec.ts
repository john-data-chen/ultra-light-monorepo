import { describe, expect, it } from "vitest";

import { requireAdmin, requireUser } from "./guards";

function locals(user: App.Locals["user"]): App.Locals {
  return { user } as App.Locals;
}

describe("requireUser", () => {
  it("returns the user when present", () => {
    const user = { id: 1, name: "John", avatar: "🦊", role: "member" as const };
    expect(requireUser(locals(user))).toBe(user);
  });

  it("throws a redirect when user is null", () => {
    expect(() => requireUser(locals(null))).toThrow(
      expect.objectContaining({ status: 303, location: "/login" })
    );
  });
});

describe("requireAdmin", () => {
  it("returns the user when they have admin role", () => {
    const admin = { id: 1, name: "John", avatar: "🦊", role: "admin" as const };
    expect(requireAdmin(locals(admin))).toBe(admin);
  });

  it("throws a redirect to / when user is a member", () => {
    const member = { id: 2, name: "Sophia", avatar: "🐼", role: "member" as const };
    expect(() => requireAdmin(locals(member))).toThrow(
      expect.objectContaining({ status: 303, location: "/" })
    );
  });

  it("throws a redirect to /login when user is null", () => {
    expect(() => requireAdmin(locals(null))).toThrow(
      expect.objectContaining({ status: 303, location: "/login" })
    );
  });
});
