import { env } from "$env/dynamic/private";

const BASE_URL = env.API_BASE_URL || "http://localhost:3001";

interface ApiOptions {
  cookie?: string;
  method?: string;
  body?: unknown;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { cookie, method = "GET", body } = options;

  const headers: Record<string, string> = {};
  if (cookie) {
    headers["Cookie"] = cookie;
  }
  if (body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "API error" }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : (undefined as unknown as T);
}

export function getCookieHeader(cookies: { get: (name: string) => string | undefined }): string {
  const session = cookies.get("session");
  return session ? `session=${session}` : "";
}
