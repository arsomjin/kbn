# Cursor AI Coding Rules

## 📦 Package Management

- Avoid auto-installing packages unless approved in `package.json`

## 🗂 Imports

- Prefer absolute paths (configured in `tsconfig.json`)
- Do not use relative paths like `../../../utils`

## 🛠️ Error Handling

- Use `getErrorMessage()` from `/utils/common.js`
- For Firebase, map errors with `/utils/firebaseErrorMessages.js`

## 🔐 Permissions

- Roles and permissions must match `roles.js`, `Permissions.js`, and `roleUtils.js`
- Always validate access using `hasRolePrivilege` or `hasAnyPermission`

## 🧱 Component Structure

- Use `Row` / `Col` from Ant Design for layout
- Apply Tailwind for alignment, padding, margin, visibility
- Add dark mode support via conditional Tailwind classes
- Replace all message notifications (showSuccess, showWarning, showAlert, etc.) from src/utils/common.js to the appropriate functions in useModal hook.

## 🚫 Don’ts

- Don’t remove logic unless clearly obsolete
- Don’t rename components or props arbitrarily
- Don’t add unrelated features in a refactor
