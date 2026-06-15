import { requireApiAdmin } from "$lib/server/api";
import { getOpenApiSpec } from "$lib/server/openapi";
import { json } from "@sveltejs/kit";

import type { RequestEvent } from "./$types";

export function GET(event: RequestEvent) {
  requireApiAdmin(event.locals);
  const spec = getOpenApiSpec();
  return json(spec);
}
