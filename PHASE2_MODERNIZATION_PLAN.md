# Phase 2 Comprehensive Library Modernization Plan

## KBN Multi-Province RBAC Integration & Modernization

**Goal**: Modernize all outdated libraries while preserving functionality and integrating RBAC system.

---

## **PRIORITY ORDER** (Critical Path)

### **🔥 STEP 1: Firebase Modular SDK Migration (FOUNDATION)**

**Priority**: CRITICAL FIRST - Everything depends on this
**Impact**: 80+ files, entire data layer
**Risk**: HIGH - Breaking changes across auth, firestore, messaging

#### **Current State Analysis:**

```javascript
// Current Firebase v7.19.1 (Traditional SDK)
import app from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/database";
import "firebase/storage";
import "firebase/messaging";

// Usage Pattern:
app.firestore().collection("data");
app.messaging().getToken();
```

#### **Target Firebase v10+ (Modular SDK):**

```javascript
// New Firebase v10+ (Modular SDK)
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

// Usage Pattern:
const db = getFirestore(app);
collection(db, "data");
```

#### **Migration Steps:**

1. **Install Firebase v10**

   ```bash
   npm install firebase@^10.7.1
   ```

2. **Update firebaseConfig.js**

   - Migrate initialization

3. **Update firebase/index.js**

   - Convert to modular imports
   - Update Firebase context provider

4. **Update firebase/api.js**

   - Convert all Firestore methods
   - Update messaging, auth, storage

5. **Update all consuming components**
   - 80+ files need Firebase import updates

---

### **🎯 STEP 2: Core UI Library Replacement**

#### **2A: Shards React → Ant Design**

**Files**: ~15-20 components
**Priority**: HIGH - Remove completely

```javascript
// Remove:
import { Card, Button, Form } from "shards-react";

// Replace with:
import { Card, Button, Form } from "antd";
```

#### **2B: Material-UI → Ant Design**

**Files**: ~25-30 components  
**Priority**: HIGH - Remove completely

```javascript
// Remove:
import { Button, Typography, Paper } from "@material-ui/core";

// Replace with:
import { Button, Typography, Card } from "antd";
```

#### **2C: React Table → Ant Design Table**

**Files**: ~20-25 data tables
**Priority**: HIGH - Better performance + RBAC integration

```javascript
// Remove:
import ReactTable from "react-table-6";

// Replace with:
import { Table } from "antd";
// + Add RBAC filtering integration
```

---

### **🔧 STEP 3: Form & Input Libraries**

#### **3A: Formik → Ant Design Form**

**Files**: ~30-40 forms
**Priority**: MEDIUM-HIGH

```javascript
// Remove:
import { Formik, Form, Field } from "formik";

// Replace with:
import { Form, Input, Button } from "antd";
const [form] = Form.useForm();
```

#### **3B: React Select → Ant Design Select**

**Files**: ~20-25 selectors
**Priority**: MEDIUM

```javascript
// Remove:
import Select from "react-select";

// Replace with:
import { Select } from "antd";
// + Add RBAC province/branch filtering
```

---

### **📊 STEP 4: Charts & Visualization**

#### **Chart.js → Ant Design Charts**

**Files**: ~10-15 chart components
**Priority**: MEDIUM

```javascript
// Remove:
import { Line, Bar } from "react-chartjs-2";

// Replace with:
import { Line, Column } from "@ant-design/charts";
```

---

### **🧹 STEP 5: Cleanup & Optimization**

#### **Remove Unused Dependencies**

```bash
# Remove completely:
npm uninstall shards-react
npm uninstall @material-ui/core @material-ui/icons @material-ui/lab
npm uninstall react-table-6
npm uninstall formik
npm uninstall react-select
npm uninstall chart.js react-chartjs-2
npm uninstall bootstrap
```

#### **Add New Dependencies**

```bash
# Add modern equivalents:
npm install @ant-design/charts
npm install @ant-design/pro-components  # Optional: Advanced components
```

---

## **EXECUTION STRATEGY**

### **Week 1-2: Firebase Foundation**

- [ ] Firebase v10 modular SDK migration
- [ ] Update all Firebase imports and usage
- [ ] Test auth, firestore, messaging functionality
- [ ] RBAC system compatibility verification

### **Week 3-4: Core UI Migration**

- [ ] Replace Shards React components
- [ ] Replace Material-UI components
- [ ] Update styling and themes

### **Week 5-6: Data Tables**

- [ ] React Table → Ant Design Table
- [ ] Integrate RBAC geographic filtering
- [ ] Test data operations

### **Week 7-8: Forms & Inputs**

- [ ] Formik → Ant Design Form
- [ ] React Select → Ant Design Select
- [ ] RBAC permission integration

### **Week 9-10: Charts & Final Cleanup**

- [ ] Charts migration
- [ ] Remove unused dependencies
- [ ] Performance testing
- [ ] Bug fixes and optimization

---

## **RISK MITIGATION**

### **High Risk Components** (Extra Testing)

1. **Firebase Auth Integration** - Core login functionality
2. **Data Tables with Filtering** - Business critical reports
3. **Form Validations** - Data integrity
4. **RBAC Integration** - Security critical

### **Testing Strategy**

1. **Component-by-component testing** during migration
2. **Integration testing** after each step
3. **User acceptance testing** before deployment
4. **Rollback plan** for each major change

### **Backup Strategy**

- [ ] Create feature branches for each migration step
- [ ] Keep original components until replacement is verified
- [ ] Document all breaking changes

---

## **SUCCESS METRICS**

### **Performance Goals**

- [ ] Bundle size reduction: 30-40%
- [ ] Load time improvement: 20-30%
- [ ] Remove OpenSSL legacy provider flags

### **Code Quality Goals**

- [ ] Single design system (Ant Design only)
- [ ] Modern React patterns
- [ ] Improved TypeScript compatibility
- [ ] Better accessibility

### **Business Goals**

- [ ] All existing functionality preserved
- [ ] RBAC fully integrated
- [ ] User experience improved
- [ ] System maintainability enhanced

---

**Phase 1**: ✅ **COMPLETE** - Multi-Province RBAC Infrastructure  
**Phase 2**: 🚀 **IN PROGRESS** - Comprehensive Library Modernization  
**Next**: Phase 3 - React 18 + react-scripts 5.x upgrades
