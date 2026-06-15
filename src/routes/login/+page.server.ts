import { DEMO_EMAIL } from "$lib/constants";
import * as m from "$lib/paraglide/messages";
import { setSessionCookie } from "$lib/server/auth";
import { findLoginUserByEmail, logLoginInfrastructureError } from "$lib/server/login";
import { rateLimit } from "$lib/server/rate-limit";
import { parseLoginEmail } from "$lib/server/validation";
import { fail, redirect } from "@sveltejs/kit";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
  return { defaultEmail: DEMO_EMAIL };
};

export const actions: Actions = {
  default: async ({ request, cookies, getClientAddress, setHeaders }) => {
    const ip = getClientAddress();
    const limitResult = rateLimit(`login:${ip}`, { windowMs: 60 * 1000, max: 10 });
    if (!limitResult.success) {
      setHeaders({
        "Retry-After": String(limitResult.retryAfter)
      });
      return fail(429, { email: "", message: m.login_error_service_unavailable() });
    }

    const form = await request.formData();
    const parsed = parseLoginEmail(form);

    if (!parsed.ok) {
      return fail(400, { email: parsed.email, message: parsed.message });
    }
    const email = parsed.email;

    const user = await findLoginUserByEmail(email);

    if (user.type === "service_unavailable") {
      return fail(503, { email, message: m.login_error_service_unavailable() });
    }

    if (user.type === "not_found") {
      return fail(400, { email, message: m.login_error_no_account() });
    }

    try {
      setSessionCookie(cookies, user.userId);
    } catch (error) {
      logLoginInfrastructureError("session cookie setup failed", error);
      return fail(503, { email, message: m.login_error_service_unavailable() });
    }

    redirect(303, "/");
  }
};
