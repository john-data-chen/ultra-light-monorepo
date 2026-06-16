import { dev } from "$app/environment";
import { getTextDirection } from "$lib/paraglide/runtime";
import { paraglideMiddleware } from "$lib/paraglide/server";
import { SESSION_COOKIE_NAME } from "$lib/server/auth";
import { resolveSessionUser } from "$lib/server/session";
import { THEME_COOKIE } from "$lib/theme";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.user = await resolveSessionUser(event.cookies.get(SESSION_COOKIE_NAME));

  // Render the `.dark` class on <html> for the explicit-dark and default (no cookie)
  // cases so the no-JS fallback and first-paint markup are correct. `light` and `system`
  // are resolved by the inline bootstrap script in app.html (the server cannot read the
  // OS preference); that script reconciles every case before first paint.
  const themeCookie = event.cookies.get(THEME_COOKIE);
  const htmlClass = themeCookie === undefined || themeCookie === "dark" ? ' class="dark"' : "";

  // Resolve the locale (cookie strategy → `zh-tw` default when no cookie) and render the
  // `<html lang>/<dir>` placeholders plus the theme class in a single pass. paraglideMiddleware
  // also establishes the request-scoped locale context so server `load`/actions can resolve
  // localized messages. The `.dark` class is injected on `<html` (a stable anchor) because the
  // `lang` attribute is now a Paraglide placeholder rather than the literal `lang="en"`.
  const response = await paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;

    return resolve(event, {
      transformPageChunk: ({ html }) =>
        html
          .replace("%paraglide.lang%", locale)
          .replace("%paraglide.dir%", getTextDirection(locale))
          .replace("<html", `<html${htmlClass}`)
    });
  });

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("text/html")) {
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    if (!dev) {
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
      );
    }

    if (dev) {
      response.headers.delete("Content-Security-Policy");
    }
  }

  return response;
};
