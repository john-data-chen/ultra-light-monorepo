import { Hono } from "hono";
import { logger } from "hono/logger";

import admin from "./routes/admin";
import auth from "./routes/auth";
import docs from "./routes/docs";
import login from "./routes/login";
import stats from "./routes/stats";
import transactions from "./routes/transactions";
import type { AppEnv } from "./types";

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

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT) || 3001;
  console.log(`API listening on http://localhost:${port}`);
  import("@hono/node-server").then(({ serve }) => {
    serve({ fetch: app.fetch, port });
  });
}
