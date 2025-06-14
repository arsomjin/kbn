# 🚀 **DUAL ENVIRONMENT TESTING SETUP**

## 🎯 **Testing Strategy: Complete User Journey Validation**

### **Environment Configuration**

- **Port 3030**: Admin/Dev Environment (Super Admin access)
- **Port 3031**: Sales Staff Environment (NSN001 branch)

---

## 📋 **Step-by-Step Testing Protocol**

### **Phase 1: Environment Setup**

#### **Terminal 1 (Admin Environment - Port 3030)**

```bash
cd /Users/arsomjin/Documents/Projects/KBN/kbn
PORT=3030 npm start
```

#### **Terminal 2 (Sales Environment - Port 3031)**

```bash
cd /Users/arsomjin/Documents/Projects/KBN/kbn
PORT=3031 npm start
```

### **Phase 2: User Management Flow**

#### **Step 1: Sales Staff Sign-up (Port 3031)**

- [ ] **Navigate to**: `http://localhost:3031`
- [ ] **Sign up new user**:
  - Email: `sales.staff.nsn001@kbn.test`
  - Name: `นายขายดี สาขาตาคลี`
  - Requested Role: `SALES_STAFF`
  - Requested Province: `นครสวรรค์ (NSN)`
  - Requested Branch: `NSN001 - สาขาตาคลี`
- [ ] **Expected Result**: User pending approval status

#### **Step 2: Admin Approval (Port 3030)**

- [ ] **Navigate to**: `http://localhost:3030`
- [ ] **Login as Admin/Dev**
- [ ] **Go to**: `/admin/user-approval`
- [ ] **Approve the pending user**:
  - Confirm role: `SALES_STAFF`
  - Confirm geographic access: `NSN001`
  - Set permissions: `sales.edit`, `sales.view`
- [ ] **Expected Result**: User approved and active

### **Phase 3: Document Creation & Approval Flow**

#### **Step 3: Sales Staff Creates Sales Order (Port 3031)**

- [ ] **Login as approved sales staff**
- [ ] **Navigate to**: `/sales/booking` or `/sales/vehicles`
- [ ] **Create new sales order**:
  - Customer: Test customer data
  - Vehicle: Select from available inventory
  - Branch context: Should auto-inject NSN001
  - Amount: Test amount (e.g., 1,200,000 THB)
- [ ] **Save as Draft**
- [ ] **Expected Results**:
  - Document ID generated
  - Status: `draft`
  - Audit trail created
  - Geographic data: `provinceId: NSN`, `branchCode: NSN001`

#### **Step 4: Sales Lead Review (Port 3031 - Role Switch)**

- [ ] **Switch role to Sales Lead** (same browser, different tab or role selector)
- [ ] **Navigate to sales review queue**
- [ ] **Review the created order**:
  - Verify all data is correct
  - Check geographic context
  - Add review comments if needed
- [ ] **Approve for next step**
- [ ] **Expected Results**:
  - Status: `review` → `price_review`
  - Audit trail updated
  - Next approval step activated

#### **Step 5: Sales Manager Approval (Port 3031 - Role Switch)**

- [ ] **Switch role to Sales Manager**
- [ ] **Navigate to manager approval queue**
- [ ] **Final approval**:
  - Review pricing and terms
  - Verify compliance
  - Final approval
- [ ] **Expected Results**:
  - Status: `approved` → `completed`
  - Document finalized
  - Ready for reporting

### **Phase 4: Data Integrity Validation**

#### **Step 6: Report Verification (Both Environments)**

##### **Admin View (Port 3030)**

- [ ] **Navigate to**: `/reports/sales/summary`
- [ ] **Verify the sales order appears**:
  - All legacy data fields present
  - RBAC data included:
    - `createdBy`: Sales staff UID
    - `approvedBy`: Manager UID
    - `provinceId`: NSN
    - `branchCode`: NSN001
    - `approvalChain`: Complete audit trail
  - Geographic filtering works
  - Cross-province visibility (admin can see all)

##### **Sales Staff View (Port 3031)**

- [ ] **Navigate to same report**
- [ ] **Verify geographic filtering**:
  - Only NSN001 data visible
  - Cannot see other branches
  - Permission-based field access
  - Proper data isolation

---

## 🔍 **Critical Success Criteria**

### **✅ Must Pass**

1. **User approval workflow functions correctly**
2. **Role-based permissions enforced properly**
3. **Document approval flow works end-to-end**
4. **Geographic data injection automatic and correct**
5. **Audit trail captures every step**
6. **Reports show complete data with RBAC enhancement**
7. **Data isolation between branches works**

### **⚠️ Should Pass**

1. **Smooth role switching**
2. **Real-time status updates**
3. **Permission warnings display appropriately**
4. **No JavaScript console errors**
5. **Responsive design on both environments**

### **💡 Nice to Have**

1. **Real-time notifications between environments**
2. **Advanced filtering and search**
3. **Export functionality**
4. **Mobile compatibility**

---

## 🐛 **Common Issues & Solutions**

### **Port Conflicts**

```bash
# If ports are busy, kill existing processes
lsof -ti:3030 | xargs kill -9
lsof -ti:3031 | xargs kill -9
```

### **Firebase Auth Issues**

- Use different browsers or incognito modes for different roles
- Clear localStorage between role switches
- Ensure Firebase project supports multiple concurrent sessions

### **Role Switching**

- Implement role selector in development mode
- Use different user accounts for different roles
- Clear Redux state when switching roles

---

## 📊 **Data Validation Checklist**

### **Legacy System Compatibility**

- [ ] All original fields preserved
- [ ] Data types match exactly
- [ ] Calculations remain identical
- [ ] Report formats unchanged

### **RBAC Enhancement**

- [ ] User identification fields added
- [ ] Geographic context included
- [ ] Approval chain documented
- [ ] Permission levels respected

### **Integration Points**

- [ ] DocumentWorkflowWrapper functions correctly
- [ ] LayoutWithRBAC replacement seamless
- [ ] Audit trail integration complete
- [ ] Permission warning system active

---

## 🎯 **Success Metrics**

### **Quantitative**

- **0 JavaScript errors** in console
- **100% data field compatibility** with legacy
- **<3 second** page load times
- **Complete audit trail** for every action

### **Qualitative**

- **Intuitive user experience** across roles
- **Clear status communication** at each step
- **Obvious next actions** for users
- **Professional appearance** and behavior

---

## 🚀 **Ready to Execute**

**Your roadmap is excellent!** This testing approach will validate:

1. **Complete system integration**
2. **Multi-role workflow functionality**
3. **Data integrity and compatibility**
4. **Geographic access control**
5. **Reporting system integration**

**Go ahead and start the dual environment testing!**

I'll be here to help troubleshoot any issues you encounter during the testing process.

---

**Status**: 🎯 **READY FOR DUAL ENVIRONMENT TESTING**
**Next**: Start both environments and begin the user journey!
