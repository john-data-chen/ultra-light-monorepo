import { createHmac, timingSafeEqual } from "node:crypto";

import { db } from "@ultra-light/db";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
const COOKIE_NAME = "session";
function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error("SESSION_SECRET is not set");
  }
  return value;
}
function sign(payload) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}
/** Verify a signed cookie value and return the userId, or null if missing/tampered. */
export function parseSessionCookie(value) {
  if (!value) {
    return null;
  }
  const [payload, signature] = value.split(".");
  if (!payload || !signature) {
    return null;
  }
  const expected = sign(payload);
  const actual = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (actual.length !== wanted.length || !timingSafeEqual(actual, wanted)) {
    return null;
  }
  const userId = Number(payload);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}
export const authMiddleware = createMiddleware(async (c, next) => {
  const sessionCookie = getCookie(c, COOKIE_NAME);
  const userId = parseSessionCookie(sessionCookie);
  if (userId === null) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, avatar: true, role: true }
  });
  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  c.set("user", user);
  await next();
});
//# sourceMappingURL=auth.js.map
