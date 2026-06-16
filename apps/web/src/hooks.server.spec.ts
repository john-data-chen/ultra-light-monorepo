import type { RequestEvent } from "@sveltejs/kit";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("$lib/server/session", () => ({
  resolveSessionUser: vi.fn(async () => null)
}));
vi.mock("$lib/paraglide/server", () => ({
  paraglideMiddleware: vi.fn((_req, cb) => cb({ request: _req, locale: "en" }))
}));
vi.mock("$lib/paraglide/runtime", () => ({
  getTextDirection: vi.fn(() => "ltr")
}));

async function loadSubject() {
  vi.resetModules();
  return import("./hooks.server");
}

afterEach(() => {
  vi.doUnmock("$app/environment");
});

describe("hooks.server handle", () => {
  it("adds security headers to HTML responses in production", async () => {
    vi.doMock("$app/environment", () => ({ dev: false }));
    const { handle } = await loadSubject();

    const mockEvent = {
      locals: {},
      cookies: {
        get: vi.fn(() => undefined)
      },
      request: new Request("http://localhost/"),
      url: new URL("http://localhost/")
    } as unknown as RequestEvent;

    const mockResolve = vi.fn(async () => {
      return new Response("<html></html>", {
        headers: {
          "Content-Type": "text/html",
          "Content-Security-Policy": "default-src 'self'; connect-src 'self';"
        }
      });
    });

    const response = await handle({ event: mockEvent, resolve: mockResolve });

    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(response.headers.get("Permissions-Policy")).toBe(
      "camera=(), microphone=(), geolocation=()"
    );
    expect(response.headers.get("Strict-Transport-Security")).toBe(
      "max-age=31536000; includeSubDomains; preload"
    );
  });

  it("does not add HSTS (Strict-Transport-Security) in dev mode and does not set CSP", async () => {
    vi.doMock("$app/environment", () => ({ dev: true }));
    const { handle } = await loadSubject();

    const mockEvent = {
      locals: {},
      cookies: {
        get: vi.fn(() => undefined)
      },
      request: new Request("http://localhost/"),
      url: new URL("http://localhost/")
    } as unknown as RequestEvent;

    const mockResolve = vi.fn(async () => {
      return new Response("<html></html>", {
        headers: {
          "Content-Type": "text/html"
        }
      });
    });

    const response = await handle({ event: mockEvent, resolve: mockResolve });

    expect(response.headers.get("Strict-Transport-Security")).toBeNull();
    expect(response.headers.get("Content-Security-Policy")).toBeNull();
  });

  it("applies a relaxed CSP for the /api/docs path", async () => {
    vi.doMock("$app/environment", () => ({ dev: false }));
    const { handle } = await loadSubject();

    const mockEvent = {
      locals: {},
      cookies: {
        get: vi.fn(() => undefined)
      },
      request: new Request("http://localhost/api/docs"),
      url: new URL("http://localhost/api/docs")
    } as unknown as RequestEvent;

    const mockResolve = vi.fn(async () => {
      return new Response("<html></html>", {
        headers: {
          "Content-Type": "text/html",
          "Content-Security-Policy": "default-src 'self';"
        }
      });
    });

    const response = await handle({ event: mockEvent, resolve: mockResolve });

    const csp = response.headers.get("Content-Security-Policy");
    expect(csp).toContain("https://cdn.jsdelivr.net");
    expect(csp).toContain(
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net"
    );
  });

  it("does not add security headers to non-HTML responses", async () => {
    vi.doMock("$app/environment", () => ({ dev: false }));
    const { handle } = await loadSubject();

    const mockEvent = {
      locals: {},
      cookies: {
        get: vi.fn(() => undefined)
      },
      request: new Request("http://localhost/api/transactions"),
      url: new URL("http://localhost/api/transactions")
    } as unknown as RequestEvent;

    const mockResolve = vi.fn(async () => {
      return new Response(JSON.stringify({ data: [] }), {
        headers: { "Content-Type": "application/json" }
      });
    });

    const response = await handle({ event: mockEvent, resolve: mockResolve });

    expect(response.headers.get("X-Content-Type-Options")).toBeNull();
    expect(response.headers.get("Content-Security-Policy")).toBeNull();
  });
});
