# ☑️ Sunday Migration Checklist - Functions-Free Approach

## 📅 **Timeline: Sunday Migration Day**

**Total Time Estimate:** 2-3 hours  
**Optimal Window:** Sunday morning (low traffic)

---

## 🚀 **Phase 1: Pre-Migration Setup** _(15 minutes)_

### ☑️ **Step 1.1: Environment Verification**

```bash
# Verify you're in the right project
firebase projects:list
firebase use kubota-benjapol  # Use production Firebase project (KBN)

# Check current functions
firebase functions:list
```

### ☑️ **Step 1.2: Backup Current State**

```bash
# Backup functions configuration
firebase functions:config:get > functions-config-backup.json

# Backup current function list
firebase functions:list > functions-list-backup.txt

# Note: Firestore data is automatically backed up daily
```

### ☑️ **Step 1.3: Communication**

- [ ] Notify team of maintenance window
- [ ] Confirm no critical operations scheduled
- [ ] Have rollback plan ready

---

## 🔥 **Phase 2: Remove Cloud Functions** _(10 minutes)_

### ☑️ **Step 2.1: Remove Update Functions**

```bash
# Remove all onUpdate functions that could interfere
firebase functions:delete updateVehicleUnitPrice
firebase functions:delete onUpdateSaleVehicles
firebase functions:delete updateBookingOrderChange
firebase functions:delete updateTransferChange
firebase functions:delete updateSaleOutChange
firebase functions:delete updateOtherVehicleOutChange
firebase functions:delete updateDeliveryPlanChange
firebase functions:delete updateHRLeave

# Optional: Remove product update functions too
firebase functions:delete updateVehicleProductList
firebase functions:delete updatePartProductList
```

### ☑️ **Step 2.2: Verify Functions Removed**

```bash
# Confirm functions are gone
firebase functions:list

# Should show significantly fewer functions
```

---

## 📊 **Phase 3: Execute Migration** _(60-120 minutes)_

### ☑️ **Step 3.1: Start Development Server**

```bash
cd /Users/arsomjin/Documents/Projects/KBN/kbn
npm start
```

### ☑️ **Step 3.2: Access Migration Dashboard**

- Navigate to: `http://localhost:3000/developer/phase3-migration`
- Verify optimized settings shown (500 docs/page, 200 docs/batch)

### ☑️ **Step 3.3: Migration Strategy - Recommended Order**

**🏁 Round 1: Test with HR** _(5-10 minutes)_

- [ ] Select HR collections only (~100-1000 documents)
- [ ] Execute migration
- [ ] Validate results
- [ ] **Purpose:** Test the process with smallest dataset

**📊 Round 2: Accounting** _(15-20 minutes)_

- [ ] Select: Account Incomes, Account Expenses
- [ ] Execute migration (~2,000-5,000 documents)
- [ ] Validate financial data integrity
- [ ] **Purpose:** Secure business-critical data first

**🚗 Round 3: Sales** _(20-30 minutes)_

- [ ] Select: Vehicle Sales, Bookings, Assessments
- [ ] Execute migration (~5,000-10,000 documents)
- [ ] Validate customer and sales data
- [ ] **Purpose:** Core business operations

**📦 Round 4: Inventory** _(30-45 minutes)_

- [ ] Select: Stocks, Import Vehicles, Import Parts, Transfers
- [ ] Execute migration (~10,000-20,000 documents)
- [ ] Validate inventory tracking
- [ ] **Purpose:** Largest dataset, inventory management

**🔧 Round 5: Service** _(15-25 minutes)_

- [ ] Select: Service Orders, Service Close, Gas Cost
- [ ] Execute migration (~3,000-8,000 documents)
- [ ] Validate service records
- [ ] **Purpose:** Service department data

### ☑️ **Step 3.4: Progress Monitoring**

- [ ] Watch console for progress logs
- [ ] Monitor memory usage in browser
- [ ] Check for any error messages
- [ ] Use sample data preview between rounds

---

## ✅ **Phase 4: Validation** _(15 minutes)_

### ☑️ **Step 4.1: Run Migration Validation**

- [ ] Use "Validate Migration" button in dashboard
- [ ] Check that all documents have `provinceId`
- [ ] Verify branch-to-province mappings are correct

### ☑️ **Step 4.2: Sample Data Checks**

```bash
# Check a few collections manually in Firebase Console
# Verify provinceId field exists and has correct values:
# - nakhon-ratchasima (for branches 0450-0456, 1004, 0500)
# - nakhon-sawan (for branches NSN001-NSN003)
```

### ☑️ **Step 4.3: Document Progress**

- [ ] Take screenshots of completion status
- [ ] Note any collections that failed
- [ ] Record total documents migrated

---

## 🔄 **Phase 5: Re-deploy Cloud Functions** _(15 minutes)_

### ☑️ **Step 5.1: Deploy Functions**

```bash
cd functions
firebase deploy --only functions
```

### ☑️ **Step 5.2: Verify Deployment**

```bash
# Check all functions are back
firebase functions:list

# Monitor initial logs
firebase functions:log --limit 50
```

### ☑️ **Step 5.3: Test Key Functions**

```bash
# Create a test document update to verify functions work
# Check that notifications, stock updates, etc. are working
# Monitor logs for any errors
```

---

## 🎯 **Phase 6: Final Verification** _(10 minutes)_

### ☑️ **Step 6.1: End-to-End Testing**

- [ ] Test RBAC filtering with new `provinceId` data
- [ ] Verify geographic data filtering works
- [ ] Check sample business operations

### ☑️ **Step 6.2: Performance Check**

- [ ] Monitor system performance
- [ ] Check for any function errors
- [ ] Verify user experience is normal

### ☑️ **Step 6.3: Documentation**

- [ ] Update team on completion
- [ ] Document any issues encountered
- [ ] Mark Phase 3 as complete

---

## 🆘 **Emergency Rollback Plan**

### If Migration Fails:

```bash
# Use dashboard rollback function
# OR manually remove provinceId fields
```

### If Functions Fail to Deploy:

```bash
# Check functions/index.js for syntax errors
# Deploy individual functions:
firebase deploy --only functions:updateVehicleUnitPrice
firebase deploy --only functions:onUpdateSaleVehicles
# etc.
```

### If System Issues:

```bash
# Restore from daily backup if needed
# Contact development team
# Revert to previous stable state
```

---

## 📈 **Expected Results**

### ✅ **Success Metrics:**

- [ ] All collections show 100% documents with `provinceId`
- [ ] No function execution errors
- [ ] RBAC geographic filtering works
- [ ] System performance normal
- [ ] Total migrated: ~30,000-50,000 documents

### ⏱️ **Performance Gains:**

- **4x faster migration** (larger batches)
- **Zero function conflicts**
- **~60% cost savings** (no function executions)
- **Cleaner process** (no complex function modifications)

---

## 🎉 **Post-Migration**

### ☑️ **Monday Morning Checks:**

- [ ] Monitor user experience
- [ ] Check for any overnight errors
- [ ] Verify business operations normal
- [ ] Update stakeholders on success

**✨ Phase 3 Migration Complete! Multi-Province RBAC is now fully operational! ✨**
