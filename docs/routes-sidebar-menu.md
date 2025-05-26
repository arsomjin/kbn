# 🧭 Route and Sidebar Menu Implementation Guide

## 🗂️ Objective

Implement **routes and sidebar menu items** dynamically based on user **roles**, **permissions**, and **organizational hierarchy**, supporting 4 distinct access layers:

- Executive
- Province
- Branch Manager
- Branch Staff

This guide applies to **all modules** and must be enforced consistently throughout the application.

---

## 🧩 Structure: Route Layers

Define routes for each module (e.g., `Account`) according to the following hierarchy:

### 1. Executive Layer

- **Path:** `/account/*`
- **Allow Role Category:** `executive`
- **Access Scope:** All provinces, all branches, all reports
- **Permissions:** `view`, `create`, `edit`, `approve`, `delete`
- **Sidebar Menu Group:** `Account (Executive)`
- **Example Route:** `/account/income`, `/account/expense`, `/account/report`

---

### 2. Province Layer

- **Path:** `/{provinceId}/account/*`
- **Allow Role Category:** `province_manager`
- **Access Scope:** All branches under their province
- **Permissions:** Based on province-specific permission set
- **Sidebar Menu Group:** `Account (Province)`
- **Example Route:** `/BKK/account/income`, `/CNX/account/report`

---

### 3. Branch Manager Layer

- **Path:** `/{provinceId}/{branchCode}/account/*`
- **Allow Role Category:** `branch_manager`
- **Access Scope:** Their own branch only
- **Permissions:** `view`, `review`, `approve`
- **Sidebar Menu Group:** `Account (Branch Manager)`
- **Example Route:** `/BKK/0011/account/expense`, `/BKK/0011/account/report`

---

### 4. Branch Staff Layer

- **Path:** `/{provinceId}/{branchCode}/account/*`
- **Allow Role Category:** All roles **except** `guest`, `pending`
- **Access Scope:** Their own branch only
- **Permissions:** `view`, `create`, `edit` (NO approve/delete)
- **Sidebar Menu Group:** `Account (Staff)`
- **Example Route:** `/BKK/0011/account/income`, `/BKK/0011/account/report`

---

## 🧠 AI Task Instructions

When generating routes or sidebar menus:

### ✅ Check Role and Permission

- Use role category and permissions from the current user session (`user.roleCategory`, `user.permissions`).
- Restrict access to routes that the role is not permitted to view.

### ✅ Render Sidebar Conditionally

- Render only the menu items the user has permission to view.
- Group items under logical group titles (e.g., Income, Expense, Report).
- Include icons if available from the icon library.

### ✅ Sidebar Group & Route Example (Income)

```ts
{
  title: "Income",
  icon: <DollarIcon />,
  children: [
    {
      label: "View Income",
      path: "/account/income", // or `/${provinceId}/account/income`, etc.
      permission: "view",
    },
    {
      label: "Create Income",
      path: "/account/income/create",
      permission: "create",
    },
    {
      label: "Approve Income",
      path: "/account/income/approval",
      permission: "approve",
    }
  ]
}
```

---

## 🚫 Cross-Layer Access Prevention

To prevent users from accessing menus or routes outside their designated layer:

### 🛡️ AI Instruction

When implementing routing logic or sidebar menu rendering, **automatically enforce user-layer isolation**:

1. **Redirect to Correct Layer**

   - If a `branch_staff` accesses `/about` (or any root-level or higher layer), **redirect** them to their corresponding branch path:
     ```
     /{provinceId}/{branchCode}/...
     ```

2. **Apply Layer Scoping Logic**

   - Use a utility like `getUserRoutePrefix(user)` to compute the appropriate base path for the user's role.
     - `executive` → `/`
     - `province_manager` → `/${provinceId}/`
     - `branch_*` → `/${provinceId}/${branchCode}/`
   - Prefix all accessible routes and sidebar paths with this base.

3. **Disallow Menu Rendering from Other Layers**
   - Branch staff must **not see** executive-level or province-level menus (even if permission matches).
   - Menu visibility must depend on both:
     - `user.roleCategory`
     - `user.currentLayerScope`

### ✅ Example Redirect

If a branch staff visits `/about`, auto-redirect:

```ts
navigate(`/${user.provinceId}/${user.branchCode}/account/income`);
```

Use this pattern across all modules and protected routes.
