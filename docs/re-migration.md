# Title: Re-Migrate Incomplete Account Module

> 🔗 This migration must follow all architectural and coding standards defined in `ai-context.md`.

## Description
The initial migration of the Employee module is **incomplete**. Please re-import and properly migrate the module by scanning the full source and ensuring **complete feature parity** with the legacy implementation. This includes **all components, logic, hooks, and helpers**, not just a partial conversion.

## Source Repository
https://github.com/arsomjin/kubota-benjapol/tree/main/src/Modules/Account

## Target Path
Place the completed and properly migrated module under:  
`src/modules/account` (lowercase)

---

## ❗ Mandatory Fixes

- ✅ **Re-check the original module structure** and **ensure all components, files, and logic are migrated**
- ✅ Any components or logic **skipped or oversimplified previously must be restored and properly converted**
- ✅ Re-validate that all **forms, tables, modals, state logic, and API handlers** work identically to the legacy version

---

## ✅ Migration Checklist

- Convert to **TypeScript** with full and accurate typings
- Apply **responsive layout** using **Ant Design + Tailwind CSS**
- Implement **Role-Based Access Control (RBAC)**, and ensure filtering by `provinceId`
- Use **Luxon** for all date/time logic
- Replace hardcoded text with **i18next** keys under `account.json` namespace
- Maintain **exact business logic**, behavior, and data flow — no simplification without justification
- Ensure full **dark mode compatibility**
- **Avoid duplicating utilities/components** — scan the codebase and reuse when possible
- Place the code in the correct new folder: `src/modules/account`
- Register the module's **routes**, **navigation entries**, and **sidebar/menu items** appropriately using the project's routing and menu systems

---

## ⚠️ Expectations

- 🧩 The number and type of components should match the original. If the legacy had 7 components and 3 helpers, the migrated version must too — unless a clear improvement is applied and explained.
- 💬 Leave comments where logic or design is improved or replaced.
- 🔍 If any parts were previously skipped or left stubbed, now is the time to fully restore and migrate them.
- Ensure the module is correctly integrated into the app’s **navigation**, **routes**, and **menus** (e.g., sidebar, tabs, breadcrumbs)

---

## 🧠 Notes
This is not a new feature development — this is a **full re-migration with complete parity**, with modernization allowed **only if all functionality is preserved.**