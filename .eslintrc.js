module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'prettier/prettier': [
      'warn', // Changed from 'error' to 'warn' to make it less aggressive
      {
        singleQuote: true,
        jsxSingleQuote: true,
        semi: true,
        tabWidth: 2,
        printWidth: 120, // Updated to match .prettierrc
        trailingComma: 'none',
        arrowParens: 'avoid',
        endOfLine: 'auto',
        useTabs: false,
        htmlWhitespaceSensitivity: 'ignore' // Added to match .prettierrc
      }
    ],
    'no-trailing-spaces': 'warn', // Downgraded from error to warning
    'no-mixed-spaces-and-tabs': 'warn', // Downgraded from error to warning
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/react-in-jsx-scope': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};