import type { Cookies } from "@sveltejs/kit";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { actions, load } from "./+page.server";

vi.mock("$app/environment", () => ({ dev: true }));
vi.mock("$env/dynamic/private", () => ({ env: { API_BASE_URL: "http://localhost:3001" } }));

type LoginAction = NonNullable<typeof actions.default>;

function createCookies({ throwOnSet = false }: { throwOnSet?: boolean } = {}) {
  let stored = "";
  const cookies = {
    set: vi.fn((_name: string, value: string) => {
      if (throwOnSet) {
        throw new Error("cookie write failed");
      }
      stored = value;
    }),
    get: vi.fn(() => stored),
    delete: vi.fn(() => {
      stored = "";
    })
  } as unknown as Cookies;

  return { cookies, read: () => stored };
}

async function submitLogin(email: string | undefined, cookies: Cookies = createCookies().cookies) {
  const form = new FormData();
  if (email !== undefined) {
    form.set("email", email);
  }

  const request = new Request("http://localhost/login", {
    method: "POST",
    body: form
  });

  return (actions.default as LoginAction)({
    request,
    cookies
  } as unknown as Parameters<LoginAction>[0]);
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("login action", () => {
  it("returns a form failure when email is missing", async () => {
    const result = await submitLogin("   ");

    expect(result).toMatchObject({
      status: 400,
      data: { email: "   ", message: expect.any(String) }
    });

    const resultUndefined = await submitLogin(undefined);

    expect(resultUndefined).toMatchObject({
      status: 400,
      data: { email: "", message: expect.any(String) }
    });
  });

  it("returns a form failure when no account exists", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ message: "User not found" })
    } as Response);

    const result = await submitLogin("missing@example.com");

    expect(result).toMatchObject({
      status: 400,
      data: { email: "missing@example.com", message: "User not found" }
    });
  });

  it("sets a signed session cookie and redirects when login succeeds", async () => {
    const { cookies, read } = createCookies();
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      headers: new Headers({
        "set-cookie": "session=42.signature; Path=/; HttpOnly"
      }),
      json: async () => ({ message: "Logged in" })
    } as Response);

    await expect(submitLogin("JOHN@example.com", cookies)).rejects.toMatchObject({
      status: 303,
      location: "/"
    });
    expect(read()).toBe("42.signature");
  });

  it("returns a service failure when API call fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

    const { cookies } = createCookies();
    const result = await submitLogin("john@example.com", cookies);

    expect(result).toMatchObject({
      status: 503,
      data: { email: "john@example.com", message: expect.any(String) }
    });
  });
});

describe("login load", () => {
  it("returns the default email", () => {
    const result = load({} as any);
    expect(result).toEqual({ defaultEmail: "john@example.com" });
  });
});
