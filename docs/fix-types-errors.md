Please scan the entire `src/` folder for TypeScript errors and fix them in-place.

🎯 Goals:
- Fix all type errors, missing types, or incorrect prop typings.
- Use existing shared types and interfaces if available.
- Avoid changing any business logic or runtime behavior.
- If a type cannot be inferred, add TODO comment and `any` as temporary fallback.
- Fix imports only if needed to resolve typing issues.
- Do not pause for file-by-file confirmation—continue until `src/` is clean.

⚠️ Notes:
- Reuse types from `types/`, `interfaces/`, or existing props if present.
- Prefer `React.FC<Props>` format for functional components if applicable.
- Keep your fix logs minimal unless you encounter blocking issues.