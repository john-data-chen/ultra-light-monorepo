import path from "path";

import { defineConfig, mergeConfig } from "vitest/config";

import sharedConfig from "../../vitest.shared.ts";

export default mergeConfig(
  sharedConfig,
  defineConfig({
    resolve: {
      alias: {
        "@ultra-light/db": path.resolve(__dirname, "../../packages/db/src"),
        "@ultra-light/shared": path.resolve(__dirname, "../../packages/shared/src")
      }
    },
    test: {
      coverage: {
        include: ["src/**/*.ts"],
        exclude: ["src/**/*.spec.ts", "src/**/*.test.ts"]
      }
    }
  })
);
