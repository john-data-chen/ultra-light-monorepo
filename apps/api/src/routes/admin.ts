import { listUsersWithStats, listRecentAudits } from "@ultra-light/db";
import { Hono } from "hono";

import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../types";

const admin = new Hono<AppEnv>();

admin.use("*", authMiddleware);

admin.use("*", async (c, next) => {
  const user = c.get("user");
  if (user.role !== "admin") {
    return c.json({ message: "Forbidden" }, 403);
  }
  await next();
});

admin.get("/users", async (c) => {
  const users = await listUsersWithStats();
  return c.json(users);
});

admin.get("/audit", async (c) => {
  const limit = Number(c.req.query("limit")) || 50;
  const audits = await listRecentAudits(limit);
  return c.json(audits);
});

export default admin;
