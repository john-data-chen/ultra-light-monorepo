import type { Cookies } from "@sveltejs/kit";
import { afterEach, describe, expect, it, vi } from "vitest";

import { setSessionCookie } from "./auth";

vi.mock("$app/environment", () => ({ dev: true }));
vi.mock("$env/dynamic/private", () => ({ env: { SESSION_SECRET: "test-secret-value" } }));

function createDb(rows: Array<{ id: number; name: string; avatar: string; role: string }>) {
  return {
    user: {
      findUnique: vi.fn(async () => rows[0] ?? null)
    }
  };
}

function createSessionCookie(userId: number): string {
  let value = "";
  const cookies = {
    set: (_name: string, cookieValue: string) => {
      value = cookieValue;
    }
  } as unknown as Cookies;

  setSessionCookie(cookies, userId);
  return value;
}

async function loadSubjectWithDb(dbFactory: () => Record<string, unknown>) {
  vi.resetModules();
  vi.doMock("$lib/server/db", dbFactory);
  return import("./session");
}

afterEach(() => {
  vi.doUnmock("$lib/server/db");
  vi.restoreAllMocks();
});

describe("resolveSessionUser", () => {
  it("returns null when the session cookie is missing", async () => {
    const { resolveSessionUser } = await loadSubjectWithDb(() => ({
      db: createDb([{ id: 1, name: "John", avatar: "J", role: "member" }])
    }));

    await expect(resolveSessionUser(undefined)).resolves.toBeNull();
  });

  it("returns the session user when the cookie and lookup are valid", async () => {
    const cookie = createSessionCookie(1);
    const { resolveSessionUser } = await loadSubjectWithDb(() => ({
      db: createDb([{ id: 1, name: "John", avatar: "J", role: "member" }])
    }));

    await expect(resolveSessionUser(cookie)).resolves.toEqual({
      id: 1,
      name: "John",
      avatar: "J",
      role: "member"
    });
  });

  it("returns null when the session user lookup fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const cookie = createSessionCookie(1);
    const db = {
      user: {
        findUnique: vi.fn(async () => {
          throw new Error("database offline");
        })
      }
    };
    const { resolveSessionUser } = await loadSubjectWithDb(() => ({ db }));

    await expect(resolveSessionUser(cookie)).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalledWith("[session] user lookup failed", expect.any(Error));
  });

  it("returns null and logs when cookie parsing throws", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.doMock("$lib/server/auth", () => ({
      parseSessionCookie: () => {
        throw new Error("malformed signature format");
      }
    }));
    const { resolveSessionUser } = await loadSubjectWithDb(() => ({
      db: createDb([])
    }));

    await expect(resolveSessionUser("dummy-cookie")).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalledWith("[session] cookie parsing failed", expect.any(Error));
    vi.doUnmock("$lib/server/auth");
  });

  it("returns null when the session user is not found in database", async () => {
    const cookie = createSessionCookie(999);
    const { resolveSessionUser } = await loadSubjectWithDb(() => ({
      db: createDb([])
    }));

    await expect(resolveSessionUser(cookie)).resolves.toBeNull();
  });
});
