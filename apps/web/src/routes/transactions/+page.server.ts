import { ALL_CATEGORIES } from "$lib/categories";
import { isValidMonth } from "$lib/date";
import { apiFetch, getCookieHeader } from "$lib/server/api";
import { requireUser } from "$lib/server/session";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url, cookies }) => {
  const user = requireUser(locals);

  const categoryParam = url.searchParams.get("category") ?? "";
  const monthParam = url.searchParams.get("month") ?? "";

  const category = categoryParam || undefined;
  const month = isValidMonth(monthParam) ? monthParam : undefined;

  const params = new URLSearchParams();
  if (category) {
    params.set("category", category);
  }
  if (month) {
    params.set("month", month);
  }

  const transactions = await apiFetch<
    Array<{
      id: number;
      type: string;
      category: string;
      amount: number;
      occurredOn: string;
      note: string;
    }>
  >(`/api/transactions?${params.toString()}`, {
    cookie: getCookieHeader(cookies)
  });

  return {
    transactions,
    filters: { category: category ?? "", month: month ?? "" },
    categoryOptions: ALL_CATEGORIES
  };
};

export const actions: Actions = {
  delete: async ({ request, locals, cookies }) => {
    const user = requireUser(locals);

    const form = await request.formData();
    const id = Number(form.get("id"));
    if (Number.isInteger(id) && id > 0) {
      await apiFetch(`/api/transactions/${id}`, {
        method: "DELETE",
        cookie: getCookieHeader(cookies)
      });
    }

    return { deleted: true };
  }
};
