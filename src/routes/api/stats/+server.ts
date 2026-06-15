import { apiError, requireApiUser } from "$lib/server/api";
import { getMonthlyStats } from "$lib/server/db/queries";
import { MonthString } from "$lib/server/schemas";
import { json, type RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent) {
  const user = requireApiUser(event.locals);

  const month = event.url.searchParams.get("month");
  if (!month) {
    return apiError(400, "Missing month parameter");
  }

  const result = MonthString.safeParse(month);
  if (!result.success) {
    return apiError(400, result.error.issues[0].message);
  }

  const stats = await getMonthlyStats(user.id, result.data);
  return json(stats);
}
