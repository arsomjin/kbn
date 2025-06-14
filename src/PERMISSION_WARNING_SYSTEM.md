# KBN Permission Warning System

## 🎯 Overview

The Permission Warning System provides user-friendly warning messages when users don't have permission to perform certain actions. Instead of silently failing or showing generic error messages, the system provides clear, contextual feedback in both Thai and English.

## 🚀 Features

### ✅ **User-Friendly Messages**

- Clear Thai and English warning messages
- Context-specific explanations
- Professional, non-technical language

### ✅ **Multiple Warning Types**

- **Notifications**: Non-blocking toast messages
- **Modals**: Blocking alert dialogs
- **Tooltips**: Hover explanations for disabled buttons
- **Console Logging**: Debug information for developers

### ✅ **Comprehensive Coverage**

- Permission-based warnings (department.action)
- Authority level warnings (ADMIN, BRANCH_MANAGER, etc.)
- Geographic access warnings (province/branch restrictions)
- Status-based warnings (approved items, cancelled items)
- User status warnings (inactive accounts, unmigrated users)

### ✅ **Developer-Friendly**

- Easy-to-use utility functions
- Higher-order components and functions
- Pre-configured components for common scenarios
- Comprehensive TypeScript/PropTypes support

---

## 📦 Components & Utilities

### **Core Utilities**

```javascript
import {
  showPermissionWarning,
  showPermissionAlert,
  withPermissionCheck,
  PermissionChecker,
} from "utils/permissionWarnings";
```

### **Permission-Aware Components**

```javascript
import PermissionButton, {
  ApproveButton,
  EditButton,
  DeleteButton,
  CreateButton,
  ViewButton,
} from "components/PermissionButton";

import PermissionGate from "components/PermissionGate";
```

---

## 🛠️ Usage Examples

### **1. Basic Warning Notifications**

```javascript
import { showPermissionWarning } from "utils/permissionWarnings";

// Basic permission denied
const handleAction = () => {
  if (!hasPermission("accounting.approve")) {
    showPermissionWarning("CANNOT_APPROVE");
    return;
  }
  // Proceed with action
};

// Custom message
const handleCustomAction = () => {
  showPermissionWarning("NO_PERMISSION", {
    customMessage: {
      title: "ไม่สามารถเข้าถึงข้อมูลลูกค้า",
      description: "คุณต้องได้รับอนุญาตจากผู้จัดการสาขา",
    },
    context: "กรุณาติดต่อผู้จัดการสาขาของคุณ",
  });
};

// Geographic restriction
const handleGeographicAction = () => {
  showPermissionWarning("WRONG_BRANCH", {
    context: "คุณมีสิทธิ์เฉพาะสาขา 0450 เท่านั้น",
  });
};
```

### **2. Permission-Aware Buttons**

```jsx
import { ApproveButton, EditButton, DeleteButton } from 'components/PermissionButton';

// Pre-configured buttons
<ApproveButton
  permission="accounting.approve"
  onClick={handleApprove}
>
  อนุมัติรายการ
</ApproveButton>

<EditButton
  permission="sales.edit"
  onClick={handleEdit}
  disabled={item.status === 'approved'}
>
  แก้ไขข้อมูล
</EditButton>

// Custom permission button
<PermissionButton
  permission="inventory.delete"
  authority="BRANCH_MANAGER"
  geographic={{ branchCode: selectedBranch }}
  warningType="CANNOT_DELETE"
  onClick={handleDelete}
  type="danger"
>
  ลบสินค้า
</PermissionButton>
```

### **3. Permission Gates**

```jsx
import PermissionGate from 'components/PermissionGate';

// Hide content if no permission
<PermissionGate permission="accounting.view">
  <AccountingReports />
</PermissionGate>

// Show fallback message
<PermissionGate
  permission="admin.system"
  fallback={
    <Alert
      message="ไม่มีสิทธิ์เข้าถึง"
      description="คุณไม่มีสิทธิ์เข้าถึงการตั้งค่าระบบ"
      type="warning"
    />
  }
>
  <SystemSettings />
</PermissionGate>

// Multiple permission checks
<PermissionGate
  allOf={['sales.view', 'sales.edit']}
  authority="BRANCH_MANAGER"
>
  <AdvancedSalesTools />
</PermissionGate>
```

### **4. Higher-Order Functions**

```javascript
import { withPermissionCheck } from "utils/permissionWarnings";

// Wrap existing functions
const protectedDeleteAction = withPermissionCheck(
  (itemId) => {
    // Original delete logic
    deleteItem(itemId);
  },
  (itemId) => hasPermission("inventory.delete"),
  "CANNOT_DELETE",
  {
    context: "ต้องการสิทธิ์ inventory.delete",
  }
);

// Use the protected function
const handleDelete = (itemId) => {
  protectedDeleteAction(itemId);
};
```

### **5. Permission Checker Utilities**

```javascript
import { PermissionChecker } from "utils/permissionWarnings";

// Built-in checkers with automatic warnings
const handleEdit = () => {
  if (PermissionChecker.canEdit(user, selectedItem)) {
    // Proceed with edit
    openEditModal();
  }
  // Warning is automatically shown if permission denied
};

const handleApprove = () => {
  if (
    PermissionChecker.canApprove(user, {
      department: "accounting",
      branch: selectedBranch,
    })
  ) {
    // Proceed with approval
    approveItem();
  }
};
```

---

## 📋 Warning Message Types

### **General Permissions**

- `NO_PERMISSION` - Generic access denied
- `CANNOT_APPROVE` - Cannot approve items
- `CANNOT_EDIT` - Cannot edit data
- `CANNOT_DELETE` - Cannot delete data
- `CANNOT_VIEW` - Cannot view data
- `CANNOT_CREATE` - Cannot create new items

### **Geographic Restrictions**

- `WRONG_PROVINCE` - Province access denied
- `WRONG_BRANCH` - Branch access denied
- `WRONG_DEPARTMENT` - Department access denied

### **Status-Based**

- `ITEM_ALREADY_APPROVED` - Item already approved
- `ITEM_CANCELLED` - Item is cancelled
- `USER_INACTIVE` - User account inactive
- `USER_NOT_MIGRATED` - User needs RBAC migration

---

## 🎨 Styling & Theming

The permission warning system integrates with the unified theme system:

```css
/* Automatic styling applied */
.nature-notification-warning {
  font-family: var(--nature-font-family);
}

.permission-denied {
  opacity: 0.6;
  cursor: not-allowed;
  border-color: var(--nature-border-color);
}

.ant-alert.permission-alert {
  font-family: var(--nature-font-family);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

---

## 🔧 Configuration Options

### **showPermissionWarning() Options**

```javascript
showPermissionWarning("CANNOT_APPROVE", {
  customMessage: {
    title: "Custom Title",
    description: "Custom Description",
  },
  context: "Additional context information",
  useEnglish: false, // Show English messages
  placement: "topRight", // Notification placement
  duration: 4.5, // Duration in seconds (0 = manual close)
});
```

### **PermissionButton Props**

```javascript
<PermissionButton
  permission="accounting.approve" // Required permission
  anyOf={["perm1", "perm2"]} // User needs any one
  allOf={["perm1", "perm2"]} // User needs all
  authority="BRANCH_MANAGER" // Required authority level
  department="accounting" // Required department
  geographic={{ branchCode: "0450" }} // Geographic context
  warningType="CANNOT_APPROVE" // Warning message type
  warningMessage="Custom message" // Custom warning
  showTooltip={true} // Show tooltip on hover
  hideWhenDenied={false} // Hide button if no permission
  onClick={handleClick} // Click handler
/>
```

---

## 🚀 Integration with Existing Code

### **Update AuditHistory Component**

```javascript
// Before: Silent failure
const handleApprove = () => {
  if (!canApprove || !user) return;
  // ...
};

// After: User-friendly warning
import { showPermissionWarning } from "utils/permissionWarnings";

const handleApprove = () => {
  if (!canApprove || !user) {
    if (!user) {
      showPermissionWarning("USER_NOT_MIGRATED", {
        context: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
      });
    } else if (!canApprove) {
      showPermissionWarning("CANNOT_APPROVE", {
        context: "คุณไม่มีสิทธิ์ในการอนุมัติรายการนี้",
      });
    }
    return;
  }
  // Proceed with approval
};
```

### **Replace Regular Buttons**

```jsx
// Before: Regular button
<Button
  onClick={handleDelete}
  disabled={!hasPermission('inventory.delete')}
>
  ลบสินค้า
</Button>

// After: Permission-aware button
<DeleteButton
  permission="inventory.delete"
  onClick={handleDelete}
>
  ลบสินค้า
</DeleteButton>
```

---

## 📊 Benefits

### **For Users**

- ✅ Clear understanding of why actions are blocked
- ✅ Guidance on how to get required permissions
- ✅ Professional, non-technical language
- ✅ Consistent experience across the application

### **For Developers**

- ✅ Reduced support tickets about "broken" features
- ✅ Easier debugging with detailed console logs
- ✅ Consistent permission handling patterns
- ✅ Less boilerplate code for permission checks

### **For Business**

- ✅ Better user experience and satisfaction
- ✅ Reduced training time for new users
- ✅ Clear audit trail of permission denials
- ✅ Professional appearance for enterprise software

---

## 🎯 Best Practices

### **1. Use Appropriate Warning Types**

```javascript
// Good: Specific warning types
showPermissionWarning("CANNOT_APPROVE");
showPermissionWarning("WRONG_BRANCH");
showPermissionWarning("ITEM_ALREADY_APPROVED");

// Avoid: Generic warnings for specific scenarios
showPermissionWarning("NO_PERMISSION"); // Too generic
```

### **2. Provide Context**

```javascript
// Good: Helpful context
showPermissionWarning("CANNOT_EDIT", {
  context: "เอกสารนี้ได้รับการอนุมัติแล้วเมื่อ 15/12/2024",
});

// Avoid: No context
showPermissionWarning("CANNOT_EDIT"); // User doesn't know why
```

### **3. Use Pre-configured Components**

```jsx
// Good: Use pre-configured components
<ApproveButton permission="accounting.approve" onClick={handleApprove} />

// Avoid: Manual implementation
<Button
  onClick={() => {
    if (!hasPermission('accounting.approve')) {
      showPermissionWarning('CANNOT_APPROVE');
      return;
    }
    handleApprove();
  }}
>
  อนุมัติ
</Button>
```

### **4. Consistent Permission Naming**

```javascript
// Good: Consistent department.action format
"accounting.approve";
"sales.edit";
"inventory.view";

// Avoid: Inconsistent naming
"approve_accounting";
"editSales";
"view-inventory";
```

---

## 🔍 Testing & Debugging

### **Development Mode Features**

- Detailed console logging with user context
- Permission check debugging information
- Visual indicators for permission-denied states

### **Testing Different User Roles**

```javascript
// Use the examples component for testing
import PermissionWarningExamples from "examples/PermissionWarningExamples";

// Available at /dev/permission-examples
<Route path="/dev/permission-examples" component={PermissionWarningExamples} />;
```

---

## 📈 Future Enhancements

### **Planned Features**

- 🔄 **Permission Request Workflow**: Allow users to request permissions
- 📧 **Email Notifications**: Notify administrators of permission requests
- 📊 **Analytics Dashboard**: Track permission denial patterns
- 🌐 **Multi-language Support**: Additional language options
- 🎨 **Custom Themes**: Customizable warning message styling

### **Integration Opportunities**

- 🔗 **Help System**: Link warnings to relevant documentation
- 📱 **Mobile Optimization**: Enhanced mobile warning experience
- 🔔 **Push Notifications**: Real-time permission updates
- 🤖 **AI Suggestions**: Smart permission recommendations

---

## 🤝 Contributing

When adding new warning types or enhancing the system:

1. **Add to WARNING_MESSAGES**: Define Thai and English messages
2. **Update TypeScript Types**: Add new message types to constants
3. **Create Examples**: Add usage examples to the examples component
4. **Update Documentation**: Keep this documentation current
5. **Test Thoroughly**: Verify warnings work across different user roles

---

**The Permission Warning System transforms user frustration into clear guidance, making the KBN application more professional and user-friendly.** 🎯✨
