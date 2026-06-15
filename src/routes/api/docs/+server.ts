import { requireAdmin } from "$lib/server/guards";
import type { RequestEvent } from "@sveltejs/kit";

export function GET(event: RequestEvent) {
  requireAdmin(event.locals);
  const html = `<!DOCTYPE html>
<html>
  <head>
    <title>Expense Tracker API Reference</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    <!-- Mount Scalar here -->
    <script id="api-reference" data-url="/api/openapi.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.58.0" integrity="sha384-OYnMCMKIwY/7+TI/gqX7yuLg86XGVgTUd04CL3OTv3nKKKxY1fmsMPMIu+7NtVcq" crossorigin="anonymous"></script>
  </body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}
