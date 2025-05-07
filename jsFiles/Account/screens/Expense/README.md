# Expense Feature

This folder contains all logic, components, and API for the Expense feature.

## Structure

- `api/expenseApi.js`: All Firestore/API logic for expenses
- `components/`: UI components for expense forms and views
- `hooks/`: Custom React hooks for business logic
- `utils/`: Utility functions for expense processing
- `__tests__/`: Unit and integration tests
- `README.md`: This documentation
- `index.js`: Main entry for the Expense screen

## API
See `api/expenseApi.js` for available functions:
- `getExpensesByDate`
- `getExpensesByRange`
- `getExpenseItems`
- `checkExistingExpense`

## Data Schema
Refer to `data-schema.md` and `docs/collection-samples.json` for details.

## Notes
- All business logic should be in hooks or utils, not components.
- Use JSDoc and TypeScript for type safety.
- Add tests for all utilities and hooks.
