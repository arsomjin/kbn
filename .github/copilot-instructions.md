# Custom Instructions for GitHub Copilot

## Project Overview
KBN is a comprehensive business management platform built with React, TypeScript, and Firebase, providing features for inventory management, sales tracking, customer management, and reporting for branch-based businesses. We're migrating from a JavaScript codebase to TypeScript, and extending the platform to support multiple provinces (previously single-province only).

This migration includes implementing a comprehensive Role-Based Access Control (RBAC) system that wasn't fully integrated in the original JavaScript codebase. The RBAC system will enforce hierarchical permissions across provinces, branches, and user roles, ensuring proper data access control throughout the application.

## Migration & Extension Goals
- Convert from JavaScript to TypeScript with proper typing
- Refactor single-province architecture to multi-province support
- Maintain backward compatibility with existing data
- Fully implement the RBAC system that was only partially integrated in the JavaScript version
- Ensure province-based access control is enforced at all application levels (routes, components, services)
- Implement consistent permission checks for all operations using the documented RBAC patterns
- Convert existing date/time handling libraries such as moment, dayjs, etc. to luxon

## Tech Stack
- **Frontend**: React 18+, TypeScript, Redux for state management
- **Backend**: Firebase (Firestore, Authentication, Storage, Cloud Functions)
- **UI Library**: Ant Design (antd)
- **Styling**: CSS modules with Tailwind CSS
- **State Management**: Redux with Redux Toolkit
- **Build Tools**: Create React App with custom configurations
- **Date Management**: Luxon

## Directory Structure
- `/src`: Main application source code
  - `/assets`: Static assets (images, icons, animations)
  - `/components`: Reusable UI components
  - `/contexts`: React context providers
  - `/hooks`: Custom React hooks
  - `/modules`: Feature-based code organization
    - `/province`: Province management module (new)
  - `/navigation`: Routing configuration
  - `/services`: API and external service integrations
  - `/store`: Redux store configuration and slices
  - `/theme`: Theming and styling configuration
  - `/translations`: Internationalization files
  - `/types`: TypeScript type definitions
  - `/utils`: Utility functions and helpers

## Code Style & Conventions

### General
- Use double quotes for strings
- Use Yarn for managing dependencies, not npm
- Use camelCase for variable and function names
- Use PascalCase for component names and class names
- Use UPPER_SNAKE_CASE for constants
- Prefer arrow functions over traditional function expressions
- Destructure props and state where appropriate
- Always use explicit return types for functions in TypeScript files
- Add JSDoc comments for complex functions and components
- Use meaningful variable/function names that reflect their purpose

### Components
- Prefer functional components with hooks
- Keep components focused on a single responsibility
- Extract complex logic to custom hooks
- Use TypeScript interfaces for component props
- Follow this component template:
  ```tsx
  import React from "react";
  import "./ComponentName.module.css";

  interface ComponentNameProps {
    // Props definition
  }

  /**
   * ComponentName description
   */
  export const ComponentName: React.FC<ComponentNameProps> = ({ prop1, prop2 }) => {
    // Component logic
    return (
      <div className="component-name">
        {/* Component content */}
      </div>
    );
  };
  ```

### File Organization
- One component per file
- Group related files in feature-based directories
- Name test files with `.test.ts` or `.test.tsx` suffix
- Follow these naming conventions:
  - React Components: `ComponentName.tsx`
  - Style files: `ComponentName.module.css`
  - Test files: `ComponentName.test.tsx`
  - Hook files: `useHookName.ts`
  - Utility files: `descriptiveNameUtil.ts`

## Best Practices
- Minimize use of `any` type in TypeScript
- Use early returns to reduce nesting
- Use proper error handling with try/catch blocks
- Use async/await instead of promise chains
- Follow clean code principles (meaningful names, small functions)
- Document complex business logic with comments
- Optimize re-renders with React.memo, useCallback, and useMemo
- Use TypeScript generics for reusable components and functions
- Handle loading and error states for async operations
- When migrating code, add proper TypeScript types instead of using 'any'
- Always implement province filtering for data queries

## Testing
- We use Jest for unit testing and Playwright for end-to-end testing
- Write tests for all utility functions
- Write tests for complex components
- Mock Firebase calls in tests
- Focus on testing behavior, not implementation details
- Use React Testing Library for component tests
- Test multi-province scenarios explicitly
- Follow this test template:
  ```tsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import { ComponentName } from "./ComponentName";

  describe("ComponentName", () => {
    it("should render correctly", () => {
      render(<ComponentName prop1="test" />);
      expect(screen.getByText("expected text")).toBeInTheDocument();
    });
    
    it("should handle interactions correctly", () => {
      render(<ComponentName prop1="test" />);
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByText("after click")).toBeInTheDocument();
    });
    
    it("should handle multi-province data correctly", () => {
      const provinces = ["province1", "province2"];
      render(<ComponentName provinces={provinces} />);
      // Test province-specific behavior
    });
  });
  ```

## Commit Conventions
- Use conventional commits format: `type(scope): message`
- Example types: feat, fix, docs, style, refactor, test, chore
- Keep commit messages concise and descriptive
- Include ticket/issue number when applicable: `feat(auth): implement password reset (#123)`
- For migration commits, use: `refactor(migration): convert X component to TypeScript`
- For multi-province changes, use: `feat(multi-province): add province selector to X component`

## Role-Based Access Control
The application implements a hierarchical RBAC system with the following roles (from lowest to highest privilege):

| Role | Description | Access Level | Province Access |
|------|-------------|-------------|-----------------|
| `GUEST` | Unauthenticated users | Minimal access | None |
| `PENDING` | Users awaiting approval | Very limited access | None |
| `USER`/`BRANCH` | Standard authenticated users | Basic access | Single branch |
| `LEAD` | Team leads/reviewers | Enhanced basic access | Single branch |
| `BRANCH_MANAGER` | Branch managers | Intermediate access | Single branch |
| `PROVINCE_MANAGER` | Province managers | Higher intermediate access | Single province |
| `GENERAL_MANAGER` | General managers | Advanced access | Multiple provinces |
| `ADMIN` | Administrative users | High-level access | All provinces |
| `PRIVILEGED` | Users with special access | Very high access | All provinces |
| `SUPER_ADMIN`/`DEVELOPER` | System administrators | Complete system access | All provinces |

Permission checks should be implemented using:

```tsx
// Route protection with province check
<Route
  path="/protected-route/:provinceId"
  element={
    <PermissionProtectedRoute 
      requiredPermission={PERMISSIONS.SOME_PERMISSION}
      provinceCheck={(params) => hasProvinceAccess(params.provinceId)}
    >
      <ProtectedComponent />
    </PermissionProtectedRoute>
  }
/>

// Component-level checks
const SomeComponent = ({ provinceId }) => {
  const { hasPermission, hasProvinceAccess } = usePermissions();
  
  if (!hasPermission(PERMISSIONS.SOME_PERMISSION) || !hasProvinceAccess(provinceId)) {
    return <AccessDenied />;
  }
  
  return <div>Protected content</div>;
};

// Service-level validation
export const updateRecord = async (data, provinceId) => {
  const { hasPermission, hasProvinceAccess } = usePermissions();
  
  if (!hasPermission(PERMISSIONS.EDIT_RECORDS) || !hasProvinceAccess(provinceId)) {
    throw new Error("Insufficient permissions");
  }
  
  // Proceed with update
};
```

For all new features, ensure proper permission boundaries are enforced at all levels, including province-level restrictions.

## Firebase Data Structure
The project uses Firestore with the following main collections as defined in `.github/prompts/data-schema.md`:

### Main Collections
- `changeLogs`: Stores application version changes history
- `users`: User accounts and profiles
- `provinces`: Province configuration and metadata (new)
- `data/{category}`: Reference data organized in subcollections:
  - `account`: Expense categories, expense names, account names
  - `company`: Banks, branches, departments, employees, locations
  - `products`: Part lists, vehicle lists 
  - `sales`: Customers, dealers, referrers, data sources
  - `services`: Service lists
- `messages`: Notification and system messages
- `reports`: Analytics and reporting data
- `sections/{businessFunction}`: Operational data by business function:
  - `account`: Expenses, income records
  - `sales`: Bookings, sales records
  - `services`: Service orders, items
  - `stocks`: Inventory movements

### Multi-Province Structure
All operational data now includes a `provinceId` field:

```typescript
// Collection queries with province filtering
const customersRef = collection(db, "data", "sales", "customers");
const customers = await getDocs(query(
  customersRef,
  where("deleted", "==", false),
  where("provinceId", "==", currentProvinceId),
  where("branchCode", "==", currentBranch),
  orderBy("created", "desc")
));

// Document operations
await setDoc(
  doc(db, "data", "sales", "customers", customerId), 
  {
    ...customerData,
    provinceId: currentProvinceId
  }
);
```

### Common Query Patterns
```typescript
// Collection queries
const customersRef = collection(db, "data", "sales", "customers");
const customers = await getDocs(query(
  customersRef,
  where("deleted", "==", false),
  where("provinceId", "==", currentProvinceId), // New province filter
  where("branchCode", "==", currentBranch),
  orderBy("created", "desc")
));

// Document operations
await setDoc(doc(db, "data", "sales", "customers", customerId), {
  ...customerData,
  provinceId: currentProvinceId // Always include province ID
});
await updateDoc(doc(db, "data", "sales", "customers", customerId), { status: "active" });
```

## Field Naming Conventions
When creating models that interact with Firestore, follow these naming patterns:

1. **ID Fields**: Use the pattern `entityId` (e.g., `customerId`, `expenseId`, `serviceId`)
2. **Reference Fields**: Use the same name as the ID with proper camelCase
3. **Date Fields**: Use `created` for creation timestamps, `date` for event dates
4. **User Fields**: Use `inputBy` for the user who created the record
5. **Status Fields**: Use `status` for workflow states (e.g., "pending", "complete")
6. **Common Fields**:
   - `provinceId`: Province identifier (new required field)
   - `branchCode`: Branch identifier
   - `keywords`: Array of search keywords
   - `deleted`: Boolean flag for soft deletes
   - `remark`: Additional notes

For example, when modeling a customer record, follow this structure:
```typescript
interface Customer {
  customerId: string;
  provinceId: string; // New required field
  prefix: string;
  firstName: string;
  firstName_lower?: string; // For case-insensitive search
  firstName_partial?: string; // For partial matching
  lastName: string;
  lastName_lower?: string;
  lastName_partial?: string;
  phoneNumber: string;
  phoneNumber_lower?: string;
  address: {
    address: string;
    moo: string;
    village: string;
    province: string;
    amphoe: string;
    tambol: string;
    postcode: string;
  };
  branchCode: string;
  inputBy: string; // User ID
  created: number; // Timestamp
  updated?: number; // Update timestamp
  keywords: string[];
  deleted: boolean;
  remark?: string;
}
```

## Common Patterns

### Province Selection
Include province selection in forms and filters:
```tsx
import { Form, Input, Button, Select } from "antd";

const MyForm: React.FC = () => {
  const [form] = Form.useForm();
  const { provinces } = useProvinces(); // Get available provinces
  
  const onFinish = async (values: any) => {
    try {
      // Process form submission with province
      await submitData({
        ...values,
        provinceId: values.provinceId
      });
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };
  
  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item 
        name="provinceId" 
        label="Province" 
        rules={[{ required: true, message: "Province is required" }]}
      >
        <Select>
          {provinces.map(province => (
            <Select.Option key={province.id} value={province.id}>
              {province.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      {/* Other form fields */}
      <Form.Item>
        <Button type="primary" htmlType="submit">Submit</Button>
      </Form.Item>
    </Form>
  );
};
```

### Form Handling
Use Ant Design Form with validation:
```tsx
import { Form, Input, Button } from "antd";

const MyForm: React.FC = () => {
  const [form] = Form.useForm();
  
  const onFinish = async (values: any) => {
    try {
      // Process form submission
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };
  
  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item 
        name="fieldName" 
        label="Field Label" 
        rules={[{ required: true, message: "Field is required" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">Submit</Button>
      </Form.Item>
    </Form>
  );
};
```

### Error Handling
Use consistent error handling patterns:
```typescript
try {
  // Operation that might fail
} catch (error) {
  // Log error details
  console.error("Error context:", error);
  
  // Format user-friendly message
  const message = error instanceof Error 
    ? error.message 
    : "An unexpected error occurred";
  
  // Display to user
  notification.error({
    message: "Error Title",
    description: message,
  });
}
```

### Firebase Transactions
Use transactions for operations requiring atomicity:
```typescript
const updateCounter = async (documentId: string, provinceId: string): Promise<void> => {
  const docRef = doc(db, "collection", documentId);
  
  await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(docRef);
    if (!docSnap.exists()) {
      throw new Error("Document does not exist");
    }
    
    // Verify province match for security
    if (docSnap.data().provinceId !== provinceId) {
      throw new Error("Province mismatch");
    }
    
    const newCount = docSnap.data().count + 1;
    transaction.update(docRef, { count: newCount });
  });
};
```

### Data Migration Helper
Use this pattern for migrating existing data to include province IDs:
```typescript
const migrateCollection = async (
  collectionPath: string,
  defaultProvinceId: string
): Promise<void> => {
  const collectionRef = collection(db, collectionPath);
  const snapshot = await getDocs(collectionRef);
  
  const batch = writeBatch(db);
  let count = 0;
  
  snapshot.forEach(doc => {
    // Skip if already has provinceId
    if (doc.data().provinceId) return;
    
    batch.update(doc.ref, { provinceId: defaultProvinceId });
    count++;
    
    // Firebase batch has a limit of 500 operations
    if (count >= 450) {
      await batch.commit();
      batch = writeBatch(db);
      count = 0;
    }
  });
  
  if (count > 0) {
    await batch.commit();
  }
};
```

## UI/UX Patterns
- Use Ant Design components for consistent UI
- Follow responsive design principles
- Maintain accessible UI elements
- Provide loading indicators for async operations
- Use proper error states and messages
- Follow the established color scheme and typography
- Implement consistent form validation patterns
- Include province selector in relevant screens
- Show current province context in UI headers/navigation
