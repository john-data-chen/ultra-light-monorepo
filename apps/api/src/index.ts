import { Hono } from "hono";
import { logger } from "hono/logger";

import admin from "./routes/admin.js";
import auth from "./routes/auth.js";
import docs from "./routes/docs.js";
import login from "./routes/login.js";
import stats from "./routes/stats.js";
import transactions from "./routes/transactions.js";
import type { AppEnv } from "./types.js";

const app = new Hono<AppEnv>();

app.use("*", logger());

app.get("/", (c) => c.json({ message: "Ultra Light API" }));

app.route("/api", docs);
app.route("/api/auth", auth);
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

if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  const port = Number(process.env.PORT) || 3001;
  console.log(`API listening on http://localhost:${port}`);
  import("@hono/node-server").then(({ serve }) => {
    serve({ fetch: app.fetch, port });
  });
}
