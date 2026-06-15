import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    svelteTesting(),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/lib/paraglide",
      strategy: ["cookie", "baseLocale"]
    })
  ],
  test: {
    expect: { requireAssertions: true },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.{js,ts,svelte}"],
      exclude: [
        "src/lib/paraglide/**",
        "src/lib/server/db/generated/**",
        "**/*.spec.ts",
        "**/*.test.ts",
        "ai-docs/**",
        "**/*.d.ts",
        ".svelte-kit/**",
        "src/lib/server/db/queries.ts",
        "src/lib/server/db/seed.ts",
        "src/lib/server/db/index.ts",
        "src/routes/**/+page.svelte",
        "src/routes/**/+page.server.ts",
        "src/routes/**/+layout.svelte",
        "src/routes/**/+layout.server.ts",
        "src/routes/api/docs/**"
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    },
    projects: [
      {
        extends: true,
        test: {
          name: "server",
          environment: "node",
          include: ["src/**/*.{test,spec}.{js,ts}"],
          exclude: ["src/**/*.svelte.{test,spec}.{js,ts}"]
        }
      },
      {
        extends: true,
        test: {
          name: "client",
          environment: "jsdom",
          include: ["src/**/*.svelte.{test,spec}.{js,ts}"],
          setupFiles: ["./vitest-setup-client.ts"]
        }
      }
    ]
  }
});
