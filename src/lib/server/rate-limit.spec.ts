import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { rateLimit, resetRateLimitStore } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    resetRateLimitStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the max limit", () => {
    const options = { windowMs: 1000, max: 3 };
    const key = "ip-1";

    let result = rateLimit(key, options);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.retryAfter).toBe(0);

    result = rateLimit(key, options);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(1);

    result = rateLimit(key, options);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("blocks requests exceeding the max limit", () => {
    const options = { windowMs: 60000, max: 2 };
    const key = "ip-2";

    rateLimit(key, options); // 1
    rateLimit(key, options); // 2

    // 3rd request should be blocked
    const result = rateLimit(key, options);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfter).toBe(60); // 60 seconds left
  });

  it("resets limit when the time window passes", () => {
    const options = { windowMs: 10000, max: 1 };
    const key = "ip-3";

    let result = rateLimit(key, options);
    expect(result.success).toBe(true);

    result = rateLimit(key, options);
    expect(result.success).toBe(false);

    // Advance time past windowMs
    vi.advanceTimersByTime(10001);

    result = rateLimit(key, options);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("tracks rate limits independently for different keys", () => {
    const options = { windowMs: 1000, max: 1 };

    const result1 = rateLimit("key-a", options);
    expect(result1.success).toBe(true);

    const result2 = rateLimit("key-b", options);
    expect(result2.success).toBe(true);

    const result1Blocked = rateLimit("key-a", options);
    expect(result1Blocked.success).toBe(false);

    const result2Blocked = rateLimit("key-b", options);
    expect(result2Blocked.success).toBe(false);
  });
});
