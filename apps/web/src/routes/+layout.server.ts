import { redirect } from "@sveltejs/kit";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ locals, url }) => {
  const onLoginPage = url.pathname === "/login";

  if (!locals.user && !onLoginPage) {
    redirect(303, "/login");
  }
  if (locals.user && onLoginPage) {
    redirect(303, "/");
  }

  return { user: locals.user };
};
