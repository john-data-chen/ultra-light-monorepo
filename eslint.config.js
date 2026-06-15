import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import oxlint from "eslint-plugin-oxlint";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import ts from "typescript-eslint";

import svelteConfig from "./svelte.config.js";

// Sanitize svelteConfig to remove non-serializable function properties
// (runes, typescript.config) which cause ESLint cache serialization to fail.
const sanitizedSvelteConfig = {
  ...svelteConfig,
  compilerOptions: svelteConfig.compilerOptions
    ? {
        ...svelteConfig.compilerOptions,
        runes: undefined
      }
    : undefined,
  kit: svelteConfig.kit
    ? {
        ...svelteConfig.kit,
        typescript: svelteConfig.kit.typescript
          ? {
              ...svelteConfig.kit.typescript,
              config: undefined
            }
          : undefined
      }
    : undefined
};

// ESLint only owns Svelte files here; oxlint stays the linter for plain JS/TS.
// `eslint-plugin-oxlint` reads .oxlintrc.json and disables any ESLint rules that
// oxlint already covers, so the two linters never double-report.
export default [
  {
    ignores: ["node_modules/", ".svelte-kit/", "build/", "coverage/", "static/", ".agents/"]
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: [".svelte"],
        parser: ts.parser,
        svelteConfig: sanitizedSvelteConfig
      }
    }
  },
  // Keep this last so its rule-disabling wins over the recommended presets above.
  ...oxlint.buildFromOxlintConfigFile("./.oxlintrc.json")
];
