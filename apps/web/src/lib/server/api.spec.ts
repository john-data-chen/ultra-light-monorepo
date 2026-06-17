import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("$env/dynamic/private", () => ({
  env: { API_BASE_URL: "http://localhost:3001" }
}));

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("apiFetch", () => {
  it("succeeds with GET and returns parsed JSON", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ id: 1 })
    } as Response);

    const { apiFetch } = await import("./api");
    const result = await apiFetch<{ id: number }>("/api/test");

    expect(result).toEqual({ id: 1 });
    expect(fetch).toHaveBeenCalledWith("http://localhost:3001/api/test", {
      method: "GET",
      headers: {},
      body: undefined
    });
  });

  it("throws on non-200 response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "Server error" })
    } as Response);

    const { apiFetch } = await import("./api");
    await expect(apiFetch("/api/test")).rejects.toThrow("Server error");
  });

  it("returns undefined for 204 no content", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 204,
      text: async () => ""
    } as Response);

    const { apiFetch } = await import("./api");
    const result = await apiFetch("/api/test");

    expect(result).toBeUndefined();
  });

  it("returns undefined for empty body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => ""
    } as Response);

    const { apiFetch } = await import("./api");
    const result = await apiFetch("/api/test");

    expect(result).toBeUndefined();
  });

  it("throws default message when error json has no message field", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ errors: ["bad"] })
    } as Response);

    const { apiFetch } = await import("./api");
    await expect(apiFetch("/api/test")).rejects.toThrow("API error: 422");
  });

  it("throws default message when json() rejects", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => {
        throw new Error("bad json");
      }
    } as unknown as Response);

    const { apiFetch } = await import("./api");
    await expect(apiFetch("/api/test")).rejects.toThrow("API error");
  });

  it("sends cookie and body headers when provided", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ ok: true })
    } as Response);

    const { apiFetch } = await import("./api");
    await apiFetch("/api/test", {
      method: "POST",
      cookie: "session=abc",
      body: { foo: "bar" }
    });

    expect(fetch).toHaveBeenCalledWith("http://localhost:3001/api/test", {
      method: "POST",
      headers: { Cookie: "session=abc", "Content-Type": "application/json" },
      body: JSON.stringify({ foo: "bar" })
    });
  });
});

describe("getCookieHeader", () => {
  it("returns session cookie when present", async () => {
    const { getCookieHeader } = await import("./api");
    const result = getCookieHeader({ get: () => "abc123" });

    expect(result).toBe("session=abc123");
  });

  it("returns empty string when no session cookie", async () => {
    const { getCookieHeader } = await import("./api");
    const result = getCookieHeader({ get: () => undefined });

    expect(result).toBe("");
  });
});
