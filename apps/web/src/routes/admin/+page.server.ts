import { apiFetch, getCookieHeader } from "$lib/server/api";
import { requireAdmin } from "$lib/server/session";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, cookies }) => {
  requireAdmin(locals);

  const [users, recentAudits] = await Promise.all([
    apiFetch<
      Array<{
        id: number;
        name: string;
        email: string;
        avatar: string | null;
        role: string;
        transactionCount: number;
        totalIncome: number;
        totalExpense: number;
      }>
    >("/api/admin/users", {
      cookie: getCookieHeader(cookies)
    }),
    apiFetch<
      Array<{
        id: number;
        actor: {
          id: number;
          name: string;
          avatar: string | null;
          email: string;
        };
        action: string;
        entity: string;
        entityId: number | null;
        summary: string | null;
        createdAt: string;
      }>
    >("/api/admin/audit?limit=50", {
      cookie: getCookieHeader(cookies)
    })
  ]);

  return { users, recentAudits };
};
