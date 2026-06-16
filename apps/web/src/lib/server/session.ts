import { SESSION_COOKIE_NAME, type SessionUser } from "./auth";

export async function resolveSessionUser(
  cookieValue: string | undefined
): Promise<SessionUser | null> {
  if (!cookieValue) {
    return null;
  }

  try {
    const baseUrl = process.env.API_BASE_URL || "http://localhost:3001";
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=${cookieValue}`
      }
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    return user as SessionUser;
  } catch (error) {
    console.error("[session] API call failed:", error);
    return null;
  }
}

export function requireUser(locals: App.Locals): SessionUser {
  const user = locals.user;
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export function requireAdmin(locals: App.Locals): SessionUser {
  const user = requireUser(locals);
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return user;
}
