import type { SessionUser } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";

/** Return the signed-in user, or redirect to the login page when absent. */
export function requireUser(locals: App.Locals): SessionUser {
  if (!locals.user) {
    redirect(303, "/login");
  }
  return locals.user;
}

/**
 * Return the signed-in user if they have the admin role.
 * Redirects to "/" for non-admin users (friendlier than a 403; use 403 for stricter API endpoints).
 */
export function requireAdmin(locals: App.Locals): SessionUser {
  const user = requireUser(locals);
  if (user.role !== "admin") {
    redirect(303, "/");
  }
  return user;
}
