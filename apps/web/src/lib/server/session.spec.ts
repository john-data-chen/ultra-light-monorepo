import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("$env/dynamic/private", () => ({
  env: { API_BASE_URL: "http://localhost:3001" }
}));

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("resolveSessionUser", () => {
  it("returns null when no cookie value", async () => {
    const { resolveSessionUser } = await import("./session");
    const result = await resolveSessionUser(undefined);

    expect(result).toBeNull();
  });

  it("returns null when API returns non-ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 401
    } as Response);

    const { resolveSessionUser } = await import("./session");
    const result = await resolveSessionUser("abc123");

    expect(result).toBeNull();
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/auth/me",
      expect.objectContaining({
        headers: { Cookie: "session=abc123" }
      })
    );
  });

  it("returns null when API throws", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network fail"));

    const { resolveSessionUser } = await import("./session");
    const result = await resolveSessionUser("abc123");

    expect(result).toBeNull();
  });

  it("returns user on success", async () => {
    const user = { id: 1, name: "Alice", avatar: null, role: "admin" };
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => user
    } as Response);

    const { resolveSessionUser } = await import("./session");
    const result = await resolveSessionUser("abc123");

    expect(result).toEqual(user);
  });
});

describe("requireUser", () => {
  it("returns user when present", async () => {
    const user = { id: 1, name: "Alice", avatar: null, role: "admin" };
    const { requireUser } = await import("./session");
    const result = requireUser({ user } as App.Locals);

    expect(result).toEqual(user);
  });

  it("throws Unauthorized when no user", async () => {
    const { requireUser } = await import("./session");
    expect(() => requireUser({} as App.Locals)).toThrow("Unauthorized");
  });
});

describe("requireAdmin", () => {
  it("returns user when admin", async () => {
    const user = { id: 1, name: "Alice", avatar: null, role: "admin" };
    const { requireAdmin } = await import("./session");
    const result = requireAdmin({ user } as App.Locals);

    expect(result).toEqual(user);
  });

  it("throws Forbidden when not admin", async () => {
    const user = { id: 2, name: "Bob", avatar: null, role: "member" };
    const { requireAdmin } = await import("./session");
    expect(() => requireAdmin({ user } as App.Locals)).toThrow("Forbidden");
  });

  it("throws Unauthorized when no user", async () => {
    const { requireAdmin } = await import("./session");
    expect(() => requireAdmin({} as App.Locals)).toThrow("Unauthorized");
  });
});
