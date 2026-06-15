import { afterEach, describe, expect, it, vi } from "vitest";

function createDb(rows: Array<{ id: number }>) {
  return {
    user: {
      findUnique: vi.fn(async () => rows[0] ?? null)
    }
  };
}

async function loadSubjectWithDb(dbFactory: () => Record<string, unknown>) {
  vi.resetModules();
  vi.doMock("$lib/server/db", dbFactory);
  return import("./login");
}

afterEach(() => {
  vi.doUnmock("$lib/server/db");
  vi.restoreAllMocks();
});

describe("findLoginUserByEmail", () => {
  it("returns the matching user id", async () => {
    const { findLoginUserByEmail } = await loadSubjectWithDb(() => ({
      db: createDb([{ id: 42 }])
    }));

    await expect(findLoginUserByEmail("john@example.com")).resolves.toEqual({
      type: "found",
      userId: 42
    });
  });

  it("returns not_found when no user matches", async () => {
    const { findLoginUserByEmail } = await loadSubjectWithDb(() => ({
      db: createDb([])
    }));

    await expect(findLoginUserByEmail("missing@example.com")).resolves.toEqual({
      type: "not_found"
    });
  });

  it("returns service_unavailable when the database module cannot load", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { findLoginUserByEmail } = await loadSubjectWithDb(() => {
      throw new Error("DATABASE_URL is not set");
    });

    await expect(findLoginUserByEmail("john@example.com")).resolves.toEqual({
      type: "service_unavailable"
    });
    expect(errorSpy).toHaveBeenCalledWith("[login] user lookup failed", expect.any(Error));
  });

  it("returns service_unavailable when the database query fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const db = {
      user: {
        findUnique: vi.fn(async () => {
          throw new Error("database offline");
        })
      }
    };
    const { findLoginUserByEmail } = await loadSubjectWithDb(() => ({ db }));

    await expect(findLoginUserByEmail("john@example.com")).resolves.toEqual({
      type: "service_unavailable"
    });
    expect(errorSpy).toHaveBeenCalledWith("[login] user lookup failed", expect.any(Error));
  });
});
