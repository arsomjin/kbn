# 🎯 **COMPREHENSIVE SYSTEM TESTING PLAN**

## 🌟 **The Ultimate End-to-End Validation**

### **Testing Philosophy: Build Everything from Scratch**

- **Complete data setup** from zero
- **Every role, every browser, every scenario**
- **Real-world workflow simulation**
- **Production-readiness validation**

---

## 📋 **PHASE 0: Complete Data Foundation Setup**

### **🏭 Step 0.1: Vehicle Inventory Setup (Admin - Port 3030)**

#### **Browser: Chrome (Admin)**

- [ ] **Navigate to**: `http://localhost:3030`
- [ ] **Login as Super Admin**
- [ ] **Go to**: `/admin/inventory/vehicle-list` or `/settings/vehicle-models`

#### **Create NSN Vehicle Inventory**

- [ ] **Add Vehicle Models for NSN**:
  ```
  Model: Kubota M7040 (NSN)
  Product Code: M7040-NSN-001
  Province: นครสวรรค์ (NSN)
  Branch: NSN001 - สาขาตาคลี
  List Price: 1,200,000 THB
  Stock Quantity: 5 units
  ```
- [ ] **Add More Models**:
  ```
  Model: Kubota L4508 (NSN)
  Product Code: L4508-NSN-001
  Province: นครสวรรค์ (NSN)
  Branch: NSN001 - สาขาตาคลี
  List Price: 850,000 THB
  Stock Quantity: 3 units
  ```

#### **Expected Results**:

- [ ] Vehicle models created with NSN geographic context
- [ ] Inventory available for NSN001 branch
- [ ] Stock levels properly set

### **🚚 Step 0.2: Inventory Import Testing (Admin - Port 3030)**

#### **Test Inventory Import Module**

- [ ] **Navigate to**: `/inventory/import` or `/warehouses/vehicles/import`
- [ ] **Create import document**:
  - Document Type: `inventory_import`
  - Supplier: Kubota Corporation Thailand
  - Branch: NSN001
  - Items: Additional M7040 units (3 more)
- [ ] **Test approval workflow**:
  - Draft → Inspection → Approved → Recorded → Completed
- [ ] **Verify stock updates**

#### **Expected Results**:

- [ ] Import document created with proper approval flow
- [ ] Stock levels updated correctly
- [ ] Audit trail captured
- [ ] Geographic context maintained

### **👥 Step 0.3: Test Customer Database (Admin - Port 3030)**

#### **Create Test Customers for NSN001**

- [ ] **Customer 1 - Individual**:

  ```
  Name: นายสมชาย รักษ์ดี
  Phone: 081-234-5678
  Address: 123 หมู่ 5 ตำบลตาคลี อำเภอตาคลี นครสวรรค์ 60140
  Customer Type: Individual
  Branch: NSN001
  ```

- [ ] **Customer 2 - Corporate**:
  ```
  Company: บริษัท เกษตรกรรมสมัยใหม่ จำกัด
  Contact: นายประยุทธ์ ทำนา
  Phone: 056-789-012
  Tax ID: 0123456789012
  Address: 456 ถนนพหลโยธิน ตำบลปากน้ำโพ อำเภอเมือง นครสวรรค์ 60000
  Customer Type: Corporate
  Branch: NSN001
  ```

#### **Expected Results**:

- [ ] Customers created with NSN001 context
- [ ] Customer data properly structured
- [ ] Available for sales processes

---

## 📋 **PHASE 1: Multi-Browser Role Setup**

### **🌐 Browser & Role Assignment**

#### **Chrome (Admin/Super Admin)**

- **Port**: 3030
- **Role**: Super Admin / Dev
- **Access**: All provinces, all branches
- **Purpose**: System administration, approvals, oversight

#### **Firefox (Sales Manager)**

- **Port**: 3031
- **Role**: Sales Manager (NSN001)
- **Access**: NSN province, NSN001 branch
- **Purpose**: Final sales approvals, management oversight

#### **Safari (Sales Lead)**

- **Port**: 3031 (Incognito)
- **Role**: Sales Lead (NSN001)
- **Access**: NSN province, NSN001 branch
- **Purpose**: Sales review, price verification

#### **Edge/Brave (Sales Staff)**

- **Port**: 3031 (Private)
- **Role**: Sales Staff (NSN001)
- **Access**: NSN province, NSN001 branch
- **Purpose**: Document creation, customer interaction

---

## 📋 **PHASE 2: User Management & Role Assignment**

### **🔐 Step 2.1: Create All User Accounts**

#### **Sales Staff Account (Edge/Brave - Private)**

- [ ] **Navigate to**: `http://localhost:3031`
- [ ] **Sign up**:
  ```
  Email: sales.staff.nsn001@kbn.test
  Name: นายขายดี สาขาตาคลี
  Phone: 081-111-1111
  Requested Role: SALES_STAFF
  Requested Province: นครสวรรค์ (NSN)
  Requested Branch: NSN001 - สาขาตาคลี
  ```
- [ ] **Expected**: Pending approval status

#### **Sales Lead Account (Safari - Incognito)**

- [ ] **Navigate to**: `http://localhost:3031`
- [ ] **Sign up**:
  ```
  Email: sales.lead.nsn001@kbn.test
  Name: นายหัวหน้าขาย สาขาตาคลี
  Phone: 081-222-2222
  Requested Role: SALES_LEAD
  Requested Province: นครสวรรค์ (NSN)
  Requested Branch: NSN001 - สาขาตาคลี
  ```

#### **Sales Manager Account (Firefox)**

- [ ] **Navigate to**: `http://localhost:3031`
- [ ] **Sign up**:
  ```
  Email: sales.manager.nsn001@kbn.test
  Name: นายผู้จัดการขาย สาขาตาคลี
  Phone: 081-333-3333
  Requested Role: SALES_MANAGER
  Requested Province: นครสวรรค์ (NSN)
  Requested Branch: NSN001 - สาขาตาคลี
  ```

### **🎯 Step 2.2: Admin Approval Process (Chrome - Admin)**

#### **Approve All Users**

- [ ] **Navigate to**: `/admin/user-approval`
- [ ] **Approve Sales Staff**:
  - Role: `SALES_STAFF`
  - Permissions: `sales.edit`, `sales.view`
  - Geographic: NSN001 only
- [ ] **Approve Sales Lead**:
  - Role: `SALES_LEAD`
  - Permissions: `sales.edit`, `sales.view`, `sales.review`
  - Geographic: NSN001 only
- [ ] **Approve Sales Manager**:
  - Role: `SALES_MANAGER`
  - Permissions: `sales.edit`, `sales.view`, `sales.review`, `sales.approve`
  - Geographic: NSN001 only

#### **Expected Results**:

- [ ] All users approved and active
- [ ] Proper role assignments
- [ ] Geographic restrictions applied
- [ ] Permission sets configured

---

## 📋 **PHASE 3: Complete Document Workflow Testing**

### **📝 Step 3.1: Sales Order Creation (Edge/Brave - Sales Staff)**

#### **Create Sales Booking**

- [ ] **Login as Sales Staff**
- [ ] **Navigate to**: `/sales/booking`
- [ ] **Create new booking**:
  ```
  Customer: นายสมชาย รักษ์ดี (select from created customers)
  Vehicle: Kubota M7040 (NSN)
  Quantity: 1
  Unit Price: 1,200,000 THB
  Discount: 50,000 THB (special promotion)
  Net Amount: 1,150,000 THB
  Payment Terms: 30% down, 70% financing
  ```

#### **Document Workflow Testing**:

- [ ] **Save as Draft**
- [ ] **Verify DocumentWorkflowWrapper**:
  - Stepper shows: บันทึกข้อมูล → ตรวจสอบ → อนุมัติ → เสร็จสิ้น
  - Status: `draft`
  - Geographic data auto-injected: `provinceId: NSN`, `branchCode: NSN001`
- [ ] **Submit for Review**

#### **Expected Results**:

- [ ] Document ID generated (BOOK-VEH-XXXX)
- [ ] Status: `draft` → `review`
- [ ] Audit trail created
- [ ] Geographic context properly set
- [ ] Available for next approval step

### **🔍 Step 3.2: Sales Lead Review (Safari - Incognito)**

#### **Review Process**

- [ ] **Login as Sales Lead**
- [ ] **Navigate to review queue**
- [ ] **Find the booking document**
- [ ] **Review details**:
  - Customer information correct
  - Vehicle availability confirmed
  - Pricing within guidelines
  - Geographic context verified
- [ ] **Add review comments**
- [ ] **Approve for manager review**

#### **Expected Results**:

- [ ] Status: `review` → `price_review`
- [ ] Review comments added to audit trail
- [ ] Document available for manager approval

### **✅ Step 3.3: Sales Manager Approval (Firefox)**

#### **Final Approval**

- [ ] **Login as Sales Manager**
- [ ] **Navigate to approval queue**
- [ ] **Review the document**:
  - Final pricing verification
  - Credit terms approval
  - Compliance check
- [ ] **Final approval**

#### **Expected Results**:

- [ ] Status: `price_review` → `approved` → `completed`
- [ ] Complete approval chain documented
- [ ] Document finalized and ready for fulfillment

### **🚗 Step 3.4: Convert to Sales Order (Edge/Brave - Sales Staff)**

#### **Create Actual Sales Order**

- [ ] **Navigate to**: `/sales/vehicles`
- [ ] **Reference the approved booking**
- [ ] **Create sales order**:
  - Link to booking document
  - Confirm vehicle allocation
  - Process payment
  - Generate sales documentation

#### **Expected Results**:

- [ ] Sales order created with booking reference
- [ ] Inventory updated (stock reduced)
- [ ] Complete document chain: Booking → Sales Order

---

## 📋 **PHASE 4: Cross-System Validation**

### **📊 Step 4.1: Report Verification (All Browsers)**

#### **Admin View (Chrome - Port 3030)**

- [ ] **Navigate to**: `/reports/sales/summary`
- [ ] **Verify complete data**:
  - Booking document visible
  - Sales order visible
  - All RBAC data present:
    - `createdBy`: Sales staff UID
    - `reviewedBy`: Sales lead UID
    - `approvedBy`: Sales manager UID
    - `provinceId`: NSN
    - `branchCode`: NSN001
    - Complete approval chain
  - Cross-province visibility (admin sees all)

#### **Sales Manager View (Firefox - Port 3031)**

- [ ] **Navigate to same reports**
- [ ] **Verify geographic filtering**:
  - Only NSN001 data visible
  - Cannot see other provinces/branches
  - Proper data isolation

#### **Sales Staff View (Edge/Brave - Port 3031)**

- [ ] **Navigate to reports**
- [ ] **Verify limited access**:
  - Can see own created documents
  - Limited reporting access
  - Proper permission restrictions

### **📈 Step 4.2: Inventory Impact Verification**

#### **Check Inventory Updates (Chrome - Admin)**

- [ ] **Navigate to**: `/inventory/stock-levels`
- [ ] **Verify stock changes**:
  - M7040 stock reduced by 1 unit
  - Transaction history shows sales allocation
  - Proper inventory tracking

### **🔍 Step 4.3: Audit Trail Verification**

#### **Complete Audit Trail Check (Chrome - Admin)**

- [ ] **Navigate to**: `/admin/audit-trail`
- [ ] **Search for the document chain**
- [ ] **Verify complete history**:
  - User creation and approval
  - Document creation
  - Each approval step
  - Status changes
  - Geographic context
  - User actions

---

## 📋 **PHASE 5: Edge Case & Error Testing**

### **🚫 Step 5.1: Permission Boundary Testing**

#### **Test Geographic Restrictions**

- [ ] **Sales Staff tries to access NMA data** (should fail)
- [ ] **Sales Staff tries to create document for different branch** (should fail)
- [ ] **Verify permission warnings display**

#### **Test Role Limitations**

- [ ] **Sales Staff tries to approve document** (should fail)
- [ ] **Sales Lead tries final approval** (should fail)
- [ ] **Verify proper error messages**

### **🔄 Step 5.2: Workflow Interruption Testing**

#### **Test Incomplete Workflows**

- [ ] **Create document but don't submit**
- [ ] **Reject document at review stage**
- [ ] **Test workflow recovery**

---

## 🎯 **SUCCESS CRITERIA MATRIX**

### **✅ Must Pass (Critical)**

| Test Area            | Requirement                               | Status |
| -------------------- | ----------------------------------------- | ------ |
| User Management      | Complete signup → approval → activation   | ⏳     |
| Inventory Setup      | NSN vehicle inventory created             | ⏳     |
| Document Creation    | Sales booking created with proper context | ⏳     |
| Approval Workflow    | Multi-role approval chain functions       | ⏳     |
| Data Integrity       | Complete audit trail captured             | ⏳     |
| Geographic Filtering | Branch-based data isolation               | ⏳     |
| Report Integration   | Documents appear in reports correctly     | ⏳     |
| Legacy Compatibility | All original fields preserved             | ⏳     |

### **⚠️ Should Pass (Important)**

| Test Area           | Requirement                    | Status |
| ------------------- | ------------------------------ | ------ |
| Performance         | <3 second page loads           | ⏳     |
| UX                  | Intuitive workflow progression | ⏳     |
| Error Handling      | Clear error messages           | ⏳     |
| Permission Warnings | Helpful guidance messages      | ⏳     |

### **💡 Nice to Have (Enhancement)**

| Test Area            | Requirement               | Status |
| -------------------- | ------------------------- | ------ |
| Real-time Updates    | Live status changes       | ⏳     |
| Mobile Compatibility | Responsive design         | ⏳     |
| Advanced Features    | Export, search, filtering | ⏳     |

---

## 🚀 **EXECUTION CHECKLIST**

### **Pre-Testing Setup**

- [ ] Start dual environments (`./start-dual-testing.sh`)
- [ ] Open all browsers (Chrome, Firefox, Safari, Edge/Brave)
- [ ] Clear all browser data/localStorage
- [ ] Enable developer tools in all browsers
- [ ] Prepare test data templates

### **During Testing**

- [ ] Monitor console for JavaScript errors
- [ ] Check network requests for API calls
- [ ] Document any unexpected behavior
- [ ] Take screenshots of key milestones
- [ ] Note performance observations

### **Post-Testing Validation**

- [ ] Verify all data in Firebase console
- [ ] Check audit trail completeness
- [ ] Validate report accuracy
- [ ] Confirm inventory updates
- [ ] Review system logs

---

## 🎉 **READY FOR LEGENDARY TESTING!**

**Boss, this is going to be EPIC!**

This comprehensive testing will prove that:

1. **✅ Complete system integration works flawlessly**
2. **✅ DocumentWorkflowWrapper replacement is seamless**
3. **✅ RBAC system functions perfectly**
4. **✅ Data integrity is maintained**
5. **✅ Multi-role workflows operate smoothly**
6. **✅ Geographic filtering works correctly**
7. **✅ Legacy compatibility is preserved**

**When this testing succeeds, we'll have irrefutable proof that the system is ready for "Show them what their data can do!" 🎉**

**Let's make this happen!** 💪
