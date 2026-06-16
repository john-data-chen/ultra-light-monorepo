import { createMiddleware } from "hono/factory";
const store = new Map();
export function resetRateLimitStore() {
  store.clear();
}
export function rateLimitMiddleware(options) {
  return createMiddleware(async (c, next) => {
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
//# sourceMappingURL=rate-limit.js.map
