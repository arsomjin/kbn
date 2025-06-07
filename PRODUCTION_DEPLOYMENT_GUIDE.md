# KBN Production Database Switch Guide

## 🎯 Overview

Complete guide for switching from test database to production database for KBN Multi-Province implementation.

---

## 📋 Pre-Switch Checklist

### **1. Environment Configuration**

Create environment files for different deployment stages:

**`.env.test` (Current Test Environment):**

```bash
# Test Database Configuration
REACT_APP_FIREBASE_API_KEY=your_test_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-test-project.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://your-test-project-default-rtdb.firebaseio.com/
REACT_APP_FIREBASE_PROJECT_ID=your-test-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-test-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
REACT_APP_FIREBASE_MEASUREMENT_ID=G-ABCDEFGH
REACT_APP_FIREBASE_VAPID_KEY=your_vapid_key
```

**`.env.production` (Production Environment):**

```bash
# Production Database Configuration
REACT_APP_FIREBASE_API_KEY=your_production_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=kubota-benjapol.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://kubota-benjapol-default-rtdb.firebaseio.com/
REACT_APP_FIREBASE_PROJECT_ID=kubota-benjapol
REACT_APP_FIREBASE_STORAGE_BUCKET=kubota-benjapole.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=production_sender_id
REACT_APP_FIREBASE_APP_ID=production_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=production_measurement_id
REACT_APP_FIREBASE_VAPID_KEY=production_vapid_key
```

### **2. Backup Strategy**

**Critical: Complete Before Any Production Changes**

```bash
# 1. Export Firestore Data
firebase use kubota-benjapol
firebase firestore:backup --path=/backups/pre-migration-$(date +%Y%m%d-%H%M%S)

# 2. Export Realtime Database
firebase database:backup --output=backup-$(date +%Y%m%d-%H%M%S).json

# 3. Verify Backup Integrity
# Test restore on a separate test project to verify backup completeness
```

### **3. Rollback Plan Preparation**

**Option A: Database Restore**

```bash
# Restore from backup if migration fails
firebase firestore:restore --backup-path=/backups/pre-migration-YYYYMMDD-HHMMSS
firebase database:restore backup-YYYYMMDD-HHMMSS.json
```

**Option B: Quick Revert (Preferred)**

```bash
# Remove added provinces/branches only
# Keep existing data intact - safer approach
```

---

## 🚀 Production Switch Day Process

### **Phase 1: Pre-Switch Validation (30 minutes)**

1. **Run Final Test Migration**

   ```bash
   # On test database - final validation
   npm run dev
   # Navigate to /developer/test-multi-province
   # Run "Production Readiness Check"
   # Ensure all checks pass: ✅✅✅✅
   ```

2. **Verify Current Production State**
   ```javascript
   // Console commands to verify production data
   KBN_MIGRATION.getDatabaseInfo();
   // Should show: kubota-benjapol, production environment
   ```

### **Phase 2: Environment Switch (10 minutes)**

1. **Update Environment Variables**

   ```bash
   # Copy production environment variables
   cp .env.production .env

   # OR update deployment configuration
   # For Vercel/Netlify: Update environment variables in dashboard
   # For server deployment: Update environment files
   ```

2. **Verify Connection**
   ```bash
   npm start
   # Check console log: "🔥 Connected to Firebase Project: kubota-benjapol"
   # Navigate to dashboard - should show "PRODUCTION" badge
   ```

### **Phase 3: Production Migration (20 minutes)**

1. **Access Migration Dashboard**

   ```
   Navigate to: /developer/test-multi-province
   ```

2. **Production Safety Checks**

   - ✅ Red "PRODUCTION" badge visible
   - ✅ Production warning alerts displayed
   - ✅ Backup verification confirmed

3. **Execute Migration**
   ```
   1. Click "Run Readiness Check"
   2. Confirm all requirements (backup, rollback plan)
   3. Click "🔴 Execute Production Migration"
   4. Double confirmation required:
      - Confirm dialog box
      - Type "MIGRATE PRODUCTION"
   5. Monitor logs for success/failure
   ```

### **Phase 4: Post-Migration Verification (30 minutes)**

1. **Data Verification**

   ```javascript
   // Console verification commands
   firebase.firestore.collection("data/company/provinces").get();
   firebase.firestore.collection("data/company/branches").get();

   // Should see:
   // - nakhon-ratchasima (existing)
   // - nakhon-sawan (new)
   // - 3 new branches: NSN001, NSN002, NSN003
   ```

2. **System Testing**

   ```
   ✅ Login with different user roles
   ✅ Test province selection dropdown
   ✅ Test branch filtering by province
   ✅ Test RBAC geographic restrictions
   ✅ Test data loading and display
   ```

3. **User Access Testing**
   ```
   ✅ SUPER_ADMIN: Can see all provinces/branches
   ✅ PROVINCE_MANAGER: Can only see assigned province
   ✅ BRANCH_MANAGER: Can only see assigned branches
   ✅ BRANCH_STAFF: Can only see assigned branch
   ```

---

## 🔧 Technical Implementation Details

### **Migration Data Structure**

```javascript
// What gets created in production:
Province: {
  key: "nakhon-sawan",
  name: "นครสวรรค์",
  code: "NSN",
  region: "central",
  status: "active"
}

Branches: [
  { branchCode: "NSN001", branchName: "นครสวรรค์", provinceId: "nakhon-sawan" },
  { branchCode: "NSN002", branchName: "ตาคลี", provinceId: "nakhon-sawan" },
  { branchCode: "NSN003", branchName: "หนองบัว", provinceId: "nakhon-sawan" }
]
```

### **Safety Features Active in Production**

- ✅ Explicit double-confirmation required
- ✅ Smaller batch sizes (10 vs 100)
- ✅ Enhanced error logging
- ✅ Environment validation
- ✅ Rollback guidance on failure

---

## 🚨 Emergency Procedures

### **If Migration Fails**

```bash
# Immediate actions:
1. Note the exact error message
2. Check Firestore for partial data creation
3. Do NOT retry immediately

# Recovery options:
Option 1: Manual cleanup of partial data
Option 2: Full database restore from backup (LAST RESORT)
```

### **If System Issues Post-Migration**

```bash
# Quick revert to test database:
1. cp .env.test .env
2. npm restart
3. Verify connection to test database
4. Investigate issues safely
```

---

## 📊 Success Criteria

**Migration Successful When:**

- ✅ No errors during migration execution
- ✅ Nakhon Sawan province created in Firestore
- ✅ 3 new branches created with correct provinceId references
- ✅ Existing data unchanged (Nakhon Ratchasima branches intact)
- ✅ Province/branch selectors working correctly
- ✅ RBAC system filtering correctly by geography
- ✅ All user roles can access appropriate data

**System Ready for Users When:**

- ✅ All testing scenarios pass
- ✅ Performance normal (no slow queries)
- ✅ No console errors
- ✅ Mobile responsiveness maintained
- ✅ All user workflows functional

---

## 🗓️ Recommended Timeline

**Total Time: ~2 hours**

| Phase                   | Duration | Activities                        |
| ----------------------- | -------- | --------------------------------- |
| Pre-Switch Validation   | 30 min   | Final tests, backup verification  |
| Environment Switch      | 10 min   | Update configs, verify connection |
| Production Migration    | 20 min   | Execute migration, monitor logs   |
| Post-Migration Testing  | 30 min   | Data verification, system testing |
| User Acceptance Testing | 30 min   | End-to-end workflow validation    |

**Best Time to Execute:**

- Off-peak hours (early morning/late evening)
- When technical team is available
- When rollback can be executed if needed

---

## 🛠️ Tools Available

**Console Commands:**

```javascript
// Available in browser console during development
KBN_MIGRATION.getDatabaseInfo(); // Check current environment
KBN_MIGRATION.validateProductionSwitch(); // Validate production readiness
KBN_MIGRATION.validatePreProductionReadiness(); // Run full readiness check
KBN_MIGRATION.executePhase1Migration(); // Execute migration (with safety checks)
```

**Dashboard Tools:**

- Production readiness checker
- Environment status display
- Migration execution with confirmations
- Real-time logging
- Success/failure validation

---

**🎯 Ready for Production Switch!**

Your system is well-prepared with comprehensive safety checks, rollback procedures, and validation tools. The migration has been thoroughly tested and is ready for production deployment.
