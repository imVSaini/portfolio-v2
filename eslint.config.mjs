import { fixupConfigRules } from "@eslint/compat";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import betterTailwind from "eslint-plugin-better-tailwindcss";

const eslintConfig = defineConfig([
  ...fixupConfigRules([...nextVitals, ...nextTs]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [betterTailwind.configs.recommended],
    settings: {
      "better-tailwindcss": { entryPoint: "src/app/globals.css", rootFontSize: 16 },
    },
    rules: {
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "off",
      // Prettier (prettier-plugin-tailwindcss) owns ordering and wrapping.
      "better-tailwindcss/enforce-consistent-class-order": "off",
      "better-tailwindcss/enforce-consistent-line-wrapping": "off",
      "better-tailwindcss/no-unknown-classes": [
        "error",
        // Hook classes used by GSAP / Locomotive selectors, not Tailwind utilities.
        { ignore: ["^js-", "^lenis"] },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/no-useless-path-segments": "error",
      "import/no-self-import": "error",
      "import/no-cycle": "error",
      "import/no-default-export": "error",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
          pathGroups: [{ pattern: "@/**", group: "internal" }],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
  {
    files: [
      "*.config.ts",
      "src/app/**/{page,layout,template,loading,error,global-error,not-found,default}.tsx",
      "src/app/**/{robots,sitemap,manifest,icon,apple-icon,opengraph-image,twitter-image}.{ts,tsx}",
    ],
    rules: { "import/no-default-export": "off" },
  },
  {
    files: ["src/data/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/**", "@/components/**", "@/hooks/**", "@/lib/**", "@/stores/**"],
              message: "src/data is plain typed content and imports only other src/data modules.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/{lib,hooks,stores}/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/**", "@/components/**"],
              message: "Helpers, hooks and stores sit below the UI and must not import from it.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/**"],
              message: "Components are used by routes and must not import route files.",
            },
          ],
        },
      ],
    },
  },
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
    "blob-report/**",
  ]),
]);

export default eslintConfig;
