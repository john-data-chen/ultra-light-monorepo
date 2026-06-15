import { clearSessionCookie } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";

import type { Actions, PageServerLoad } from "./$types";

// Direct GET visits have nothing to show — bounce to the dashboard.
export const load: PageServerLoad = () => {
  redirect(307, "/");
};

export const actions: Actions = {
  default: ({ cookies }) => {
    clearSessionCookie(cookies);
    redirect(303, "/login");
  }
};
