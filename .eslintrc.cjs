module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
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
  ignorePatterns: ["commitlint.config.js", "coverage"],
  rules: {
    semi: [2, "always"],
    quotes: ["warn", "double"],
    "comma-dangle": ["error", "only-multiline"],
    "no-fallthrough": 0,
    "space-before-function-paren": 0,
    "no-useless-catch": 0,
    "no-console": "error",
    eqeqeq: ["error", "always"],
    "jest/no-conditional-expect": 0,
  },
};
