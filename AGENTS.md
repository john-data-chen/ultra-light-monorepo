# AGENTS.md

Guidance for AI working in this repo. Terse on purpose — names of skills, MCP servers,
tools, and commands are literal. Use them exactly as written.

# Verification Workflow (MANDATORY)

After **every** code change, run in order — each must pass with zero errors/warnings:

```bash
pnpm lint     # 1. lint (oxlint TS/JS + ESLint .svelte), via turbo
pnpm build    # 2. build, via turbo
pnpm check    # 3. type check, via turbo
```

After user confirms the change, also run:

```bash
pnpm test           # 4. unit/integration (vitest), via turbo
pnpm test:coverage  # 5. coverage (web+api+shared >=90)
pnpm test:e2e       # 6. e2e (playwright); needs live Postgres + dev servers
```

Any step fails → fix before proceeding. Add/update tests after user confirms results.

# Commands

- `pnpm dev` — turbo dev (web+api). Usually already running; don't start unless confirmed.
- `pnpm build` / `pnpm check` / `pnpm lint` — turbo across all workspaces.
- `pnpm test` / `pnpm test:coverage` / `pnpm test:e2e` — see workflow above.
- `pnpm db:generate` / `pnpm db:migrate` / `pnpm db:push` / `pnpm db:seed` / `pnpm db:studio` — Prisma (`packages/db`).
- Scope one workspace: `pnpm --filter @ultra-light/<web|api|db|shared|ui> <script>`.

# Architecture

Turborepo monorepo. `apps/web` (SvelteKit, SSR-proxies the API) + `apps/api` (Hono) +
`packages/*` (db, shared, ui, configs). Full detail: README.md (root).

# Skills (`.agents/skills/`) — load when trigger matches

| Skill                                  | Use when                                                                                                   |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `karpathy-guidelines`                  | **Every** coding task — write/review/refactor; surgical changes.                                           |
| `turborepo`                            | turbo.json, task pipeline, dependsOn, caching, `--filter`, monorepo layout.                                |
| `hono`                                 | Building/editing the Hono API; routing, middleware, validation, testing (`apps/api`, imports from `hono`). |
| `svelte-code-writer`                   | Create/edit/analyze any `.svelte` / `.svelte.ts` / `.svelte.js`.                                           |
| `svelte-core-bestpractices`            | Writing/analyzing Svelte — reactivity, events, styling, libs.                                              |
| `shadcn-svelte`                        | shadcn-svelte UI — add/update/fix/compose components, `components.json` (`packages/ui`).                   |
| `doc-coauthoring`                      | Writing/editing docs, proposals, specs, decision docs (e.g. READMEs).                                      |
| `session-handoff`                      | Task plans + execution logs (`ai-docs/tasks.md`, `ai-docs/session-log.md`).                                |
| `prisma-cli`                           | Prisma CLI — init/generate/migrate/db/studio/validate/format.                                              |
| `prisma-client-api`                    | Prisma queries — findMany/create/update/delete/`$transaction`, filters, relations.                         |
| `prisma-database-setup`                | Configure Prisma DB provider / connection issues.                                                          |
| `prisma-postgres`                      | Prisma Postgres setup/ops — Console, create-db, Management API.                                            |
| `prisma-driver-adapter-implementation` | Implement/modify a Prisma v7 driver adapter.                                                               |

# MCP servers (`.mcp.json`) — use when trigger matches

| Server            | Use when                                                                                                                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `svelte`          | Any Svelte/SvelteKit work. Tools: `list-sections` (first), `get-documentation`, `svelte-autofixer` (run until clean before showing code), `playground-link` (only after user OK, never for files in repo). |
| `Prisma-Local`    | DB migrations/inspection. Tools: `migrate-dev`, `migrate-status`, `migrate-reset`, `Prisma-Studio`.                                                                                                        |
| `context7`        | Fetch current docs for any library/framework/API/CLI before answering. Tools: `resolve-library-id` then `query-docs`. Prefer over web search for library docs.                                             |
| `chrome-devtools` | Verify a running app — navigate, snapshot, screenshot, console, network, `lighthouse_audit`.                                                                                                               |

If a required MCP/skill is missing or disabled, warn the user before starting.
