import { Hono } from "hono";
import { logger } from "hono/logger";

import admin from "./routes/admin";
import login from "./routes/login";
import stats from "./routes/stats";
import transactions from "./routes/transactions";
const app = new Hono();
app.use("*", logger());
app.get("/", (c) => c.json({ message: "Ultra Light API" }));
app.route("/api/login", login);
app.route("/api/transactions", transactions);
app.route("/api/stats", stats);
app.route("/api/admin", admin);
app.notFound((c) => c.json({ message: "Not Found" }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ message: "Internal Server Error" }, 500);
});
export default app;
//# sourceMappingURL=index.js.map
