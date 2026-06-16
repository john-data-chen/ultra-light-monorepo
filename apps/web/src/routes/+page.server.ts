import { currentMonth, isValidMonth } from "$lib/date";
import { apiFetch, getCookieHeader } from "$lib/server/api";
import { requireUser } from "$lib/server/session";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url, cookies }) => {
  const user = requireUser(locals);

  const monthParam = url.searchParams.get("month");
  const month = monthParam && isValidMonth(monthParam) ? monthParam : currentMonth();

  const stats = await apiFetch<{
    income: number;
    expense: number;
    balance: number;
    expenseByCategory: Array<{ category: string; total: number }>;
  }>(`/api/stats?month=${month}`, {
    cookie: getCookieHeader(cookies)
  });

  return { month, stats };
};
