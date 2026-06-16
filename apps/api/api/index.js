// Vercel serverless entry — a zero-config `@vercel/node` Function.
//
// This thin, STABLE file is committed (it never changes between builds) so Vercel
// detects the Function at clone time. The actual handler is the esbuild bundle at
// `../dist/vercel.js`, produced by `pnpm run build` and traced by `@vercel/node`
// (which pulls in the externalized `@prisma/client` / `@prisma/adapter-pg` / `pg`).
//
// Routing: `vercel.json` uses a legacy `routes` rewrite (`/(.*) -> /api/index`) that
// is evaluated BEFORE the filesystem handler, so every request resolves to this
// function with its ORIGINAL path preserved. That avoids Vercel's auto-generated
// `^/api(/.*)?$ -> 404` guard, which previously shadowed the function and made every
// route return a platform 404.
export { default } from "../dist/vercel.js";
