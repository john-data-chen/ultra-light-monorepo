import type { SessionUser } from "$lib/server/auth";
import { error, json, type RequestEvent } from "@sveltejs/kit";

import { rateLimit, type RateLimitOptions } from "./rate-limit";

/** Return the signed-in user, or throw a 401 error. */
export function requireApiUser(locals: App.Locals): SessionUser {
  if (!locals.user) {
    error(401, { message: "Unauthorized" });
  }
  return locals.user;
}

/** Return the signed-in user if they have the admin role, or throw a 403 error. */
export function requireApiAdmin(locals: App.Locals): SessionUser {
  const user = requireApiUser(locals);
  if (user.role !== "admin") {
    error(403, { message: "Forbidden" });
  }
  return user;
}

/** Enforce rate limits on api requests based on client IP. */
export function requireRateLimit(
  event: RequestEvent,
  keyPrefix: string,
  options: RateLimitOptions = { windowMs: 60 * 1000, max: 100 }
): void {
  const ip = event.getClientAddress();
  const limitResult = rateLimit(`${keyPrefix}:${ip}`, options);

  if (!limitResult.success) {
    event.setHeaders({
      "Retry-After": String(limitResult.retryAfter)
    });
    error(429, { message: "Too many requests" });
  }
}

/** Return a formatted JSON error response. */
export function apiError(status: number, message: string): Response {
  return json({ message }, { status });
}
