# AGENTS.md

This file provides guidance to AI when working with code in this repository.

# Verification Workflow (MANDATORY)

After **every** code modification, you MUST execute all three commands in order:

```bash
pnpm lint      # 1. Lint — must pass with zero errors and warnings
pnpm build     # 2. Build — TypeScript compile + Vite build must succeed
pnpm check     # 3. Check type
## after user is confirmed every code modification, then verify below commands
pnpm test      # 4. Test — must pass with zero errors and warnings
pnpm test:e2e  # 5. E2E Test — must pass with zero errors and warnings
```

# Commands

- `pnpm dev` — Dev server (usually already running; do not execute unless you get confirmation)
- `pnpm test` — `vitest run` (single run)
- `pnpm test:coverage` — `vitest run --coverage`

If any step fails, fix the issue immediately before proceeding.
Additionally:

- **Update or add test cases** after user has confirmed the results.

# Architecture

check README.md in root folder

# SKill for coding tasks

- karpathy-guidelines: use it every time in all coding tasks

# Svelte Tools for AI

## Skills

### svelte-code-writer

CLI tools for Svelte 5 documentation lookup and code analysis. MUST be used whenever creating, editing or analyzing any Svelte component (.svelte) or Svelte module (.svelte.ts/.svelte.js). If possible, this skill should be executed within the svelte-file-editor agent for optimal results.

### svelte-core-bestpractices

Guidance on writing fast, robust, modern Svelte code. Load this skill whenever in a Svelte project and asked to write/edit or analyze a Svelte component or module. Covers reactivity, event handling, styling, integration with libraries and more.

## Svelte MCP server

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

### Available Svelte MCP Tools:

#### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

#### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

#### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

#### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
