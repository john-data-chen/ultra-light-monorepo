import { today } from "$lib/date";
import { apiFetch, getCookieHeader } from "$lib/server/api";
import { requireUser } from "$lib/server/session";
import { fail, redirect } from "@sveltejs/kit";
import { z } from "zod";

import type { Actions, PageServerLoad } from "./$types";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(1),
  amount: z.string().regex(/^\d+$/, "Amount must be a positive integer"),
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  note: z.string().optional()
});

export const load: PageServerLoad = ({ locals }) => {
  requireUser(locals);
  return { today: today() };
};

export const actions: Actions = {
  default: async ({ request, locals, cookies }) => {
    const _user = requireUser(locals);

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

    await apiFetch("/api/transactions", {
      method: "POST",
      cookie: getCookieHeader(cookies),
      // The API validates amount as a number and note as a nullable (but present) field;
      // the form delivers amount as a numeric string and omits an empty note.
      body: {
        type: result.data.type,
        category: result.data.category,
        amount: Number(result.data.amount),
        occurredOn: result.data.occurredOn,
        note: result.data.note ?? null
      }
    });

    redirect(303, "/transactions");
  }
};
