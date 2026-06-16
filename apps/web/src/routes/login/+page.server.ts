import { env } from "$env/dynamic/private";
import { DEMO_EMAIL } from "$lib/constants";
import * as m from "$lib/paraglide/messages";
import { fail, redirect } from "@sveltejs/kit";
import { z } from "zod";

import type { Actions, PageServerLoad } from "./$types";

const BASE_URL = env.API_BASE_URL || "http://localhost:3001";

const emailSchema = z.string().email("Invalid email format");

export const load: PageServerLoad = () => {
  return { defaultEmail: DEMO_EMAIL };
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const form = await request.formData();
    const email = form.get("email") as string;

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      return fail(400, { email, message: result.error.issues[0].message });
    }

    try {
      const response = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: result.data })
      });

      if (!response.ok) {
        // Surface the real failure instead of flattening every non-2xx into a 400.
        // 401 = no account for that email; 5xx (or a non-JSON platform error page such
        // as a Vercel 404) = the API is unreachable/misconfigured -> service unavailable.
        if (response.status === 401) {
          return fail(401, { email, message: m.login_error_no_account() });
        }
        if (response.status >= 500 || response.status === 404) {
          return fail(503, { email, message: m.login_error_service_unavailable() });
        }
        const error = await response.json().catch(() => ({ message: "Login failed" }));
        return fail(response.status, { email, message: error.message });
      }

      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader) {
        const cookieMatch = setCookieHeader.match(/session=([^;]+)/);
        if (cookieMatch) {
          cookies.set("session", cookieMatch[1], {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 60 * 60 * 24 * 30
          });
        }
      }
    } catch (error) {
      console.error("[login] API call failed:", error);
      return fail(503, { email, message: m.login_error_service_unavailable() });
    }

    redirect(303, "/");
  }
};
