# Refactor Task: `/jsFiles/Account` Folder

## Objective

Refactor all files and codebase under `/jsFiles/Account` for improved readability and maintainability.

---

## Scope

- All files and subfolders under `/jsFiles/Account`
- Related screens, components, utilities, and API logic
- Data schema and sample data context from:
  - [`data-schema.md`](data-schema.md)
  - [`docs/collection-samples.json`](collection-samples.json)

---

## Requirements

1. **Folder Structure & Naming**
   - Organize by feature (e.g., `Expense/`, `Income/`, `Shared/`)
   - Use consistent naming conventions (`PascalCase` for components, `camelCase` for utilities)

2. **Component & Function Refactoring**
   - Split large files into smaller, focused files
   - Prefer functional components and React hooks
   - Extract business logic into hooks or utility files

3. **Consistent Code Style**
   - Enforce formatting and linting (Prettier/ESLint)
   - Add PropTypes or TypeScript for type safety
   - Use JSDoc comments for complex functions/utilities

4. **Reusable Utilities & Hooks**
   - Extract repeated logic into custom hooks or `/utils/`
   - Centralize API calls in `/api/`

5. **API Layer**
   - Move Firestore/API logic into a dedicated API file (e.g., `expenseApi.js`)
   - Abstract Firestore logic into functions like `getExpenses`, `saveExpense`, `mergeExpenseItems`

6. **Documentation**
   - Add `README.md` in each major folder
   - Document API endpoints and data schemas

7. **Testing**
   - Add unit tests for utilities and hooks
   - Use integration tests for screens/components

8. **Automation**
   - Add scripts for linting, formatting, and testing
   - Use Husky for pre-commit hooks

---

## References

- [data-schema.md](data-schema.md)
- [collection-samples.json](collection-samples.json)
- Existing code in `/jsFiles/Account`

---

## Deliverables

- Refactored codebase under `/jsFiles/Account`
- Updated documentation and folder structure
- Sample refactor for at least one feature (e.g., `Expense`)
- Summary of changes and migration notes

---

## Notes

- Ensure no breaking changes to existing features
- Prioritize code readability, maintainability, and scalability
- Coordinate with the team for review and testing
