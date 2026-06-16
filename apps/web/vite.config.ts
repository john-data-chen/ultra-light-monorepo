import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vitest/config";

import sharedConfig from "../../vitest.shared.ts";

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
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  },
  preview: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  },
  test: {
    coverage: {
      ...sharedConfig.test?.coverage,
      include: ["src/**/*.{js,ts,svelte}"],
      exclude: [
        "src/lib/paraglide/**",
        "**/*.spec.ts",
        "**/*.test.ts",
        "ai-docs/**",
        "**/*.d.ts",
        ".svelte-kit/**",
        "src/routes/**/+page.svelte",
        "src/routes/**/+page.server.ts",
        "src/routes/**/+layout.svelte",
        "src/routes/**/+layout.server.ts",
        "src/lib/date.ts",
        "src/lib/money.ts",
        "src/lib/index.ts",
        "src/lib/transaction.ts"
      ]
    },
    projects: [
      {
        extends: true,
        test: {
          name: "server",
          environment: "node",
          // requireAssertions guards against tests that forget to assert. It is enforced only
          // here (node env): in the jsdom "client" project the vitest 4.1.9 + projects toolchain
          // fails to share the assertion counter with the worker, so every client test counts 0
          // assertions (100% false positive). Enforcing it there would fail correct tests.
          expect: { requireAssertions: true },
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
