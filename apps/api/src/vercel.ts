import { getRequestListener } from "@hono/node-server";

import app from "./index.js";

// Vercel serverless entry. `getRequestListener` turns the Hono app's Web `fetch` handler
// into the Node.js `(req, res)` listener that a standalone Vercel Function expects.
// (`@hono/node-server` v2 removed the `/vercel` subpath; this is the supported equivalent.)
// The default export of `./index.js` stays the raw Hono `app` (used by tests).
export default getRequestListener(app.fetch);
