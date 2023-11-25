const { resolve } = require("path");

const project = resolve(__dirname, "tsconfig.json");

module.exports = {
  root: true,
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    require.resolve("@vercel/style-guide/eslint/react"),
    require.resolve("@vercel/style-guide/eslint/next"),
    require.resolve("@vercel/style-guide/eslint/typescript"),
  ],
  rules: {
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/no-inferrable-types": "error",
    "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "react/function-component-definition": "off",
    "react/jsx-sort-props": "off",
    "react/jsx-no-leaked-render": [2, { validStrategies: ["coerce"] }],
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parserOptions: { project },
    },
    {
      files: ["*.test.ts", "*.test.tsx"],
      plugins: ["vitest"],
      extends: ["plugin:vitest/recommended"],
    },
  ],
  settings: { "import/resolver": { typescript: { project } } },
};
