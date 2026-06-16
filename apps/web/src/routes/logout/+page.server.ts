import { redirect } from "@sveltejs/kit";

import type { Actions, PageServerLoad } from "./$types";

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

export const load: PageServerLoad = () => {
  redirect(307, "/");
};

export const actions: Actions = {
  default: async ({ cookies }) => {
    const cookieValue = cookies.get("session");

    if (cookieValue) {
      try {
        await fetch(`${BASE_URL}/api/login/logout`, {
          method: "POST",
          headers: {
            Cookie: `session=${cookieValue}`
          }
        });
      } catch (error) {
        console.error("[logout] API call failed:", error);
      }
    }

    cookies.delete("session", { path: "/" });
    redirect(303, "/login");
  }
};
