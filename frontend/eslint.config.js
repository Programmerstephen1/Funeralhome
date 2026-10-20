import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

const browserGlobals = Object.fromEntries(
  [
    "AbortController",
    "Blob",
    "CSS",
    "CustomEvent",
    "File",
    "FormData",
    "Headers",
    "HTMLElement",
    "HTMLDialogElement",
    "Image",
    "IntersectionObserver",
    "MutationObserver",
    "URL",
    "URLSearchParams",
    "atob",
    "alert",
    "btoa",
    "confirm",
    "crypto",
    "document",
    "fetch",
    "history",
    "localStorage",
    "location",
    "matchMedia",
    "navigator",
    "requestAnimationFrame",
    "sessionStorage",
    "setTimeout",
    "structuredClone",
    "window",
  ].map((name) => [name, "readonly"]),
);

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
    ],
  },
  {
    ...js.configs.recommended,
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...browserGlobals },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^[A-Z_]" },
      ],
    },
  },
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { parser: tsParser },
    rules: { "no-undef": "off" },
  },
];
