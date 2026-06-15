import { apiError, requireApiUser, requireRateLimit } from "$lib/server/api";
import { recordAudit } from "$lib/server/db/audit";
import { createTransaction, listTransactionsPaged } from "$lib/server/db/queries";
import { TransactionCreate, TransactionListQuery, serializeTransaction } from "$lib/server/schemas";
import { json, type RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent) {
  const user = requireApiUser(event.locals);

  const category = event.url.searchParams.get("category") || undefined;
  const month = event.url.searchParams.get("month") || undefined;
  const limit = event.url.searchParams.get("limit") || undefined;
  const offset = event.url.searchParams.get("offset") || undefined;

  const queryResult = TransactionListQuery.safeParse({ category, month, limit, offset });
  if (!queryResult.success) {
    return apiError(400, "Invalid query parameters");
  }

  const clampedLimit = Math.min(queryResult.data.limit, 100);
  const parsedOffset = queryResult.data.offset;

  const { rows, total } = await listTransactionsPaged(user.id, {
    category: queryResult.data.category,
    month: queryResult.data.month,
    limit: clampedLimit,
    offset: parsedOffset
  });

  return json({
    data: rows.map(serializeTransaction),
    pagination: {
      total,
      limit: clampedLimit,
      offset: parsedOffset
    }
  });
}

export async function POST(event: RequestEvent) {
  requireRateLimit(event, "api-transactions-mutate");
  const user = requireApiUser(event.locals);

  const body = await event.request.json().catch(() => null);
  if (!body) {
    return apiError(400, "Invalid JSON");
  }

  const result = TransactionCreate.safeParse(body);
  if (!result.success) {
    return apiError(400, result.error.issues[0].message);
  }

  const transaction = await createTransaction(user.id, result.data);
  await recordAudit(
    user.id,
    "create",
    "transaction",
    transaction.id,
    `${transaction.type} in ${transaction.category} for ${transaction.amount}`
  );

  return json(serializeTransaction(transaction), { status: 201 });
}
