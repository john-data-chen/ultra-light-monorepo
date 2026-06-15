import type { TransactionType } from "$lib/categories";

import type { Transaction as DbTransaction, Prisma } from "./generated/client";
import type { Transaction } from "./schema";

import { db } from "./index";

export interface TransactionInput {
  type: TransactionType;
  category: string;
  amount: number;
  occurredOn: string;
  note: string | null;
}

export interface ListFilters {
  category?: string;
  month?: string; // "YYYY-MM"
}

export interface CategoryTotal {
  category: string;
  total: number;
}

export interface MonthlyStats {
  income: number;
  expense: number;
  balance: number;
  expenseByCategory: CategoryTotal[];
}

/** Convert a "YYYY-MM-DD" string to the UTC Date Prisma expects for date-only columns. */
function toDbDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

/** Convert a date-only column value back to its "YYYY-MM-DD" string form. */
function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function toAppTransaction(row: DbTransaction): Transaction {
  return { ...row, occurredOn: toIsoDate(row.occurredOn) };
}

/** Inclusive start / exclusive end ISO dates for a "YYYY-MM" month. */
function monthRange(month: string): { start: string; end: string } {
  const [year, monthIndex] = month.split("-").map(Number);
  const start = `${month}-01`;
  const end =
    monthIndex === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
  return { start, end };
}

function whereForFilters(userId: number, filters: ListFilters): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { userId };

  if (filters.category) {
    where.category = filters.category;
  }
  if (filters.month) {
    const { start, end } = monthRange(filters.month);
    where.occurredOn = { gte: toDbDate(start), lt: toDbDate(end) };
  }

  return where;
}

/** List a user's transactions, optionally filtered by category and/or month. */
export async function listTransactions(
  userId: number,
  filters: ListFilters = {}
): Promise<Transaction[]> {
  const rows = await db.transaction.findMany({
    where: whereForFilters(userId, filters),
    orderBy: [{ occurredOn: "desc" }, { id: "desc" }]
  });

  return rows.map(toAppTransaction);
}

/** Fetch a single transaction owned by the user, or null. */
export async function getTransaction(userId: number, id: number): Promise<Transaction | null> {
  const row = await db.transaction.findFirst({ where: { id, userId } });

  return row ? toAppTransaction(row) : null;
}

/** Insert a new transaction for the user. */
export async function createTransaction(
  userId: number,
  input: TransactionInput
): Promise<Transaction> {
  const row = await db.transaction.create({
    data: { ...input, occurredOn: toDbDate(input.occurredOn), userId }
  });

  return toAppTransaction(row);
}

/** Update a transaction only if it belongs to the user. Returns null when not owned/found. */
export async function updateTransaction(
  userId: number,
  id: number,
  input: TransactionInput
): Promise<Transaction | null> {
  const { count } = await db.transaction.updateMany({
    where: { id, userId },
    data: { ...input, occurredOn: toDbDate(input.occurredOn) }
  });

  if (count === 0) {
    return null;
  }

  return getTransaction(userId, id);
}

export interface DeletedTransaction {
  id: number;
  type: TransactionType;
  category: string;
  amount: number;
}

/** Delete a transaction only if it belongs to the user. Returns the deleted transaction details or null. */
export async function deleteTransaction(
  userId: number,
  id: number
): Promise<DeletedTransaction | null> {
  const row = await db.transaction.findFirst({
    where: { id, userId },
    select: { id: true, type: true, category: true, amount: true }
  });

  if (!row) {
    return null;
  }

  await db.transaction.deleteMany({ where: { id, userId } });

  return row;
}

/** Aggregate a user's income / expense / balance and expense-by-category for one month. */
export async function getMonthlyStats(userId: number, month: string): Promise<MonthlyStats> {
  const { start, end } = monthRange(month);
  const monthScope: Prisma.TransactionWhereInput = {
    userId,
    occurredOn: { gte: toDbDate(start), lt: toDbDate(end) }
  };

  const totals = await db.transaction.groupBy({
    by: ["type"],
    where: monthScope,
    _sum: { amount: true }
  });

  let income = 0;
  let expense = 0;
  for (const row of totals) {
    if (row.type === "income") {
      income = row._sum.amount ?? 0;
    } else {
      expense = row._sum.amount ?? 0;
    }
  }

  const byCategory = await db.transaction.groupBy({
    by: ["category"],
    where: { ...monthScope, type: "expense" },
    _sum: { amount: true }
  });

  const expenseByCategory = byCategory
    .map((row) => ({ category: row.category, total: row._sum.amount ?? 0 }))
    .sort((a, b) => b.total - a.total);

  return { income, expense, balance: income - expense, expenseByCategory };
}

export interface ListPagedFilters extends ListFilters {
  limit?: number;
  offset?: number;
}

/** List a user's transactions with pagination, returning rows and total count. */
export async function listTransactionsPaged(
  userId: number,
  filters: ListPagedFilters = {}
): Promise<{ rows: Transaction[]; total: number }> {
  const where = whereForFilters(userId, filters);

  const [total, rows] = await Promise.all([
    db.transaction.count({ where }),
    db.transaction.findMany({
      where,
      orderBy: [{ occurredOn: "desc" }, { id: "desc" }],
      ...(filters.limit !== undefined ? { take: filters.limit } : {}),
      ...(filters.offset !== undefined ? { skip: filters.offset } : {})
    })
  ]);

  return { rows: rows.map(toAppTransaction), total };
}
