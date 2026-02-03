import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import { version } from "os";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
          ],
          "newlines-between": "always",
          pathGroups: [
            {
              pattern: "@core/**",
              group: "internal",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["internal"],
        },
      ],
      "import/no-named-as-default-member": ["off"],
      "import/no-anonymous-default-export": [
        "error",
        {
          allowArray: false,
          allowArrowFunction: false,
          allowAnonymousClass: false,
          allowAnonymousFunction: false,
          allowCallExpression: true,
          allowNew: false,
          allowLiteral: false,
          allowObject: false,
        },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          // @alwaysTryTypes always try to resolve types under `<root>@types`
          // directory even it doesn't contain any source code, like `@types/unist`
          alwaysTryTypes: true,
          project: "./tsconfig.json",
          extensions: [".ts", ".tsx"],
        },
      },
    },
  },
]);
