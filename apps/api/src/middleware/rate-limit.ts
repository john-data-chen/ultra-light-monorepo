import { createMiddleware } from "hono/factory";

import type { AppEnv } from "../types.js";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export function resetRateLimitStore(): void {
  store.clear();
}

export function rateLimitMiddleware(options: RateLimitOptions) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    const key = `${c.req.path}:${ip}`;
    const now = Date.now();
    const record = store.get(key);

    if (!record || now > record.resetTime) {
      store.set(key, { count: 1, resetTime: now + options.windowMs });
      await next();
      return;
    }

    if (record.count >= options.max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      c.header("Retry-After", String(retryAfter));
      return c.json({ message: "Too many requests" }, 429);
    }

    record.count += 1;
    await next();
  });
}
