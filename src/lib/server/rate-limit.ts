import { dev } from "$app/environment";

/**
 * Simple in-memory fixed-window rate limiter.
 *
 * NOTE ON SERVERLESS DEPLOYMENTS (e.g. Vercel):
 * This implementation uses an in-memory `Map` to track request counts. In a serverless environment
 * where functions are ephemeral, scale down to zero, and run in multiple isolated instances,
 * this in-memory state is per-instance and is reset when the instance restarts.
 * Therefore, this is a best-effort rate limiter.
 *
 * For production workloads requiring strict rate-limiting guarantees across multiple instances,
 * a distributed key-value store such as Vercel KV, Redis (e.g., Upstash), or Memcached should
 * be used as the tracking store.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter: number; // in seconds
}

/**
 * Checks if a key has exceeded its rate limit.
 * Updates the request count and returns the status.
 */
export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const isTestMode = typeof process !== "undefined" && process.env.NODE_ENV === "test";
  const isRelaxed =
    (dev && !isTestMode) ||
    (typeof process !== "undefined" && process.env.PLAYWRIGHT_TEST === "true");
  const maxLimit = isRelaxed ? 10000 : options.max;

  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + options.windowMs
    };
    store.set(key, newRecord);
    return {
      success: true,
      limit: maxLimit,
      remaining: maxLimit - 1,
      resetTime: newRecord.resetTime,
      retryAfter: 0
    };
  }

  if (record.count >= maxLimit) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return {
      success: false,
      limit: maxLimit,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfter
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: maxLimit,
    remaining: maxLimit - record.count,
    resetTime: record.resetTime,
    retryAfter: 0
  };
}

/**
 * Resets the in-memory rate limiting store.
 * Primarily used in tests to ensure clean state.
 */
export function resetRateLimitStore(): void {
  store.clear();
}
