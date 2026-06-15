import type { SessionUser } from "$lib/server/auth";
import type { RequestEvent } from "@sveltejs/kit";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiError, requireApiUser, requireRateLimit } from "./api";
import { resetRateLimitStore } from "./rate-limit";

describe("requireApiUser", () => {
  it("returns the user if present in locals", () => {
    const user: SessionUser = { id: 1, name: "Test User", avatar: "", role: "member" };
    const locals = { user } as App.Locals;
    expect(requireApiUser(locals)).toEqual(user);
  });

  it("throws a 401 error if user is missing", () => {
    const locals = { user: null } as unknown as App.Locals;
    expect(() => requireApiUser(locals)).toThrowError();
  });
});

describe("requireRateLimit", () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it("does not throw when requests are within the limit", () => {
    const mockEvent = {
      getClientAddress: vi.fn(() => "127.0.0.1"),
      setHeaders: vi.fn()
    } as unknown as RequestEvent;

    expect(() => requireRateLimit(mockEvent, "test-api", { windowMs: 1000, max: 2 })).not.toThrow();

    expect(() => requireRateLimit(mockEvent, "test-api", { windowMs: 1000, max: 2 })).not.toThrow();
  });

  it("throws a 429 error and sets Retry-After header when rate limit is exceeded", () => {
    const mockEvent = {
      getClientAddress: vi.fn(() => "127.0.0.1"),
      setHeaders: vi.fn()
    } as unknown as RequestEvent;

    // Use up the limit (max 1)
    requireRateLimit(mockEvent, "test-api", { windowMs: 10000, max: 1 });

    // Exceeding request
    expect(() =>
      requireRateLimit(mockEvent, "test-api", { windowMs: 10000, max: 1 })
    ).toThrowError();

    expect(mockEvent.setHeaders).toHaveBeenCalledWith({
      "Retry-After": expect.any(String)
    });
  });
});

describe("apiError", () => {
  it("creates a JSON response with status and error message", async () => {
    const response = apiError(400, "Bad Request");
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ message: "Bad Request" });
  });
});
