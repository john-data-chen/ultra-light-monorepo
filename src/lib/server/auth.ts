import { createHmac, timingSafeEqual } from "node:crypto";

import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import type { UserRole } from "$lib/server/db/schema";
import type { Cookies } from "@sveltejs/kit";

export interface SessionUser {
  id: number;
  name: string;
  avatar: string;
  role: UserRole;
}

const COOKIE_NAME = "session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  const value = env.SESSION_SECRET;
  if (!value) {
    throw new Error("SESSION_SECRET is not set");
  }
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Build a signed cookie value of the form `<userId>.<signature>`. */
function serialize(userId: number): string {
  const payload = String(userId);
  return `${payload}.${sign(payload)}`;
}

/** Verify a signed cookie value and return the userId, or null if missing/tampered. */
export function parseSessionCookie(value: string | undefined): number | null {
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

/** Set the signed session cookie for `userId`. */
export function setSessionCookie(cookies: Cookies, userId: number): void {
  cookies.set(COOKIE_NAME, serialize(userId), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: !dev,
    maxAge: MAX_AGE
  });
}

/** Clear the session cookie. */
export function clearSessionCookie(cookies: Cookies): void {
  cookies.delete(COOKIE_NAME, { path: "/" });
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
