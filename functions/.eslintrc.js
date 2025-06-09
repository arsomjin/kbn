module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    "ecmaVersion": 2018,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", { "allowTemplateLiterals": true }],
    "no-unused-vars": "off",
    "semi": "off",
    "object-curly-spacing": "off",
    "max-len": "off",
    "no-unreachable": "off",
    "no-trailing-spaces": "off",
    "indent": "off",
    "eol-last": "off",
    "comma-dangle": "off",
    "camelcase": "off",
    "padded-blocks": "off",
    "prefer-const": "off",
    "new-cap": "off",
    "no-multi-spaces": "off",
    "no-case-declarations": "off",
    "valid-jsdoc": "off",
    "operator-linebreak": "off",
    "require-jsdoc": "off",
    "one-var": "off",
    "quote-props": "off",
    "arrow-parens": "off",
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
