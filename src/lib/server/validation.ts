import { isTransactionType, isValidCategory } from "$lib/categories";
import { isValidDate } from "$lib/date";
import { parseAmount } from "$lib/money";
import * as m from "$lib/paraglide/messages";
import type { TransactionInput } from "$lib/server/db/queries";
import type { TransactionFormValues } from "$lib/transaction";
import { z } from "zod";

import { TransactionCreate } from "./schemas";

export type TransactionFormResult =
  | { ok: true; data: TransactionInput }
  | { ok: false; values: TransactionFormValues; error: string };

function getStringEntry(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

// Rules live in `superRefine` so the Paraglide messages resolve at parse time (request
// scope) rather than at module import. Checks run in priority order and bail at the first
// failure, so a rejected form surfaces exactly one issue — `issues[0].message`.
const transactionSchema = z
  .object({
    type: z.string(),
    category: z.string(),
    amount: z.string(),
    occurredOn: z.string(),
    note: z.string()
  })
  .superRefine((values, ctx) => {
    if (!isTransactionType(values.type)) {
      ctx.addIssue({ code: "custom", message: m.validation_choose_type() });
      return;
    }
    if (!isValidCategory(values.type, values.category)) {
      ctx.addIssue({ code: "custom", message: m.validation_choose_category() });
      return;
    }
    const amount = parseAmount(values.amount);
    if (amount === null || amount <= 0) {
      ctx.addIssue({ code: "custom", message: m.validation_amount_positive() });
      return;
    }
    if (!isValidDate(values.occurredOn)) {
      ctx.addIssue({ code: "custom", message: m.validation_choose_date() });
    }
  })
  .transform((values) => ({
    type: values.type,
    category: values.category,
    amount: parseAmount(values.amount) as number,
    occurredOn: values.occurredOn,
    note: values.note.trim() || null
  }))
  .pipe(TransactionCreate);

/** Validate a transaction form submission against the fixed category lists. */
export function parseTransactionForm(form: FormData): TransactionFormResult {
  const values: TransactionFormValues = {
    type: getStringEntry(form, "type"),
    category: getStringEntry(form, "category"),
    amount: getStringEntry(form, "amount"),
    occurredOn: getStringEntry(form, "occurredOn"),
    note: getStringEntry(form, "note")
  };

  const result = transactionSchema.safeParse(values);
  if (!result.success) {
    return { ok: false, values, error: result.error.issues[0].message };
  }

  return { ok: true, data: result.data };
}

export type LoginEmailResult =
  | { ok: true; email: string }
  | { ok: false; email: string; message: string };

const emailSchema = z.email();

/** Validate a login email: required, normalized (trim + lowercase), and well-formed. */
export function parseLoginEmail(form: FormData): LoginEmailResult {
  const email = getStringEntry(form, "email").trim().toLowerCase();

  if (!email) {
    return { ok: false, email, message: m.login_error_email_required() };
  }
  if (!emailSchema.safeParse(email).success) {
    return { ok: false, email, message: m.login_error_email_invalid() };
  }

  return { ok: true, email };
}
