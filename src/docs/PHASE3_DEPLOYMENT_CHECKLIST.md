# Phase 3 Production Deployment Checklist

## 🎯 **Critical Migration: Add ProvinceId to Existing Data**

This checklist ensures successful deployment of Phase 3 migration that adds `provinceId` to all existing data, enabling automatic geographic filtering for historical records.

---

## 📋 **Pre-Deployment Checklist**

### ✅ **1. Environment Preparation**

- [ ] **Database Backup**: Complete backup of production database
- [ ] **Code Deployment**: Latest code with Phase 3 migration tools deployed
- [ ] **Environment Variables**: Verify Firebase configuration is correct
- [ ] **Access Permissions**: Ensure deployment user has database write permissions

### ✅ **2. System Verification**

- [ ] **Phase 1 Migration**: Verify RBAC infrastructure is deployed
- [ ] **Phase 2 Integration**: Verify bug fixes and integrations are working
- [ ] **Automatic ProvinceId**: Test system works with new data (creates provinceId automatically)
- [ ] **Geographic Filtering**: Verify filtering works with test data

### ✅ **3. Migration Tools Ready**

- [ ] **Migration Script**: `src/utils/migration/phase3ProvinceIdMigration.js` deployed
- [ ] **Dashboard**: `src/dev/screens/Phase3MigrationDashboard.js` accessible
- [ ] **CLI Tool**: `src/utils/migration/executePhase3Production.js` ready
- [ ] **Validation**: Test migration tools in staging environment

---

## 🚀 **Deployment Execution**

### **Option A: Dashboard Interface (Recommended)**

1. **Access Migration Dashboard**

   ```
   https://your-domain.com/dev/phase3-migration
   ```

2. **Execute Migration**

   - Click "Execute Phase 3 Migration"
   - Confirm backup is complete
   - Monitor progress in real-time
   - Verify completion status

3. **Validate Results**
   - Click "Validate Migration"
   - Ensure all collections show 100% completion
   - Verify no documents are missing provinceId

### **Option B: Command Line (Automated)**

1. **Pre-Migration Check**

   ```bash
   node src/utils/migration/executePhase3Production.js check
   ```

2. **Execute Migration**

   ```bash
   SKIP_CONFIRMATION=true NODE_ENV=production \
   node src/utils/migration/executePhase3Production.js migrate
   ```

3. **Validate Results**
   ```bash
   node src/utils/migration/executePhase3Production.js validate
   ```

---

## 📊 **Collections Being Migrated**

| Collection              | Path                           | Expected Records |
| ----------------------- | ------------------------------ | ---------------- |
| **Vehicle Sales**       | `sections/sales/vehicles`      | ~X,XXX records   |
| **Vehicle Bookings**    | `sections/sales/bookings`      | ~X,XXX records   |
| **Income Records**      | `sections/account/incomes`     | ~X,XXX records   |
| **Expense Records**     | `sections/account/expenses`    | ~X,XXX records   |
| **Income Items**        | `sections/account/incomeItems` | ~X,XXX records   |
| **Service Orders**      | `sections/service/orders`      | ~X,XXX records   |
| **Service Parts**       | `sections/service/parts`       | ~X,XXX records   |
| **Vehicle Inventory**   | `sections/warehouses/vehicles` | ~X,XXX records   |
| **Parts Inventory**     | `sections/warehouses/parts`    | ~X,XXX records   |
| **Customers**           | `sections/customers/customers` | ~X,XXX records   |
| **Credit Applications** | `sections/credit/applications` | ~X,XXX records   |
| **Employees**           | `sections/hr/employees`        | ~X,XXX records   |

---

## 🔍 **Post-Migration Verification**

### ✅ **1. Data Integrity Checks**

- [ ] **ProvinceId Presence**: All records have `provinceId` field
- [ ] **Province Mapping** (Based on Real KBN Branch Data):
  - **Nakhon Ratchasima**: `0450, 0451, 0452, 1004, 0500` → `provinceId: "nakhon-ratchasima"`
  - **Nakhon Sawan**: `NSN001, NSN002, NSN003` → `provinceId: "nakhon-sawan"`
  - **Legacy codes**: `NMA002, NMA003` → `provinceId: "nakhon-ratchasima"` (if present)
  - **Warehouse**: `1003` → `provinceId: "nakhon-ratchasima"` (mapped to main province)
- [ ] **Audit Fields**: Records have `migratedAt` and `migratedBy` fields
- [ ] **No Data Loss**: Original data remains unchanged

### ✅ **2. System Functionality Tests**

- [ ] **Geographic Filtering**: Users only see data from their province
- [ ] **Search Functionality**: Search returns results filtered by province
- [ ] **Data Submission**: New records automatically get provinceId
- [ ] **RBAC Security**: Cross-province access is properly blocked

### ✅ **3. User Experience Tests**

- [ ] **Nakhon Ratchasima Users**: Can access historical data from branches `0450, 0451, 0452, 1004, 0500` (+ legacy NMA002, NMA003)
- [ ] **Nakhon Sawan Users**: Can access data only from branches `NSN001, NSN002, NSN003`
- [ ] **Search Performance**: No significant performance degradation
- [ ] **UI Responsiveness**: All screens load normally

---

## ⚠️ **Rollback Procedure**

If issues are discovered post-migration:

### **Emergency Rollback**

```bash
# Dashboard
https://your-domain.com/dev/phase3-migration → "Rollback Migration"

# Command Line
node src/utils/migration/executePhase3Production.js rollback
```

### **Rollback Verification**

- [ ] **ProvinceId Removed**: `provinceId` fields deleted from migrated records
- [ ] **System Functionality**: Automatic provinceId injection still works for new data
- [ ] **No Data Loss**: All original data intact

---

## 📈 **Success Metrics**

### **Migration Success Criteria**

- ✅ **100% Collection Coverage**: All 12 collections migrated successfully
- ✅ **Zero Data Loss**: No original data modified or lost
- ✅ **Complete ProvinceId Coverage**: All existing records have provinceId
- ✅ **Functional Geographic Filtering**: Province-based data access working

### **Performance Benchmarks**

- ✅ **Migration Time**: Completed within expected timeframe
- ✅ **System Downtime**: Minimal or zero downtime during migration
- ✅ **Query Performance**: No significant performance impact
- ✅ **User Experience**: Seamless transition for end users

---

## 🎉 **Deployment Completion**

### **Final Steps**

- [ ] **Migration Log**: Save migration results to `migrations/phase3-provinceId` collection
- [ ] **Documentation**: Update deployment documentation
- [ ] **Team Notification**: Inform stakeholders of successful completion
- [ ] **Monitoring**: Monitor system for 24-48 hours post-deployment

### **Go-Live Confirmation**

- [ ] **System Status**: All systems operational
- [ ] **User Access**: All users can access their province-specific data
- [ ] **Data Security**: Geographic filtering working correctly
- [ ] **Ready for Multi-Province Operations**: System ready for expansion

---

## 📞 **Support & Contacts**

### **Technical Support**

- **Primary Contact**: [Your Development Team]
- **Database Admin**: [DBA Contact]
- **System Administrator**: [SysAdmin Contact]

### **Emergency Procedures**

- **Rollback Decision**: [Decision Maker Contact]
- **User Communication**: [Communications Team]
- **Business Continuity**: [Business Team Contact]

---

**🎯 Success Indicator**: When users can search for historical data and only see records from their assigned province, Phase 3 migration is complete and the multi-province RBAC system is fully operational!
