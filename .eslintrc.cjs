module.exports = {
  env: {
    browser: true,
    es2021: true,
    "jest/globals": true,
  },
  plugins: ["jest"],
  extends: ["standard", "plugin:jest/recommended"],
  overrides: [],
  parser: "@babel/eslint-parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    requireConfigFile: false,
    babelOptions: {
      plugins: ["@babel/plugin-syntax-import-assertions"],
    },
  },
  ignorePatterns: ["commitlint.config.cjs", "coverage"],
  rules: {
    "no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    semi: [2, "always"],
    quotes: ["warn", "double"],
    "comma-dangle": ["error", "always-multiline"],
    "space-before-function-paren": [
      "error",
      {
        anonymous: "always",
        named: "never",
        asyncArrow: "always",
      },
    ],
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    curly: ["error", "all"],
    "generator-star-spacing": 0,
    "no-multi-spaces": ["error", { ignoreEOLComments: true }],
    "no-multiple-empty-lines": ["error", { max: 2, maxBOF: 1, maxEOF: 1 }],
    eqeqeq: ["error", "always"],
    "prefer-const": "error",
    "max-len": ["error", { code: 120 }],
  },
};
