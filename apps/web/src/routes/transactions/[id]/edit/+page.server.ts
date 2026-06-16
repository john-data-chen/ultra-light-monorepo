import * as m from "$lib/paraglide/messages";
import { apiFetch, getCookieHeader } from "$lib/server/api";
import { requireUser } from "$lib/server/session";
import { error, fail, redirect } from "@sveltejs/kit";
import { z } from "zod";

import type { Actions, PageServerLoad } from "./$types";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(1),
  amount: z.string().regex(/^\d+$/, "Amount must be a positive integer"),
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  note: z.string().optional()
});

export const load: PageServerLoad = async ({ locals, params, cookies }) => {
  const user = requireUser(locals);

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    error(404, m.error_transaction_not_found());
  }

  const transaction = await apiFetch<{
    id: number;
    type: string;
    category: string;
    amount: number;
    occurredOn: string;
    note: string;
  }>(`/api/transactions/${id}`, {
    cookie: getCookieHeader(cookies)
  });

  if (!transaction) {
    error(404, m.error_transaction_not_found());
  }

  return { transaction };
};

export const actions: Actions = {
  default: async ({ request, locals, params, cookies }) => {
    const user = requireUser(locals);

    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      error(404, m.error_transaction_not_found());
    }

    const formData = await request.formData();
    const data = {
      type: formData.get("type") as string,
      category: formData.get("category") as string,
      amount: formData.get("amount") as string,
      occurredOn: formData.get("occurredOn") as string,
      note: (formData.get("note") as string) || undefined
    };

    const result = transactionSchema.safeParse(data);
    if (!result.success) {
      return fail(400, { values: data, error: result.error.issues[0].message });
    }

    await apiFetch(`/api/transactions/${id}`, {
      method: "PATCH",
      cookie: getCookieHeader(cookies),
      body: result.data
    });

    redirect(303, "/transactions");
  }
};
