import { createHmac } from "node:crypto";

import { db } from "@ultra-light/db";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";

const COOKIE_NAME = "session";

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error("SESSION_SECRET is not set");
  }
  return value;
}

function verify(payload: string, signature: string): boolean {
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  return signature === expected;
}

function parseSessionCookie(cookieValue: string): number | null {
  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature) {
    return null;
  }
  if (!verify(payload, signature)) {
    return null;
  }
  const userId = Number(payload);
  return Number.isSafeInteger(userId) ? userId : null;
}

const auth = new Hono();

auth.get("/me", async (c) => {
  const cookieValue = getCookie(c, COOKIE_NAME);
  if (!cookieValue) {
    return c.json({ message: "Not authenticated" }, 401);
  }

  const userId = parseSessionCookie(cookieValue);
  if (userId === null) {
    return c.json({ message: "Invalid session" }, 401);
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, avatar: true, role: true }
  });

  if (!user) {
    return c.json({ message: "User not found" }, 401);
  }

  return c.json(user);
});

export default auth;
