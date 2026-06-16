import { DEMO_EMAIL } from "$lib/constants";
import * as m from "$lib/paraglide/messages";
import { fail, redirect } from "@sveltejs/kit";
import { z } from "zod";

import type { Actions, PageServerLoad } from "./$types";

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

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
        const error = await response.json().catch(() => ({ message: "Login failed" }));
        return fail(400, { email, message: error.message });
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
