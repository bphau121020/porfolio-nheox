module.exports = {
  extends: [
    "jquery",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  plugins: ["@cspell"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "script",
    project: "./tsconfig.json"
  },
  rules: {
    "no-new": 0,
    "camelcase": "warn",
    "prefer-arrow-callback": "warn",
    "no-var": "warn",
    "prefer-const": "warn",
    "func-style": ["warn", "expression"],
    "space-in-parens": ["error", "never"],
    "quotes": ["error", "single"],
    "template-curly-spacing": ["error", "never"],
    "computed-property-spacing": ["error", "never"],

    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "warn",
    "@typescript-eslint/prefer-optional-chain": "warn",

    "complexity": ["warn", 10],
    "max-lines-per-function": ["warn", 50],
    "max-params": ["warn", 4],

    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",

    "no-restricted-syntax": [
      "warn",
      {
        "selector": "FunctionExpression",
        "message": "Consider using arrow functions instead of function expressions."
      }
    ],

    "@cspell/spellchecker": [
      2,
      {
        "checkStrings": false,
        "cspell": {
          "words": ["keyvisual"],
          "ignoreWords": [
            "getElementById",
            "getElementsByTagNameNS",
            "getElementsByTagName",
            "getElementsByClassName",
            "getElementsByName",
            "createElement",
            "HTMLAnchorElement",
            "Element",
            "HTMLElement",
            "Elements"
          ],
          "ignoreRegExpList": ["/\\.data\\(/"],
          "flagWords": ["do", "handle", "element", "elements", "data"]
        }
      }
    ]
  },
  env: {
    "browser": true,
    "jquery": true
  },
  globals: {
    "WOW": "readonly",
    "Swiper": "readonly",
    "ScrollHint": "readonly"
  },
  overrides: [],
  ignorePatterns: ["gulpfile.js"]
};