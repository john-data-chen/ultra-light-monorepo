import { parseSessionCookie } from "$lib/server/auth";
import type { SessionUser } from "$lib/server/auth";

export function logSessionInfrastructureError(context: string, error: unknown): void {
  console.error(`[session] ${context}`, error);
}

export async function resolveSessionUser(
  cookieValue: string | undefined
): Promise<SessionUser | null> {
  let userId: number | null;

  try {
    userId = parseSessionCookie(cookieValue);
  } catch (error) {
    logSessionInfrastructureError("cookie parsing failed", error);
    return null;
  }

  if (userId === null) {
    return null;
  }

  try {
    const { db } = await import("$lib/server/db");
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, avatar: true, role: true }
    });

    return user ?? null;
  } catch (error) {
    logSessionInfrastructureError("user lookup failed", error);
    return null;
  }
}
