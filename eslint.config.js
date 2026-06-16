import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import oxlint from "eslint-plugin-oxlint";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import ts from "typescript-eslint";

// ESLint only owns Svelte files here; oxlint stays the linter for plain JS/TS.
// `eslint-plugin-oxlint` reads .oxlintrc.json and disables any ESLint rules that
// oxlint already covers, so the two linters never double-report.
export default [
  {
    ignores: [
      "node_modules/",
      ".svelte-kit/",
      "build/",
      "coverage/",
      "static/",
      ".agents/",
      "**/.svelte-kit/**",
      "packages/ui/**"
    ]
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
        parser: ts.parser
      }
    }
  },
  // Keep this last so its rule-disabling wins over the recommended presets above.
  ...oxlint.buildFromOxlintConfigFile(import.meta.dirname + "/.oxlintrc.json")
];
