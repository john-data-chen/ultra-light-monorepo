# Ultra Light Monorepo: Multi-user Online Ledger with Hono API + SvelteKit Frontend

[![CI](https://github.com/john-data-chen/sveltekit-starter-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/john-data-chen/sveltekit-starter-kit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A product-level monorepo centered around a real, multi-user (family) **online ledger**, where all accounts can add expenses and income, and view statistics. The administrator account can view the transaction history of all accounts.

Built as a **Turborepo monorepo** with a standalone **Hono.js API** backend and a **SvelteKit** frontend, deployed as two separate Vercel projects. UI uses **shadcn-svelte** components with Tailwind CSS v4.

**[Live Demo](https://sveltekit-starter-kit.vercel.app/login)** — press **Continue With Email** to sign in instantly as a seeded demo user.
**[Live API Docs](https://sveltekit-starter-kit.vercel.app/api/docs)** — interactive OpenAPI 3.1 reference (Scalar UI).

繁體中文版本請見 **[README-cht.md](./README-cht.md)**.

<table>
  <tr>
    <td align="center"><img src="./src/lib/assets/screenshots/login.png" alt="Passwordless email login screen, pre-filled with a demo account" width="140"></td>
    <td align="center"><img src="./src/lib/assets/screenshots/dashboard.png" alt="Dashboard showing monthly income, expense, balance and a pure-CSS category donut chart" width="140"></td>
    <td align="center"><img src="./src/lib/assets/screenshots/transactions.png" alt="Transaction list with category and month filters, plus edit and delete actions" width="140"></td>
    <td align="center"><img src="./src/lib/assets/screenshots/add-new-record.png" alt="New transaction form with type, category, amount, date and optional note fields" width="140"></td>
    <td align="center"><img src="./src/lib/assets/screenshots/admin.png" alt="Admin Governance view: per-user transaction counts, total income and expense across all members, plus a recent-activity audit trail" width="140"></td>
    <td align="center"><img src="./src/lib/assets/screenshots/api-docs.png" alt="Scalar UI for the Expense Tracker API: OpenAPI 3.1 spec with cookie auth, client libraries, and the List transactions endpoint" width="140"></td>
  </tr>
  <tr>
    <td align="center"><b>Login</b></td>
    <td align="center"><b>Dashboard</b></td>
    <td align="center"><b>Transactions</b></td>
    <td align="center"><b>Add Record</b></td>
    <td align="center"><b>Admin</b></td>
    <td align="center"><b>API Docs</b></td>
  </tr>
</table>

---

| Metric         | Result                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------ |
| Test Coverage  | See **codecov** badge above — 95+% via Vitest (unit + integration)                               |
| Code Quality   | See **SonarQube Quality Gate** badge above (Security, Reliability, Maintainability, all A level) |
| Lighthouse     | Production Lighthouse audit of the dashboard — **all 90+ scores**                                |
| E2E Validation | Cross-browser via Playwright (Chrome / Safari / Edge / Mobile Chrome / Mobile Safari)            |
| CI/CD pipeline | GitHub Actions → Gemini PR Review + SonarQube + Codecov → Vercel                                 |

---

## Production Lighthouse audit of the dashboard

<img src="./src/lib/assets/screenshots/dashboard-lighthouse-score.png" alt="Lighthouse audit of the dashboard: all 90+ scores" width="460">

---

## Technical Decisions

### Architecture

Evaluated adopting a UI component library; chose an internal Svelte 5 primitives layer instead — rationale: minimal-dependency narrative, abstraction without dependency cost, a11y-correct native `<dialog>`, and Svelte 5 snippets for pure HTML passthrough (no bind prop-drilling).

| Type          | Choice                                         | Rationale                                                                                                     |
| ------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Monorepo      | Turborepo + pnpm workspaces                    | First-party Vercel integration, task caching/orchestration, shared packages                                   |
| Frontend      | SvelteKit 2 + Svelte 5 (runes)                 | Fine-grained reactivity, SSR + form actions, server-side proxy to Hono API                                    |
| API           | Hono.js (Node runtime)                         | Lightweight, fast, OpenAPI support via `@hono/zod-openapi`, deployed as separate Vercel project               |
| Styling       | Tailwind CSS v4 + shadcn-svelte                | Utility-first styling with composable, accessible UI primitives (bits-ui)                                     |
| Database      | Prisma ORM + PostgreSQL                        | Declarative schema as single source of truth; type-safe generated client, in `packages/db`                    |
| DB Driver     | `pg` via `@prisma/adapter-pg`                  | Prisma v7 driver-adapter workflow; fast pooled driver, pairs with the Vercel Node serverless runtime          |
| Auth          | Password-less email + signed `httpOnly` cookie | No password storage; Hono API is single source of truth for session validation                                |
| Authz/RBAC    | Hono middleware + SvelteKit hooks              | Strict access control based on DB-backed user roles (`admin` vs `member`)                                     |
| Rate Limiting | In-memory fixed-window limiter (Hono API)      | Simple protection against brute-force attacks/abuse; Vercel KV/Redis will be used in production environments. |
| Security      | Nonce CSP + HSTS + hardened response headers   | Defense-in-depth; relaxed CSP for docs UI, stripped in dev for Vite HMR                                       |
| Validation    | Zod (shared schemas in `packages/shared`)      | Runtime validation at API boundaries — TS at compile time, Zod for untrusted input                            |
| API Docs      | OpenAPI 3.1 + Scalar UI                        | Spec served by Hono API at `/api/openapi.json` + `/api/docs`                                                  |
| Tables        | `@tanstack/table-core`                         | Headless, URL-synchronized sorting, rendered via pure Svelte components                                       |
| Charts        | Pure CSS donut                                 | Zero charting dependency — smaller bundle, full control                                                       |
| i18n          | Paraglide JS (`@inlang/paraglide-js`)          | Type-safe, tree-shakeable messages; English + Traditional Chinese                                             |
| Deploy        | Two Vercel projects (web + api)                | SvelteKit on `adapter-vercel`, Hono API on `@hono/node-server`; Turborepo drives build pipeline               |

### Quality Assurance

| Type              | Tool       | Rationale                                   |
| ----------------- | ---------- | ------------------------------------------- |
| Unit/Integration  | Vitest     | Faster than Jest, native ESM, Vite-native   |
| E2E               | Playwright | Cross-browser support, lighter than Cypress |
| Static Analysis   | SonarQube  | Quality gates bad smell scan enforced in CI |
| Coverage Tracking | Codecov    | Automated PR integration                    |

**Testing Strategy:**

- Unit tests target query logic, validation, and money formatting/parsing
- E2E tests validate critical flows (login, transaction CRUD)
- Each push/PR will first run the entire pipeline, be initially reviewed by Gemini, and then I will review it again. Only after both pass will it be merged (the free server performance is not enough, so CI only executes unit tests, and E2E runs on the local machine).

### Developer Experience

| Tool                    | Purpose                                                              |
| ----------------------- | -------------------------------------------------------------------- |
| oxlint                  | Rust-based linter for JS/TS, 50-100x faster than ESLint              |
| oxfmt                   | Rust-based formatter (JS/TS/CSS/HTML/JSON/MD/Svelte)                 |
| ESLint (Svelte)         | Svelte-aware linting for `.svelte` files (with content-hash caching) |
| Vite                    | Near-instant HMR and fast production builds                          |
| Husky + lint-staged     | Pre-commit quality enforcement                                       |
| commitlint + Commitizen | Conventional commits for a clean history                             |

### Architecture Decision Records (ADR)

| Decision                                                                     | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep `svelte.config.js`, do not integrate all settings into `vite.config.ts` | SvelteKit ≥ 2.62.0 can use `sveltekit()` to integrate the contents of `svelte.config.js` into `vite.config.ts`, but `svelte-check`, `eslint-plugin-svelte`, and IDEs (VS Code, etc.) still need to read `svelte.config.js` to obtain mandatory runes settings. This new approach requires abandoning the previous default settings, and overturning conventions may confuse other developers who take over. After weighing the pros and cons, the original approach was chosen. |
| Pooled `pg` TCP driver on Vercel Node (not Edge)                             | Reliable pooling, no proxy, identical local Docker Postgres                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Zod schema = single source of truth                                          | One schema → validation + TS types + OpenAPI 3.1; no drift                                                                                                                                                                                                                                                                                                                                                                                                                      |

---

## Features

- **Password-less email login** — three built-in accounts (`john@example.com` (Admin), `sophia@example.com` (Member), `mark@example.com` (Member)); the form is pre-filled with `john@example.com`, so one click signs you in. The `userId` lives in a signed, `httpOnly` session cookie.
- **Roles & Permissions (Governance)** — "member" role (default) has access to their own dashboard and transactions. "admin" role grants access to a global `/admin` Governance view to oversee platform usage.
- **Audit Log / Activity Trail** — best-effort logging of user mutations (create, update, delete) visible in the Admin Governance view.
- **Transactions CRUD** — record income/expense entries (amount, type, category, date, optional note).
- **Sortable data-tables (TanStack)** — Transactions and Admin data tables are fully sortable, with state seamlessly synced to the URL.
- **List & filter** — filter transactions by category and by month; filter state lives in the URL.
- **Dashboard** — current-month income / expense / balance plus a category-share donut chart built with **pure CSS** (no charting dependency, supports large/small toggle).
- **REST API + OpenAPI Documentation** — full CRUD endpoints (`/api/transactions`, `/api/stats`) heavily utilizing Zod models which dynamically map to a live OpenAPI 3.1 schema. Scalar UI is mounted at `/api/docs` for interactive exploration.
- **Per-user data isolation** — every query is scoped to the signed-in user; you only ever see your own data.
- **Schema migrations & validation** — the PostgreSQL schema is versioned with Prisma Migrate (`db:migrate`), and every untrusted input is validated at the boundary by Zod; one schema is the single source of truth for types, validation, and the OpenAPI spec.
- **Rate limiting** — best-effort in-memory fixed-window throttling: login is capped at 10 attempts/min per IP, and authenticated API mutations at 100 req/min per IP, returning `429` with a `Retry-After` header. (On serverless, swap the in-memory store for Vercel KV / Upstash Redis to share state across instances.)
- **Security hardening** — every HTML response carries a nonce-based Content-Security-Policy plus `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, and `Permissions-Policy`; `Strict-Transport-Security` is enabled in production. CSP is relaxed only for the Scalar `/api/docs` page and stripped in dev to support Vite HMR.
- **API pagination** — `GET /api/transactions` accepts `limit` (default 20, clamped to 100) and `offset`, and returns a `{ data, pagination: { total, limit, offset } }` envelope.
- **Currency** — TWD only, stored as integers (no decimals).
- **i18n** — English and Traditional Chinese (Paraglide JS).
- **Theme switching** — light / dark / system.
- **Responsive design** — mobile-first, scales to desktop.
- **Web analytics** — Vercel Web Analytics (`@vercel/analytics`) is injected app-wide for privacy-friendly, cookie-free traffic insight.
- **SEO & discoverability** — the login landing page ships a localized meta description (`seo_description`), canonical URL, theme-color, Open Graph + Twitter Card tags, and JSON-LD `WebApplication` structured data; a `sitemap.xml` plus a `robots.txt` `Sitemap:` directive are served from `static/`.

Categories are fixed lists in `src/lib/categories.ts`; the session cookie is signed with `SESSION_SECRET` from `.env`.

---

## Roles & Permissions / Governance

The application enforces a strict data-permission boundary backed by database user roles. These are the same access-control and oversight patterns enterprise systems (ERP / BPM / internal admin tooling) depend on: role-based access control, per-user data isolation, an audit trail, and a read-only governance/compliance view.

- **Member**: Can only access their own dashboard and transactions. Data is isolated per-user at the query level.
- **Admin**: Operates as a trusted compliance/governance auditor. Server-side `requireAdmin` guards protect the `/admin` read-only overview. By design, the audit trail exposes line-item visibility (e.g., individual transaction amounts and categories) to admins to facilitate platform oversight.

The Admin Governance view aggregates per-user activity (transaction counts, total income/expense across all members) alongside an audit trail of create/update/delete events — the cross-user oversight and compliance visibility that enterprise admin tooling (ERP / BPM / internal systems) depends on.

---

## REST API & OpenAPI Documentation

**[Live API Docs →](https://sveltekit-starter-kit.vercel.app/api/docs)** — interactive OpenAPI 3.1 reference (Scalar UI).

The Hono.js API (`apps/api`) owns all business logic and data access. SvelteKit (`apps/web`) proxies requests server-to-server via `apiFetch()`, preserving SSR/SEO and keeping cookies same-origin for the browser.

Full CRUD endpoints (`/api/transactions`, `/api/stats`, `/api/auth`, `/api/admin`) with cookie-based auth, per-user data isolation, pagination, and rate limiting. The OpenAPI 3.1 spec is served at `/api/openapi.json` and rendered via Scalar at `/api/docs`.

---

## Harness Engineering

This project employs a Human-in-the-Loop AI collaboration approach. AI tools are not merely for generating code, but rather used to improve **architectural leverage, quality assurance, and development speed**.

The AI ​​agent is a governed collaborative developer, not an automated program that can commit itself.

- **Human-in-the-loop** — Every instruction and change is reviewed; it is not executed automatically.

- **Prompt and task template** — Roles, scope, and pass/fail criteria (lint/build/check/tests) are defined for each session.

- **Context management** — Scope is limited to `src/`; reusable committed skills; offline reference documentation.

- **Skill and task decomposition** — Read-only planning → Human review → Step-by-step execution → Step-by-step verification.

- **Generate Boundary Control** — Zod enforces I/O contract; tests mock PostgreSQL/third-party systems; HSTS/CSP switches between `dev` and `prod`.

- **Session Handoff** — Task and session logs allow any model to take over from the point of interruption, including but not limited to token or session exhaustion/unexpected crashes.

- **Delivery discipline** — Every change states its requirements, risk, and impact scope, and must pass pre-release verification (lint / build / check / tests) before merge.

### Measurable Impact

By treating AI as an integrated part of the stack, this project achieves:

- **Velocity**: 5-10x faster implementation of boilerplate and standard patterns, reduce time of PR review 30~40% by Gemini Code Assist.
- **Quality**: Higher test coverage (80%+) through AI-generated test scaffolding, and PR review by Gemini Code Assist to reduce bugs and bed smell.
- **Learning**: Rapid mastery of new tools (Svelte, Sveltekit, Prisma...and more) via AI-guided implementation.
- **Cost**: Lower costs by using AI agents skills to reduce tokens and match the best practices.
- **Focus**: Shifted engineering time from syntax to system architecture and user experience.

### AI Agent Skills (`.agents/skills/`)

Skills are committed to the repo and surfaced to AI assistants via `AGENTS.md` / `CLAUDE.md`. Each skill encodes instructions and conventions the assistant must follow.

| Skill                                                                                                                                | Responsibility                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| [karpathy-guidelines](https://github.com/forrestchang/andrej-karpathy-skills)                                                        | Reduce LLM coding mistakes: surface assumptions, simplicity first, surgical changes, goal-driven loops                      |
| [doc-coauthoring](https://github.com/anthropics/skills/tree/main/skills/doc-coauthoring)                                             | 3-stage workflow (Context → Refinement → Reader Testing) for co-authoring docs (this README is made by user and this skill) |
| **session-handoff (my private skill)**                                                                                               | Maintain `ai-docs/tasks.md` + `ai-docs/session-log.md` so work hands off cleanly across AI sessions                         |
| [prisma official AI guide](https://www.prisma.io/docs/ai) (cli, client-api, database-setup, postgres, driver-adapter-implementation) | Prisma ORM workflows: CLI commands, client API, provider setup, Prisma Postgres, driver adapters                            |
| [svelte-code-writer](https://svelte.dev/docs/ai/skills)                                                                              | CLI tooling for Svelte 5 docs lookup and code analysis when creating/editing any `.svelte` file                             |
| [svelte-core-bestpractices](https://svelte.dev/docs/ai/skills)                                                                       | Guidance on writing fast, robust, modern Svelte code.                                                                       |

### MCP (Model Context Protocol) Servers

MCP lets AI tools interact directly with development infrastructure, removing context-switching overhead.

| Server                                                                       | Integration Point | Workflow Enhancement                                                                         |
| ---------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------- |
| [svelte-mcp](https://svelte.dev/docs/ai/mcp)                                 | Svelte docs       | Official Svelte 5 / SvelteKit docs, examples, and code autofixing (committed in `.mcp.json`) |
| [context7](https://github.com/upstash/context7)                              | Documentation     | Current, version-accurate library docs for AI agents                                         |
| [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) | Browser state     | Lets AI agents inspect and verify the running app via the DevTools Protocol                  |

### AI Guidelines (`AGENTS.md` / `CLAUDE.md`)

Project-specific instructions for AI assistants: the mandatory verification workflow (`pnpm lint` → `pnpm build` → `pnpm check`), commands, and which skills/MCP servers to use for which tasks. AI tools should read this file first when working on the repo.

Delivery pipeline:

```mermaid
graph TD
    A[AI Code Generation] --> B[Local Verification <br> lint / build / typecheck]
    B --> C[User Confirmation]
    C --> D[Vitest Unit Tests]
    D --> E[Playwright Browser E2E Tests]
    E --> F[Git Commit & Push]
    F --> G[CI GitHub Actions]
    G --> H[SonarQube Quality Gate / Codecov]
    H --> I[Production Deployment to Vercel]
```

---

## Quick Start

### Requirements

- Node.js >= 24
- pnpm 11.5+
- Docker / OrbStack (for local PostgreSQL)

### Setup

```bash
pnpm install

# Environment — set DATABASE_URL + SESSION_SECRET
cp .env.example .env

# Database
pnpm db:start          # Start PostgreSQL via Docker (compose.yaml)
pnpm db:migrate        # Apply migrations to the local DB
pnpm db:seed           # Seed 3 demo users + sample transactions

# Run
pnpm dev               # Start dev server (web + api)
pnpm test              # Unit tests (all packages)
pnpm test:e2e          # E2E tests (needs a seeded DB + dev server)
pnpm build             # Production build (all packages)
```

The default `DATABASE_URL` in `.env.example` matches `compose.yaml`. Set `SESSION_SECRET` to any long random string (e.g., use `openssl rand -base64 32` to generate) to sign the session cookie. The web app runs on `http://localhost:5173` and proxies API calls to Hono on `http://localhost:3001`.

### Commands

```bash
pnpm dev           # Start all dev servers (turbo)
pnpm build         # Build all packages (turbo)
pnpm lint          # Lint all packages (oxlint + eslint)
pnpm check         # Type-check all packages (svelte-check + tsc)
pnpm test          # Run all tests (vitest)
pnpm test:e2e      # Playwright e2e
pnpm db:start      # docker compose up (PostgreSQL)
pnpm db:generate   # prisma generate
pnpm db:migrate    # prisma migrate dev
pnpm db:push       # prisma db push
pnpm db:seed       # Seed demo users + sample transactions
```

### Testing Architecture

- **Monorepo Testing**: Each package (`apps/api`, `apps/web`, `packages/shared`, `packages/db`) has its own Vitest config; `pnpm test` runs all via Turborepo.
- **API Tests**: Integration tests using Hono's `app.request()` — no server startup needed.
- **Web Tests**: Dual projects — `server` (Node.js, for API/utilities) and `client` (JSDOM, Svelte components & runes).
- **Naming Conventions**:
  - `*.spec.ts`: Executed in `server` environment.
  - `*.svelte.spec.ts`: Executed in `client` (JSDOM) environment.
- **Commands**:
  - `pnpm test`: Run all unit tests across the monorepo.
  - `pnpm test:coverage`: Run coverage with >=80% thresholds.
  - `pnpm test:e2e`: Run Playwright E2E browser tests.

---

## Project Structure

```text
.
├── apps/
│   ├── web/                    # SvelteKit frontend (SSR proxy to Hono API)
│   │   ├── src/
│   │   │   ├── lib/components/ # shadcn-svelte UI + feature components
│   │   │   ├── lib/server/     # SSR proxy (apiFetch) + session resolution
│   │   │   └── routes/         # SvelteKit pages + server load/actions
│   │   ├── vite.config.ts      # Tailwind, SvelteKit, Paraglide, Vitest
│   │   └── components.json     # shadcn-svelte configuration
│   └── api/                    # Hono.js API (all business logic)
│       └── src/
│           ├── routes/         # Hono route handlers (transactions, stats, auth, admin, docs)
│           ├── middleware/      # Auth, rate-limit middleware
│           ├── openapi.ts      # OpenAPI 3.1 spec
│           └── types.ts        # AppEnv type for Hono generics
├── packages/
│   ├── db/                     # Prisma schema + migrations + generated client
│   │   ├── prisma/             # Schema + SQL migrations
│   │   └── src/                # Client, queries, audit, admin helpers
│   └── shared/                 # Shared Zod schemas + domain types
│       └── src/                # Transaction schemas, categories, date, money utils
├── .agents/skills/             # AI skills (karpathy, shadcn-svelte, hono, prisma, etc.)
├── .github/workflows/ci.yml    # GitHub Actions: build, lint, check, test via turbo
├── e2e/                        # Playwright E2E tests (2-app topology)
├── ai-docs/                    # Task plan + session log for AI collaboration
├── turbo.json                  # Turborepo pipeline config
├── pnpm-workspace.yaml         # Workspace definition
├── package.json                # Root scripts delegating to turbo
└── prisma.config.ts            # Prisma CLI config (schema path + datasource URL)
```

├── e2e/
│ ├── expense.spec.ts # Playwright login + transaction CRUD happy path
│ └── sort.spec.ts # Playwright table-sort + URL-state e2e checks
├── messages/ # Paraglide source messages
│ ├── en.json # English UI copy
│ └── zh-tw.json # Traditional Chinese UI copy
├── src/
│ ├── app.d.ts # SvelteKit app types (App.Locals.user)
│ ├── app.html # HTML shell with Paraglide lang/dir placeholders
│ ├── hooks.server.ts # Session lookup, locale middleware, theme class injection
│ ├── lib/
│ │ ├── assets/ # Favicon and README screenshots
│ │ ├── components/ # CategoryChart, LocaleSwitcher, ThemeToggle, TransactionForm
│ │ │ └── ui/ # Own Svelte 5 primitives: Button, ConfirmDialog, Field
│ │ ├── server/
│ │ │ ├── db/
│ │ │ │ ├── admin.ts # Admin-only queries (cross-user stats)
│ │ │ │ ├── audit.ts # Audit log queries
│ │ │ │ ├── index.ts # Prisma client (pg adapter) using DATABASE*URL
│ │ │ │ ├── queries.ts # User-scoped CRUD + dashboard aggregates
│ │ │ │ ├── schema.ts # App-level types derived from the generated Prisma client
│ │ │ │ ├── schema.spec.ts
│ │ │ │ └── seed.ts # Demo users and transactions
│ │ │ ├── auth.ts # HMAC-signed httpOnly session cookie
│ │ │ ├── guards.ts # requireUser protected-route helper
│ │ │ ├── login.ts # Password-less email lookup
│ │ │ ├── session.ts # Cookie -> database-backed SessionUser resolver
│ │ │ ├── api.ts # REST API response wrappers and auth guard
│ │ │ ├── rate-limit.ts # In-memory fixed-window limiter (login + API)
│ │ │ ├── openapi.ts # Dynamic Zod -> OpenAPI 3.1 generator
│ │ │ ├── schemas.ts # Shared Zod definitions (forms + API)
│ │ │ └── validation.ts # Action validation, utilizing schemas.ts
│ │ ├── table/ # TanStack sorting: URL-synced sorted-table store
│ │ │ └── sorted-table.svelte.ts
│ │ ├── categories.ts # Fixed category keys + localized labels
│ │ ├── constants.ts # App name, demo email, pageTitle helper
│ │ ├── date.ts # YYYY-MM / YYYY-MM-DD helpers
│ │ ├── index.ts # lib barrel re-exports
│ │ ├── money.ts # TWD integer formatting/parsing
│ │ ├── theme.svelte.ts # Client theme store (light / dark / system)
│ │ ├── theme.ts # Server-safe theme constants and helpers
│ │ └── transaction.ts # Transaction form value types
│ ├── routes/
│ │ ├── admin/ # Governance view (admin-only) with cross-user aggregate stats
│ │ ├── api/ # REST endpoints
│ │ │ ├── docs/ # Scalar API reference UI
│ │ │ ├── openapi.json/ # Dynamically generated OpenAPI 3.1 schema
│ │ │ ├── stats/ # REST endpoint for dashboard aggregates
│ │ │ └── transactions/ # REST endpoints for transaction CRUD
│ │ ├── login/ # Password-less email sign-in page/action + route spec
│ │ ├── logout/ # Sign-out action
│ │ ├── transactions/
│ │ │ ├── [id]/edit/ # Edit form load/action, ownership-checked
│ │ │ ├── new/ # Create form load/action
│ │ │ └── +page.* # List/filter page plus delete action
│ │ ├── +layout.server.ts # Auth guard and user data for all pages
│ │ ├── +layout.svelte # App shell, nav, locale/theme controls, logout form
│ │ ├── +page.server.ts # Dashboard monthly stats loader
│ │ ├── +page.svelte # Dashboard UI and pure-CSS category chart
│ │ └── layout.css # Tailwind v4 import and global styles
│ └── \_.spec.ts # Unit/integration specs colocated with source modules
├── static/
│ ├── robots.txt # Crawl rules + sitemap directive
│ └── sitemap.xml # Public sitemap for search engines
├── .env.example # DATABASE_URL + SESSION_SECRET template
├── .mcp.json # Svelte MCP server registration
├── .npmrc # pnpm/node package manager settings
├── .oxfmtrc.json # oxfmt formatter config
├── .oxlintrc.json # oxlint JS/TS lint rules
├── AGENTS.md # AI agent instructions for this repo
├── LICENSE # MIT license
├── README.md # English README
├── README-cht.md # Traditional Chinese README
├── commitlint.config.mjs # Conventional commit config
├── compose.yaml # Local PostgreSQL service
├── prisma.config.ts # Prisma CLI config (schema path + datasource URL)
├── eslint.config.js # ESLint config for Svelte files
├── package.json # Scripts, dependencies, lint-staged, engines
├── playwright.config.ts # Cross-browser e2e configuration
├── pnpm-lock.yaml # Locked dependency graph
├── pnpm-workspace.yaml # pnpm workspace and minimum-release-age policy
├── project.inlang/ # Paraglide / inlang i18n project settings
├── skills-lock.json # Locked AI skill/plugin metadata
├── sonar-project.properties # SonarQube project configuration
├── svelte.config.js # SvelteKit config, Vercel adapter, forced runes mode
├── tsconfig.json # TypeScript config extending generated SvelteKit config
└── vite.config.ts # Vite plugins: Tailwind, SvelteKit, Paraglide; Vitest config

```

---

## Next Generations Tooling Adoption

This project continuously evaluates emerging tools and adopts them based on measurable impact.

### Oxlint (Rust-based Linter)

| Aspect      | Details                                                                      |
| ----------- | ---------------------------------------------------------------------------- |
| Status      | **Production** — JS/TS linting enabled                                       |
| Performance | 50-100x faster than ESLint                                                   |
| Scope       | ESLint lints `.svelte` (cached via content strategy); JS/TS linted by oxlint |

[Oxlint](https://oxc.rs/docs/guide/usage/linter.html)

### Oxfmt (Rust-based Formatter)

| Aspect      | Details                                                |
| ----------- | ------------------------------------------------------ |
| Status      | **Production** — formats JS/TS/CSS/HTML/JSON/MD/Svelte |
| Performance | ~30x faster than Prettier with instant cold start      |
| Scope       | Formats all supported files including `.svelte`        |

[Oxfmt](https://oxc.rs/docs/guide/usage/formatter)

---

## Live Demo Constraints

| Aspect       | Current State                                                                              | Production Recommendation           |
| ------------ | ------------------------------------------------------------------------------------------ | ----------------------------------- |
| **Hosting**  | Vercel free tier                                                                           | Paid tier / multi-region deployment |
| **Database** | Free-tier Neon                                                                             | Managed, regionally optimized DB    |
| **Data**     | Seeded demo data; demo accounts shared by visitors, but each account's data stays isolated | Real user accounts with sign-up     |

The demo deployment uses free-tier infrastructure to minimize costs. Production deployments should implement proper regional optimization and real user onboarding.
```
