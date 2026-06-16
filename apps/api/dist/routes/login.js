import { createHmac } from "node:crypto";

import { db } from "@ultra-light/db";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
const COOKIE_NAME = "session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
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
function serialize(userId) {
  const payload = String(userId);
  return `${payload}.${sign(payload)}`;
}
const login = new Hono();
login.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || !body.email) {
    return c.json({ message: "Email is required" }, 400);
  }
  const user = await db.user.findUnique({
    where: { email: body.email },
    select: { id: true }
  });
  if (!user) {
    return c.json({ message: "User not found" }, 401);
  }
  setCookie(c, COOKIE_NAME, serialize(user.id), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV !== "development",
    maxAge: MAX_AGE
  });
  return c.json({ message: "Logged in" });
});
login.post("/logout", async (c) => {
  setCookie(c, COOKIE_NAME, "", {
    path: "/",
    maxAge: 0
  });
  return c.json({ message: "Logged out" });
});
export default login;
//# sourceMappingURL=login.js.map
