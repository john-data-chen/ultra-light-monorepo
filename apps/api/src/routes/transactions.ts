import {
  listTransactionsPaged,
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  recordAudit
} from "@ultra-light/db";
import { TransactionCreate, TransactionUpdate, TransactionListQuery } from "@ultra-light/shared";
import { Hono } from "hono";

import { authMiddleware } from "../middleware/auth.js";
import { rateLimitMiddleware } from "../middleware/rate-limit.js";
import type { AppEnv } from "../types.js";

const transactions = new Hono<AppEnv>();

transactions.use("*", authMiddleware);

function serializeTransaction(t: {
  id: number;
  userId: number;
  type: string;
  category: string;
  amount: number;
  occurredOn: Date | string;
  note: string | null;
  createdAt: Date;
}) {
  return {
    id: t.id,
    userId: t.userId,
    type: t.type,
    category: t.category,
    amount: t.amount,
    occurredOn:
      typeof t.occurredOn === "string" ? t.occurredOn : t.occurredOn.toISOString().slice(0, 10),
    note: t.note,
    createdAt: t.createdAt.toISOString()
  };
}

transactions.get("/", async (c) => {
  const user = c.get("user");

  const category = c.req.query("category") || undefined;
  const month = c.req.query("month") || undefined;
  const limit = c.req.query("limit") || undefined;
  const offset = c.req.query("offset") || undefined;

  const queryResult = TransactionListQuery.safeParse({ category, month, limit, offset });
  if (!queryResult.success) {
    return c.json({ message: "Invalid query parameters" }, 400);
  }

  const clampedLimit = Math.min(queryResult.data.limit, 100);
  const parsedOffset = queryResult.data.offset;

  const { rows, total } = await listTransactionsPaged(user.id, {
    category: queryResult.data.category,
    month: queryResult.data.month,
    limit: clampedLimit,
    offset: parsedOffset
  });

  return c.json({
    data: rows.map(serializeTransaction),
    pagination: {
      total,
      limit: clampedLimit,
      offset: parsedOffset
    }
  });
});

transactions.post("/", rateLimitMiddleware({ windowMs: 60 * 1000, max: 100 }), async (c) => {
  const user = c.get("user");

  const body = await c.req.json().catch(() => null);
  if (!body) {
    return c.json({ message: "Invalid JSON" }, 400);
  }

  const result = TransactionCreate.safeParse(body);
  if (!result.success) {
    return c.json({ message: result.error.issues[0].message }, 400);
  }

  const transaction = await createTransaction(user.id, {
    ...result.data,
    note: result.data.note ?? null
  });
  await recordAudit(
    user.id,
    "create",
    "transaction",
    transaction.id,
    `${transaction.type} ${transaction.category} ${transaction.amount}`
  );

  return c.json(serializeTransaction(transaction), 201);
});

transactions.get("/:id", async (c) => {
  const user = c.get("user");
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) {
    return c.json({ message: "Invalid ID" }, 400);
  }

  const transaction = await getTransaction(user.id, id);
  if (!transaction) {
    return c.json({ message: "Transaction not found" }, 404);
  }

  return c.json(serializeTransaction(transaction));
});

transactions.patch("/:id", rateLimitMiddleware({ windowMs: 60 * 1000, max: 100 }), async (c) => {
  const user = c.get("user");
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) {
    return c.json({ message: "Invalid ID" }, 400);
  }

  const body = await c.req.json().catch(() => null);
  if (!body) {
    return c.json({ message: "Invalid JSON" }, 400);
  }

  const result = TransactionUpdate.safeParse(body);
  if (!result.success) {
    return c.json({ message: result.error.issues[0].message }, 400);
  }

  const existing = await getTransaction(user.id, id);
  if (!existing) {
    return c.json({ message: "Transaction not found" }, 404);
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
    return c.json({ message: validation.error.issues[0].message }, 400);
  }

  const updated = await updateTransaction(user.id, id, {
    ...validation.data,
    note: validation.data.note ?? null
  });
  if (!updated) {
    return c.json({ message: "Transaction not found" }, 404);
  }

  await recordAudit(
    user.id,
    "update",
    "transaction",
    id,
    `${updated.type} ${updated.category} ${updated.amount}`
  );

  return c.json(serializeTransaction(updated));
});

transactions.delete("/:id", rateLimitMiddleware({ windowMs: 60 * 1000, max: 100 }), async (c) => {
  const user = c.get("user");
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) {
    return c.json({ message: "Invalid ID" }, 400);
  }

  const deleted = await deleteTransaction(user.id, id);
  if (!deleted) {
    return c.json({ message: "Transaction not found" }, 404);
  }

  await recordAudit(
    user.id,
    "delete",
    "transaction",
    id,
    `${deleted.type} ${deleted.category} ${deleted.amount}`
  );

  return c.body(null, 204);
});

export default transactions;
