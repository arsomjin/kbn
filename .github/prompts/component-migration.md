# KBN Component Migration Guidance

## 1. Icon Library Migration
- Replace all icon imports from `@material-ui/icons` and other libraries with [Ant Design icons](https://ant.design/components/icon/).
- Update icon usage in all components to use Ant Design's `<Icon />` components.

## 2. Date/Time Handling
- Replace all usage of `moment`, `moment-timezone`, `dayjs`, or similar libraries with [Luxon](https://moment.github.io/luxon/).
- Refactor all date parsing, formatting, and manipulation to use Luxon's `DateTime` API.
- Ensure all user-facing date/time strings are formatted using i18next and Luxon together.

## 3. UI Component Library
- Replace all UI components from `shards-react`, `@material-ui/core`, or other non-standard libraries with [Ant Design](https://ant.design/) components.
- Refactor layouts and forms to use Ant Design's grid, form, and input components.
- Use [Tailwind CSS](https://tailwindcss.com/) for utility-first styling where appropriate, following KBN's design system.

## 4. TypeScript Migration
- Convert all JavaScript files to TypeScript (`.ts`/`.tsx`).
- Add explicit types for all props, state, and function signatures.
- Use camelCase for variables/functions, PascalCase for components/classes, and UPPER_SNAKE_CASE for constants.
- Add JSDoc for complex functions and business logic.

## 5. Translation (i18next)
- Integrate i18next for all user-facing text, labels, and messages.
- Ensure all translation keys are present in both English and Thai JSON files.
- Use variable interpolation and context-aware translations as needed.

## 6. Multi-Province & RBAC
- Add `provinceId` to all Firestore data and queries.
- Update all queries to filter by `provinceId`.
- Implement RBAC checks at route, component, and service levels using the KBN permission system.

## 7. Error Handling & Notifications
- Use Ant Design's notification and message components for all user feedback.
- Follow KBN's error handling pattern for try/catch blocks and user notifications.

## 8. Code Style & Best Practices
- Use double quotes for all strings.
- Use functional components and React hooks.
- Prefer arrow functions.
- Use Yarn for dependency management.
- Follow KBN's documented design system and code style guides.

## 9. Documentation & References
- Refer to `/docs/data-schema-detail.md` for Firestore structure.
- Refer to `/docs/design-system.md` for UI/UX standards.
- Refer to `/docs/rbac.md` for RBAC and permission implementation.
- Refer to `/docs/translation-system.md` for i18next usage.

---

**Summary:**
Migrate all components to use Ant Design, Luxon, TypeScript, and i18next. Ensure full RBAC and multi-province support. Follow KBN's code style and documentation for a consistent, maintainable codebase.