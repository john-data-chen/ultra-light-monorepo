import * as m from "$lib/paraglide/messages";
import { recordAudit } from "$lib/server/db/audit";
import { getTransaction, updateTransaction } from "$lib/server/db/queries";
import { requireUser } from "$lib/server/guards";
import { parseTransactionForm } from "$lib/server/validation";
import { error, fail, redirect } from "@sveltejs/kit";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
  const user = requireUser(locals);

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    error(404, m.error_transaction_not_found());
  }

  const transaction = await getTransaction(user.id, id);
  if (!transaction) {
    error(404, m.error_transaction_not_found());
  }

  return { transaction };
};

export const actions: Actions = {
  default: async ({ request, locals, params }) => {
    const user = requireUser(locals);

    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      error(404, m.error_transaction_not_found());
    }

    const result = parseTransactionForm(await request.formData());
    if (!result.ok) {
      return fail(400, { values: result.values, error: result.error });
    }

    const updated = await updateTransaction(user.id, id, result.data);
    if (!updated) {
      // Not owned by this user (or already gone).
      error(404, m.error_transaction_not_found());
    }

    await recordAudit(
      user.id,
      "update",
      "transaction",
      id,
      `${updated.type} ${updated.category} ${updated.amount}`
    );

    redirect(303, "/transactions");
  }
};
