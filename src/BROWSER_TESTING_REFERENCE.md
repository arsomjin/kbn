# 🌐 **MULTI-BROWSER TESTING REFERENCE CARD**

## 🎯 **Quick Reference for Role-Based Testing**

### **Browser Assignment Matrix**

| Browser                  | Port | Role          | User Account                  | Access Level           | Purpose                 |
| ------------------------ | ---- | ------------- | ----------------------------- | ---------------------- | ----------------------- |
| **Chrome**               | 3030 | Super Admin   | admin@kbn.dev                 | All provinces/branches | System admin, oversight |
| **Firefox**              | 3031 | Sales Manager | sales.manager.nsn001@kbn.test | NSN001 only            | Final approvals         |
| **Safari** (Incognito)   | 3031 | Sales Lead    | sales.lead.nsn001@kbn.test    | NSN001 only            | Review, price check     |
| **Edge/Brave** (Private) | 3031 | Sales Staff   | sales.staff.nsn001@kbn.test   | NSN001 only            | Document creation       |

---

## 🔗 **Quick Access URLs**

### **Admin Environment (Port 3030)**

- **Main**: `http://localhost:3030`
- **User Approval**: `http://localhost:3030/admin/user-approval`
- **Inventory Setup**: `http://localhost:3030/admin/inventory/vehicle-list`
- **Customer Management**: `http://localhost:3030/admin/customers`
- **Reports (All Data)**: `http://localhost:3030/reports/sales/summary`
- **Audit Trail**: `http://localhost:3030/admin/audit-trail`

### **Sales Environment (Port 3031)**

- **Main**: `http://localhost:3031`
- **Sales Booking**: `http://localhost:3031/sales/booking`
- **Sales Vehicles**: `http://localhost:3031/sales/vehicles`
- **Reports (Filtered)**: `http://localhost:3031/reports/sales/summary`
- **Review Queue**: `http://localhost:3031/sales/review-queue`
- **Approval Queue**: `http://localhost:3031/sales/approval-queue`

---

## 📋 **Testing Workflow Checklist**

### **Phase 0: Data Setup (Chrome - Admin)**

- [ ] Create NSN vehicle inventory
- [ ] Test inventory import workflow
- [ ] Create test customers for NSN001
- [ ] Verify geographic context

### **Phase 1: User Management**

- [ ] **Edge/Brave**: Create Sales Staff account
- [ ] **Safari**: Create Sales Lead account
- [ ] **Firefox**: Create Sales Manager account
- [ ] **Chrome**: Approve all accounts

### **Phase 2: Document Workflow**

- [ ] **Edge/Brave**: Create sales booking
- [ ] **Safari**: Review and approve
- [ ] **Firefox**: Final manager approval
- [ ] **Edge/Brave**: Convert to sales order

### **Phase 3: Validation**

- [ ] **Chrome**: Verify admin reports (all data)
- [ ] **Firefox**: Verify manager reports (filtered)
- [ ] **Edge/Brave**: Verify staff reports (limited)
- [ ] **All**: Check audit trails

---

## 🔍 **Key Things to Monitor**

### **In Each Browser's Console**

- [ ] No JavaScript errors
- [ ] Proper API calls
- [ ] Correct data loading
- [ ] Geographic filtering working

### **Network Tab**

- [ ] API responses include proper RBAC data
- [ ] Geographic filtering in requests
- [ ] Audit trail API calls
- [ ] Permission checks

### **Application State**

- [ ] User role properly set
- [ ] Geographic context correct
- [ ] Permission gates working
- [ ] Status updates in real-time

---

## 🚨 **Common Issues & Quick Fixes**

### **Browser Session Conflicts**

```bash
# Clear browser data between role switches
# Use incognito/private modes
# Different browsers for different roles
```

### **Port Conflicts**

```bash
# Kill existing processes
lsof -ti:3030 | xargs kill -9
lsof -ti:3031 | xargs kill -9
```

### **Firebase Auth Issues**

```bash
# Clear localStorage in browser console
localStorage.clear();
sessionStorage.clear();
```

---

## 📊 **Success Indicators**

### **✅ Green Lights**

- User approval workflow smooth
- Document creation with auto-context
- Multi-step approval chain works
- Reports show filtered data correctly
- Audit trail captures everything
- No console errors

### **🚨 Red Flags**

- JavaScript errors in console
- Missing geographic context
- Permission gates not working
- Data leaking between branches
- Approval workflow stuck
- Reports showing wrong data

---

## 🎯 **Testing Completion Criteria**

### **Must Complete Successfully**

1. **Complete user journey**: Sign-up → Approval → Document Creation → Multi-role Approval → Reporting
2. **Data integrity**: All legacy fields + RBAC enhancement
3. **Geographic isolation**: Branch-specific data filtering
4. **Permission enforcement**: Role-based access control
5. **Audit compliance**: Complete action tracking

### **Success Metrics**

- **0 JavaScript errors** across all browsers
- **100% workflow completion** rate
- **Complete audit trail** for every action
- **Proper data isolation** between branches
- **Legacy compatibility** maintained

---

## 🚀 **Ready to Execute!**

**This testing strategy is BRILLIANT!**

You're about to validate:

- **Complete system integration**
- **Multi-role workflow functionality**
- **Data integrity and compatibility**
- **Geographic access control**
- **Production readiness**

**Let's make this legendary test happen!** 💪

---

**Quick Start**: `./start-dual-testing.sh` then open all browsers and begin Phase 0!
