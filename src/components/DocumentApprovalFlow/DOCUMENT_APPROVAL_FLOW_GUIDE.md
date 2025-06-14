# Document Approval Flow System

## Overview

The Document Approval Flow System is a comprehensive, reusable solution for managing document approval workflows in the KBN application. It integrates seamlessly with LayoutWithRBAC and provides complete approval functionality for different document types.

## 🎯 Key Features

- **Multi-step approval workflows** with customizable configurations
- **RBAC-based permission checking** with automatic department mapping
- **Complete audit trail integration** with status tracking
- **Geographic context awareness** for multi-province operations
- **Reusable components** for different document types
- **Permission warning system** integration
- **Real-time status updates** with user feedback

## 📋 Document Approval Flow Steps

### 1. **Document Creation → Review → Approval → Completion**

```
Draft → Submit → Review → Approve → Complete
  ↓       ↓        ↓        ↓        ↓
Edit    Send    Check   Accept   Done
```

### 2. **Permission-Based Flow Control**

```javascript
// Each step requires specific permissions
const APPROVAL_FLOW = {
  draft: "department.edit", // Can create/edit
  review: "department.review", // Can review
  approve: "department.approve", // Can approve
  complete: "department.view", // Can view completed
};
```

## 🏗️ System Architecture

### Core Components

1. **DocumentApprovalFlow** - Main approval interface
2. **DocumentWorkflowWrapper** - Integration with LayoutWithRBAC
3. **ApprovalStatusBadge** - Status display component
4. **ApprovalHistory** - Timeline of approval actions

### Integration Flow

```
User Action → DocumentApprovalFlow → DocumentWorkflowWrapper → LayoutWithRBAC
     ↓              ↓                      ↓                    ↓
Permission     Status Change         Document Save        Audit Trail
 Check         + Step Progress       + State Update       + History
```

## 🔧 Implementation Guide

### Basic Usage with DocumentWorkflowWrapper

```javascript
import { DocumentWorkflowWrapper } from "components/DocumentApprovalFlow";

const InvoiceManagement = () => {
  const [invoiceData, setInvoiceData] = useState({
    id: "INV-001",
    status: "draft",
    currentStep: 0,
    // ... other invoice data
  });

  const handleDocumentSave = async (updatedData) => {
    // Save to Firebase/API
    await saveInvoice(updatedData);
    setInvoiceData(updatedData);
  };

  const handleDocumentLoad = async (documentId) => {
    // Load from Firebase/API
    return await loadInvoice(documentId);
  };

  return (
    <DocumentWorkflowWrapper
      documentId={invoiceData.id}
      documentType="invoice"
      documentData={invoiceData}
      onDocumentSave={handleDocumentSave}
      onDocumentLoad={handleDocumentLoad}
      title="จัดการใบแจ้งหนี้"
      subtitle="Invoice Management"
    >
      <InvoiceForm
      // Form will receive enhanced props automatically:
      // - documentData, currentStatus, currentStep
      // - onSave, onStatusChange, onApprove, onReject
      // - permissions, auditTrail, approvalConfig
      />
    </DocumentWorkflowWrapper>
  );
};
```

### Advanced Usage with Custom Configuration

```javascript
const customApprovalConfig = {
  department: "sales",
  steps: [
    { title: "สร้างใบเสนอราคา", status: "draft", permission: "sales.edit" },
    { title: "ตรวจสอบราคา", status: "price_check", permission: "sales.review" },
    {
      title: "อนุมัติราคาพิเศษ",
      status: "special_approval",
      permission: "sales.approve",
    },
    { title: "ส่งใบเสนอราคา", status: "sent", permission: "sales.send" },
    { title: "เสร็จสิ้น", status: "completed", permission: "sales.view" },
  ],
  statusLabels: {
    draft: "ฉบับร่าง",
    price_check: "ตรวจสอบราคา",
    special_approval: "รออนุมัติราคาพิเศษ",
    sent: "ส่งแล้ว",
    completed: "เสร็จสิ้น",
  },
};

<DocumentWorkflowWrapper
  documentType="quotation"
  customApprovalConfig={customApprovalConfig}
  // ... other props
>
  <QuotationForm />
</DocumentWorkflowWrapper>;
```

## 📊 Document Type Configurations

### Pre-configured Document Types

#### 1. **Invoice (Accounting)**

```javascript
'invoice': {
  department: 'accounting',
  steps: [
    { title: 'สร้างใบแจ้งหนี้', status: 'draft', permission: 'accounting.edit' },
    { title: 'ตรวจสอบข้อมูล', status: 'review', permission: 'accounting.review' },
    { title: 'อนุมัติใบแจ้งหนี้', status: 'approved', permission: 'accounting.approve' },
    { title: 'เสร็จสิ้น', status: 'completed', permission: 'accounting.view' }
  ]
}
```

#### 2. **Sales Order (Sales)**

```javascript
'sales_order': {
  department: 'sales',
  steps: [
    { title: 'สร้างใบสั่งขาย', status: 'draft', permission: 'sales.edit' },
    { title: 'ตรวจสอบราคา', status: 'price_review', permission: 'sales.review' },
    { title: 'อนุมัติการขาย', status: 'approved', permission: 'sales.approve' },
    { title: 'จัดส่งสินค้า', status: 'delivered', permission: 'sales.fulfill' },
    { title: 'เสร็จสิ้น', status: 'completed', permission: 'sales.view' }
  ]
}
```

#### 3. **Service Order (Service)**

```javascript
'service_order': {
  department: 'service',
  steps: [
    { title: 'รับงานซ่อม', status: 'received', permission: 'service.edit' },
    { title: 'ประเมินงาน', status: 'assessed', permission: 'service.assess' },
    { title: 'อนุมัติซ่อม', status: 'approved', permission: 'service.approve' },
    { title: 'ดำเนินการซ่อม', status: 'in_progress', permission: 'service.execute' },
    { title: 'ตรวจสอบคุณภาพ', status: 'quality_check', permission: 'service.quality' },
    { title: 'ส่งมอบงาน', status: 'completed', permission: 'service.complete' }
  ]
}
```

#### 4. **Inventory Import (Inventory)**

```javascript
'inventory_import': {
  department: 'inventory',
  steps: [
    { title: 'สร้างใบนำเข้า', status: 'draft', permission: 'inventory.edit' },
    { title: 'ตรวจสอบสินค้า', status: 'inspection', permission: 'inventory.inspect' },
    { title: 'อนุมัตินำเข้า', status: 'approved', permission: 'inventory.approve' },
    { title: 'บันทึกเข้าคลัง', status: 'recorded', permission: 'inventory.record' },
    { title: 'เสร็จสิ้น', status: 'completed', permission: 'inventory.view' }
  ]
}
```

## 🔐 RBAC Integration

### Automatic Permission Mapping

The system automatically maps document types to department permissions:

```javascript
// Document type → Department permissions
'invoice' → 'accounting.view', 'accounting.edit', 'accounting.approve'
'sales_order' → 'sales.view', 'sales.edit', 'sales.approve'
'service_order' → 'service.view', 'service.edit', 'service.approve'
'inventory_import' → 'inventory.view', 'inventory.edit', 'inventory.approve'
```

### Permission-Based Actions

```javascript
// Users can only perform actions they have permission for
const permissions = {
  canView: hasPermission("department.view"),
  canEdit: hasPermission("department.edit"),
  canReview: hasPermission("department.review"),
  canApprove: hasPermission("department.approve"),
};

// Actions are automatically enabled/disabled based on permissions
<ApproveButton
  permission="accounting.approve"
  onClick={handleApprove}
  // Automatically shows permission warning if user lacks access
/>;
```

## 🎨 UI Components

### ApprovalStatusBadge

```javascript
import { ApprovalStatusBadge } from "components/DocumentApprovalFlow";

<ApprovalStatusBadge status="approved" size="default" showTooltip={true} />;
// Displays: 🟢 อนุมัติแล้ว (with tooltip: "เอกสารได้รับการอนุมัติแล้ว")
```

### ApprovalHistory

```javascript
import { ApprovalHistory } from "components/DocumentApprovalFlow";

<ApprovalHistory
  auditTrail={auditTrailData}
  statusHistory={statusHistoryData}
  employees={employeeData}
  branches={branchData}
  showUserDetails={true}
  showGeographicInfo={true}
  maxItems={10}
/>;
```

## 🔄 Data Flow

### 1. **Document State Management**

```javascript
// Document data structure
const documentData = {
  id: "DOC-001",
  status: "draft", // Current status
  currentStep: 0, // Current step index
  createdBy: "user123",
  createdAt: 1640995200000,
  lastModifiedBy: "user456",
  lastModifiedAt: 1640995800000,
  // ... document-specific data
};
```

### 2. **Status Change Flow**

```javascript
// User clicks "Approve" button
handleApprove() →
  validatePermissions() →
  updateDocumentStatus() →
  saveToDatabase() →
  updateAuditTrail() →
  notifyUser() →
  refreshUI()
```

### 3. **Step Progression**

```javascript
// Automatic step progression with approval
const approvalData = {
  status: "approved", // New status
  step: currentStep + 1, // Next step
  approvedBy: user.uid,
  approvedAt: Date.now(),
  approvalComment: "อนุมัติเรียบร้อย",
};
```

## 🧪 Testing Examples

### Unit Testing

```javascript
import { render, fireEvent, waitFor } from "@testing-library/react";
import { DocumentApprovalFlow } from "components/DocumentApprovalFlow";

test("should show approve button for users with approve permission", () => {
  const mockProps = {
    documentId: "TEST-001",
    documentType: "invoice",
    currentStatus: "review",
    onApprove: jest.fn(),
  };

  render(<DocumentApprovalFlow {...mockProps} />);

  expect(screen.getByText("อนุมัติ")).toBeInTheDocument();
});
```

### Integration Testing

```javascript
test("complete approval workflow", async () => {
  const { getByText, getByRole } = render(
    <DocumentWorkflowWrapper
      documentId="TEST-001"
      documentType="invoice"
      documentData={{ status: "draft", currentStep: 0 }}
      onDocumentSave={mockSave}
    >
      <TestForm />
    </DocumentWorkflowWrapper>
  );

  // Submit for review
  fireEvent.click(getByText("ส่งตรวจสอบ"));
  await waitFor(() =>
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ status: "review" })
    )
  );

  // Approve document
  fireEvent.click(getByText("อนุมัติ"));
  fireEvent.click(getByRole("button", { name: "อนุมัติ" }));
  await waitFor(() =>
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ status: "approved" })
    )
  );
});
```

## 🚀 Migration from Existing Components

### Before (Manual Approval Handling)

```javascript
const InvoiceForm = () => {
  const [status, setStatus] = useState("draft");
  const { hasPermission } = usePermissions();

  const handleApprove = async () => {
    if (!hasPermission("accounting.approve")) {
      alert("No permission");
      return;
    }

    try {
      await updateInvoice({ status: "approved" });
      setStatus("approved");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <LayoutWithRBAC permission="accounting.view">
      <Form>
        {/* Form fields */}
        <Button onClick={handleApprove}>Approve</Button>
      </Form>
    </LayoutWithRBAC>
  );
};
```

### After (Using DocumentWorkflowWrapper)

```javascript
const InvoiceForm = ({
  documentData,
  onApprove,
  permissions,
  currentStatus,
}) => {
  // All approval logic handled by wrapper
  // Form receives enhanced props automatically

  return (
    <Form>
      {/* Form fields */}
      {/* Approval buttons handled by DocumentApprovalFlow */}
    </Form>
  );
};

const InvoiceManagement = () => (
  <DocumentWorkflowWrapper
    documentType="invoice"
    documentId="INV-001"
    onDocumentSave={saveInvoice}
  >
    <InvoiceForm />
  </DocumentWorkflowWrapper>
);
```

## 🎯 Best Practices

### 1. **Use DocumentWorkflowWrapper for Complete Integration**

- Provides automatic LayoutWithRBAC integration
- Handles all approval workflow logic
- Manages document state and audit trail

### 2. **Leverage Pre-configured Document Types**

- Use existing configurations when possible
- Only create custom configs for unique workflows

### 3. **Implement Proper Error Handling**

```javascript
const handleDocumentSave = async (data) => {
  try {
    await saveToFirebase(data);
  } catch (error) {
    console.error("Save failed:", error);
    message.error("ไม่สามารถบันทึกเอกสารได้");
    throw error; // Re-throw to let wrapper handle
  }
};
```

### 4. **Use Permission Warnings**

- System automatically shows appropriate warnings
- Integrates with existing permission warning system
- Provides context-specific messages

### 5. **Test Approval Workflows Thoroughly**

- Test each step transition
- Verify permission checks
- Test error scenarios

## 🔮 Future Enhancements

### Planned Features

1. **Bulk Approval** - Approve multiple documents at once
2. **Conditional Workflows** - Dynamic steps based on document data
3. **Email Notifications** - Automatic notifications for approvals
4. **Mobile Optimization** - Enhanced mobile approval interface
5. **Advanced Analytics** - Approval time tracking and bottleneck analysis

### Extension Points

```javascript
// Custom approval actions
const customActions = {
  escalate: {
    permission: "manager.escalate",
    handler: handleEscalation,
    label: "ส่งต่อผู้จัดการ",
  },
};

<DocumentApprovalFlow
  customActions={customActions}
  // ... other props
/>;
```

## 📞 Support

For questions or issues with the Document Approval Flow System:

1. Check this documentation first
2. Review existing implementations in the codebase
3. Test with the permission warning system examples
4. Consult the RBAC integration guide

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Compatibility**: KBN RBAC System v2.0+
