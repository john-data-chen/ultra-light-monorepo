import { getMonthlyStats } from "@ultra-light/db";
import { MonthString } from "@ultra-light/shared";
import { Hono } from "hono";

import { authMiddleware } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const stats = new Hono<AppEnv>();

stats.use("*", authMiddleware);

stats.get("/", async (c) => {
  const user = c.get("user");

  const month = c.req.query("month");
  if (!month) {
    return c.json({ message: "Missing month parameter" }, 400);
  }

  const result = MonthString.safeParse(month);
  if (!result.success) {
    return c.json({ message: result.error.issues[0].message }, 400);
  }

  const monthlyStats = await getMonthlyStats(user.id, result.data);
  return c.json(monthlyStats);
});

export default stats;
