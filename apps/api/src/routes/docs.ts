import { apiReference } from "@scalar/hono-api-reference";
import { Hono } from "hono";

import { openApiSpec } from "../openapi";

const docs = new Hono();

docs.get("/openapi.json", (c) => c.json(openApiSpec));

docs.get(
  "/docs",
  apiReference({
    spec: { url: "/api/openapi.json" },
    pageTitle: "Ultra Light API Documentation"
  })
);

export default docs;
