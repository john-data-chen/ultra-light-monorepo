import path from "path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@ultra-light/db": path.resolve(__dirname, "../../packages/db/src"),
      "@ultra-light/shared": path.resolve(__dirname, "../../packages/shared/src")
    }
  },
  test: {
    include: ["src/**/*.{test,spec}.{ts,js}"]
  }
});
