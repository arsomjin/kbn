module.exports = {
  extends: [
    'react-app',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: ['react', 'react-hooks'],
  rules: {
    // React rules
    'react/react-in-jsx-scope': 'error', // Require React import for JSX
    'react/jsx-uses-react': 'error', // Prevent React from being marked as unused
    'react/jsx-uses-vars': 'error', // Prevent variables used in JSX from being marked as unused

    // General rules
    'no-unused-expressions': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',

    // Import rules - be more lenient to prevent conflicts with Prettier
    'no-unused-vars': [
      'warn',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^React$', // Never mark React as unused
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
