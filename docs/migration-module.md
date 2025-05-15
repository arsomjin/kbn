# 🔁 Module Migration Prompt Template

## 📝 Description
> 🔗 This migration must follow all architectural and coding standards defined in `ai-context.md`.
Migrate a legacy module to the new architecture while **preserving all original components, logic, and functionality**. Improvements (modernization, performance, maintainability) are welcome — but **feature parity is required**.

## 📦 Source Module
Replace this with the legacy module path:  
`<LEGACY_MODULE_URL_OR_PATH>`

## 📂 Target Path
New module should be placed under:  
`src/modules/<module-name>` (lowercase)

---

## ✅ Migration Checklist

- [ ] Convert to **TypeScript** with full, accurate typings
- [ ] Maintain **exact component structure and count** — do not remove or merge unless functionally justified
- [ ] **Preserve all functionalities and logic** — no simplifications or removals
- [ ] Apply responsive design using **Ant Design + Tailwind CSS**
- [ ] Integrate **Role-Based Access Control (RBAC)** as applicable
- [ ] Filter or restrict data access using relevant business context (e.g., `provinceId`, `role`, `branch`)
- [ ] Replace all `Date`/`moment` usages with **Luxon**
- [ ] Migrate all strings to **i18next**, using a dedicated namespace (e.g., `<module>.json`)
- [ ] Refactor or modernize **outdated patterns or broken dependencies**
- [ ] Ensure **dark mode compatibility**
- [ ] Avoid code duplication by reusing shared **utilities, components, and hooks**
- [ ] Register the module's **routes**, **navigation entries**, and **sidebar/menu items** appropriately using the project's routing and menu systems

---

## ⚠️ Enforcement Notes

- ✅ The **number of components and helpers should match** the original unless justified
- ✅ All **features, forms, logic, and interactivity** must behave identically unless explicitly improved
- ✅ Any removed, merged, or restructured elements must be clearly explained (via code comments or PR notes)
- ✅ **You may refactor**, but behavior must remain **identical unless clearly improved**.
- ✅ Scan for existing shared logic and avoid re-creating what already exists.
- ✅ Ensure the module is correctly integrated into the app’s **navigation**, **routes**, and **menus** (e.g., sidebar, tabs, breadcrumbs)

---

## 📌 Usage Instructions (For AI Agent)

Replace placeholders:
- `<LEGACY_MODULE_URL_OR_PATH>` with the actual legacy source (e.g., GitHub URL)
- `<module-name>` with the new module folder name
- Add business-specific filters (e.g., `branchId`, `customerGroup`, etc.)

Trigger the migration with: