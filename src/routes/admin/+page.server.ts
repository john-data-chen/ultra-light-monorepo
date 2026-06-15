import { listUsersWithStats } from "$lib/server/db/admin";
import { listRecentAudits } from "$lib/server/db/audit";
import { requireAdmin } from "$lib/server/guards";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  requireAdmin(locals);

  const [users, recentAudits] = await Promise.all([listUsersWithStats(), listRecentAudits(50)]);

  return { users, recentAudits };
};
