import { ALL_CATEGORIES } from "$lib/categories";
import { isValidMonth } from "$lib/date";
import { apiFetch, getCookieHeader } from "$lib/server/api";
import { requireUser } from "$lib/server/session";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url, cookies }) => {
  const _user = requireUser(locals);

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
  // The list renders all rows client-side (sort/filter happen in the browser) and has no
  // pagination UI, so request the API's max page size to avoid silently truncating at the
  // default limit of 20.
  params.set("limit", "100");

  const { data: transactions } = await apiFetch<{
    data: Array<{
      id: number;
      type: string;
      category: string;
      amount: number;
      occurredOn: string;
      note: string | null;
    }>;
    pagination: { total: number; limit: number; offset: number };
  }>(`/api/transactions?${params.toString()}`, {
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
    const _user = requireUser(locals);

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
