import { db } from "./client";
import type { UserRole } from "./schema";

export interface UserOverview {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  transactionCount: number;
  totalIncome: number;
  totalExpense: number;
}

/** Fetch all users with aggregated transaction stats (for admin overview). */
export async function listUsersWithStats(): Promise<UserOverview[]> {
  const rows = await db.$queryRaw<
    Array<{
      id: number;
      name: string;
      email: string;
      avatar: string;
      role: UserRole;
      transactionCount: number | bigint;
      totalIncome: number | bigint;
      totalExpense: number | bigint;
    }>
  >`
    select
      u."id",
      u."name",
      u."email",
      u."avatar",
      u."role",
      count(t."id")::int as "transactionCount",
      coalesce(sum(case when t."type" = 'income' then t."amount" else 0 end), 0)::int as "totalIncome",
      coalesce(sum(case when t."type" = 'expense' then t."amount" else 0 end), 0)::int as "totalExpense"
    from "users" u
    left join "transactions" t on t."user_id" = u."id"
    group by u."id"
    order by u."id"
  `;

  return rows.map((row) => ({
    ...row,
    transactionCount: Number(row.transactionCount),
    totalIncome: Number(row.totalIncome),
    totalExpense: Number(row.totalExpense)
  }));
}
