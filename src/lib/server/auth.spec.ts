import { env } from "$env/dynamic/private";
import type { Cookies } from "@sveltejs/kit";
import { describe, expect, it, vi } from "vitest";

import { parseSessionCookie, setSessionCookie, clearSessionCookie } from "./auth";

vi.mock("$app/environment", () => ({ dev: true }));
vi.mock("$env/dynamic/private", () => ({ env: { SESSION_SECRET: "test-secret-value" } }));

function fakeCookies() {
  let stored: string | undefined;
  const cookies = {
    set: vi.fn((_name: string, value: string) => {
      stored = value;
    }),
    delete: vi.fn(() => {
      stored = undefined;
    }),
    get: vi.fn(() => stored)
  } as unknown as Cookies;
  return { cookies, read: () => stored };
}

describe("session cookie sign + verify", () => {
  it("round-trips a userId", () => {
    const { cookies, read } = fakeCookies();
    setSessionCookie(cookies, 42);
    expect(parseSessionCookie(read())).toBe(42);
  });

  it("rejects a tampered signature", () => {
    const { cookies, read } = fakeCookies();
    setSessionCookie(cookies, 7);
    expect(parseSessionCookie(`${read()}x`)).toBeNull();
  });

  it("rejects malformed or missing values", () => {
    expect(parseSessionCookie(undefined)).toBeNull();
    expect(parseSessionCookie("999.deadbeef")).toBeNull();
    expect(parseSessionCookie("notanumber")).toBeNull();
  });

  it("throws when SESSION_SECRET is missing", () => {
    const originalSecret = env.SESSION_SECRET;
    env.SESSION_SECRET = "";
    try {
      const { cookies } = fakeCookies();
      expect(() => setSessionCookie(cookies, 42)).toThrow("SESSION_SECRET is not set");
    } finally {
      env.SESSION_SECRET = originalSecret;
    }
  });

  it("clears the session cookie", () => {
    const { cookies } = fakeCookies();
    clearSessionCookie(cookies);
    expect(cookies.delete).toHaveBeenCalledWith("session", { path: "/" });
  });

  it("rejects non-positive and non-integer user IDs even with valid signature", () => {
    const { cookies, read } = fakeCookies();

    setSessionCookie(cookies, -5);
    expect(parseSessionCookie(read())).toBeNull();

    setSessionCookie(cookies, 0);
    expect(parseSessionCookie(read())).toBeNull();

    setSessionCookie(cookies, 1.5);
    expect(parseSessionCookie(read())).toBeNull();
  });
});
