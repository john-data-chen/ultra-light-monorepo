import { apiError, requireApiUser, requireRateLimit } from "$lib/server/api";
import { recordAudit } from "$lib/server/db/audit";
import { getTransaction, updateTransaction, deleteTransaction } from "$lib/server/db/queries";
import { TransactionUpdate, TransactionCreate, serializeTransaction } from "$lib/server/schemas";
import { json, type RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent) {
  const user = requireApiUser(event.locals);
  const id = Number(event.params.id);
  if (!Number.isInteger(id)) {
    return apiError(400, "Invalid ID");
  }

  const transaction = await getTransaction(user.id, id);
  if (!transaction) {
    return apiError(404, "Transaction not found");
  }

  return json(serializeTransaction(transaction));
}

export async function PATCH(event: RequestEvent) {
  requireRateLimit(event, "api-transactions-mutate");
  const user = requireApiUser(event.locals);
  const id = Number(event.params.id);
  if (!Number.isInteger(id)) {
    return apiError(400, "Invalid ID");
  }

  const body = await event.request.json().catch(() => null);
  if (!body) {
    return apiError(400, "Invalid JSON");
  }

  const result = TransactionUpdate.safeParse(body);
  if (!result.success) {
    return apiError(400, result.error.issues[0].message);
  }

  const existing = await getTransaction(user.id, id);
  if (!existing) {
    return apiError(404, "Transaction not found");
  }

  const updatedInput = {
    type: result.data.type ?? existing.type,
    category: result.data.category ?? existing.category,
    amount: result.data.amount ?? existing.amount,
    occurredOn: result.data.occurredOn ?? existing.occurredOn,
    note: result.data.note !== undefined ? result.data.note : existing.note
  };

  const validation = TransactionCreate.safeParse(updatedInput);
  if (!validation.success) {
    return apiError(400, validation.error.issues[0].message);
  }

  const updated = await updateTransaction(user.id, id, validation.data);
  if (!updated) {
    return apiError(404, "Transaction not found");
  }

  await recordAudit(
    user.id,
    "update",
    "transaction",
    id,
    `${updated.type} in ${updated.category} for ${updated.amount}`
  );

  return json(serializeTransaction(updated));
}

export async function DELETE(event: RequestEvent) {
  requireRateLimit(event, "api-transactions-mutate");
  const user = requireApiUser(event.locals);
  const id = Number(event.params.id);
  if (!Number.isInteger(id)) {
    return apiError(400, "Invalid ID");
  }

  const deleted = await deleteTransaction(user.id, id);
  if (!deleted) {
    return apiError(404, "Transaction not found");
  }

  await recordAudit(user.id, "delete", "transaction", id, null);

  return new Response(null, { status: 204 });
}
