import { currentMonth, isValidMonth } from "$lib/date";
import { getMonthlyStats } from "$lib/server/db/queries";
import { requireUser } from "$lib/server/guards";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const user = requireUser(locals);

  const monthParam = url.searchParams.get("month");
  const month = monthParam && isValidMonth(monthParam) ? monthParam : currentMonth();

  const stats = await getMonthlyStats(user.id, month);

  return { month, stats };
};
