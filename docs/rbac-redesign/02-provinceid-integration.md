# KBN Clean Slate RBAC Redesign - ProvinceId Integration

**Project**: KBN Multi-Province RBAC System  
**Document**: 02 - ProvinceId Integration  
**Created**: December 2024  
**Purpose**: Comprehensive guide for integrating provinceId across all business operations

---

## 🎯 **OVERVIEW**

ProvinceId integration ensures that all business data is properly tagged with geographic identifiers for multi-province operations. This enables proper data filtering, reporting, and access control across the Nakhon Ratchasima and Nakhon Sawan provinces.

---

## 🗺️ **PROVINCE STRUCTURE**

### **Province Mapping**

```javascript
const PROVINCES = {
  นครราชสีมา: {
    id: "นครราชสีมา",
    name: "นครราชสีมา",
    nameEn: "Nakhon Ratchasima",
    code: "NMA",
    branches: ["0450", "0451", "0452", "0453", "0454", "0455", "0456", "0500"],
  },
  นครสวรรค์: {
    id: "นครสวรรค์",
    name: "นครสวรรค์",
    nameEn: "Nakhon Sawan",
    code: "NSN",
    branches: ["NSN001", "NSN002", "NSN003"],
  },
};
```

### **Branch to Province Mapping**

```javascript
const BRANCH_TO_PROVINCE = {
  "0450": "นครราชสีมา",
  "0451": "บัวใหญ่",
  "0452": "จักราช",
  "0453": "สีดา",
  "0454": "โคกกรวด",
  "0455": "หนองบุญมาก",
};
```

---

## 🔗 **INTEGRATION PATTERNS**

### **1. Automatic ProvinceId Injection**

#### LayoutWithRBAC Enhancement

```javascript
<LayoutWithRBAC
  permission="accounting.view"
  title="Income Daily"
  requireBranchSelection={true}
  autoInjectProvinceId={true} // 🔑 Key setting
  showAuditTrail={true}
>
  <ComponentContent />
</LayoutWithRBAC>
```

#### Geographic Context Enhancement

```javascript
const ComponentContent = ({ geographic }) => {
  // Geographic context automatically provides province data
  const {
    selectedBranch, // Current selected branch
    provinceId, // Auto-derived from branch
    provinceName, // Human-readable province name
    branchCode, // Current branch code
    enhanceDataForSubmission, // Auto-enhancement function
  } = geographic;

  const handleSubmit = async (formData) => {
    // Automatic provinceId injection
    const enhancedData = enhanceDataForSubmission(formData);
    // Results in: { ...formData, provinceId, branchCode, recordedAt }

    await submitToFirestore(enhancedData);
  };
};
```

### **2. Query Filtering with ProvinceId**

#### Data Fetching Pattern

```javascript
import { useGeographicData } from "hooks/useGeographicData";

const DataComponent = () => {
  const { getQueryFilters, getCurrentProvince } = useGeographicData();

  const fetchData = async () => {
    const filters = getQueryFilters(); // { provinceId, branchCode }

    // Firestore query with geographic constraints
    let query = firestore
      .collection("sections/account/incomes")
      .where("provinceId", "==", filters.provinceId);

    if (filters.branchCode) {
      query = query.where("branchCode", "==", filters.branchCode);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data());
  };
};
```

#### RBAC-Filtered Data Access

```javascript
import { usePermissions } from "hooks/usePermissions";

const DataTable = ({ rawData }) => {
  const { filterDataByUserAccess } = usePermissions();

  // Automatic filtering based on user's geographic access
  const filteredData = filterDataByUserAccess(rawData, {
    provinceField: "provinceId",
    branchField: "branchCode",
  });

  return <Table dataSource={filteredData} />;
};
```

### **3. Form Data Enhancement**

#### Manual Enhancement

```javascript
const FormComponent = ({ geographic }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    // Manual province data enhancement
    const submissionData = {
      ...values,
      ...geographic.getSubmissionData(), // Adds provinceId, branchCode, etc.
      submittedAt: Date.now(),
    };

    await saveData(submissionData);
  };
};
```

#### Automatic Enhancement

```javascript
const AutoEnhancedForm = ({ geographic }) => {
  const handleSubmit = async (values) => {
    // Automatic enhancement via geographic helper
    const enhancedData = geographic.enhanceDataForSubmission(values);
    await saveData(enhancedData);
  };
};
```

---

## 📊 **DATA STRUCTURE STANDARDS**

### **Required Fields in Business Documents**

```javascript
const standardDocumentStructure = {
  // Core business data
  incomeId: "INC-2024-001",
  amount: 50000,
  description: "Vehicle sale",

  // 🔑 REQUIRED: Geographic identifiers
  provinceId: "นครราชสีมา", // Province identifier
  branchCode: "0450", // Branch code

  // 📍 OPTIONAL: Enhanced geographic context
  recordedProvince: "นครราชสีมา", // Province where recorded
  recordedBranch: "0450", // Branch where recorded
  recordedAt: 1703001234567, // Timestamp when recorded

  // 👤 User context
  createdBy: "user123",
  createdAt: 1703001234567,

  // 🔍 Search optimization
  provinceKeywords: ["นครราชสีมา", "nakhon-ratchasima", "NMA"],
  branchKeywords: ["0450", "สำนักงานใหญ่"],
};
```

### **Existing Data Integration Pattern**

```javascript
const enhanceExistingDocument = (existingDoc) => {
  // Derive provinceId from existing branchCode
  const provinceId = getBranchProvince(existingDoc.branchCode);

  return {
    ...existingDoc,
    // Add required geographic fields
    provinceId,
    recordedProvince: provinceId,
    recordedBranch: existingDoc.branchCode,
    recordedAt: existingDoc.createdAt || Date.now(),

    // Add search keywords for better querying
    provinceKeywords: generateProvinceKeywords(provinceId),
    branchKeywords: generateBranchKeywords(existingDoc.branchCode),
  };
};
```

---

## 🔍 **SEARCH & FILTERING**

### **Province-Aware Search**

```javascript
const searchWithProvincialScope = async (searchTerm, userContext) => {
  const { allowedProvinces, allowedBranches } = userContext;

  let query = firestore.collection("sections/account/incomes");

  // Apply geographic constraints based on user access
  if (allowedProvinces.length > 0) {
    query = query.where("provinceId", "in", allowedProvinces);
  }

  if (allowedBranches.length > 0) {
    query = query.where("branchCode", "in", allowedBranches);
  }

  // Apply search term
  if (searchTerm) {
    query = query.where(
      "searchKeywords",
      "array-contains-any",
      generateSearchKeywords(searchTerm)
    );
  }

  return await query.get();
};
```

### **Cross-Province Reporting**

```javascript
const generateCrossProvinceReport = async (dateRange, userAccess) => {
  const reports = {};

  for (const provinceId of userAccess.allowedProvinces) {
    const provinceData = await firestore
      .collection("sections/account/incomes")
      .where("provinceId", "==", provinceId)
      .where("date", ">=", dateRange.start)
      .where("date", "<=", dateRange.end)
      .get();

    reports[provinceId] = {
      name: getProvinceName(provinceId),
      data: provinceData.docs.map((doc) => doc.data()),
      summary: calculateProvinceSummary(provinceData.docs),
    };
  }

  return reports;
};
```

---

## 🏢 **BRANCH-SPECIFIC OPERATIONS**

### **Branch Selection Component**

```javascript
import { GeographicBranchSelector } from "components";

const BranchAwareComponent = () => {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [provincialData, setProvincialData] = useState([]);

  // Automatically filter data when branch changes
  useEffect(() => {
    if (selectedBranch) {
      const provinceId = getBranchProvince(selectedBranch);
      fetchDataForBranch(selectedBranch, provinceId).then(setProvincialData);
    }
  }, [selectedBranch]);

  return (
    <div>
      <GeographicBranchSelector
        value={selectedBranch}
        onChange={setSelectedBranch}
        respectRBAC={true}
        showBranchCode={true}
      />

      <DataTable
        dataSource={provincialData}
        provinceContext={getBranchProvince(selectedBranch)}
      />
    </div>
  );
};
```

### **Branch-Specific Form Defaults**

```javascript
const BranchForm = ({ geographic }) => {
  const [form] = Form.useForm();

  // Set defaults based on selected branch
  useEffect(() => {
    if (geographic.selectedBranch) {
      form.setFieldsValue({
        branchCode: geographic.selectedBranch,
        branchName: geographic.branchName,
        provinceId: geographic.provinceId,
        provinceName: geographic.provinceName,
      });
    }
  }, [geographic, form]);

  return (
    <Form form={form} onFinish={handleSubmit}>
      {/* Form fields automatically populated with branch context */}
    </Form>
  );
};
```

---

## 📈 **REPORTING INTEGRATION**

### **Province-Specific Reports**

```javascript
const ProvinceReport = ({ provinceId }) => {
  const reportData = useProvinceData(provinceId, {
    collections: ["incomes", "expenses", "sales"],
    dateRange: "current-month",
  });

  return (
    <Card title={`${getProvinceName(provinceId)} Report`}>
      <Row gutter={16}>
        {reportData.branches.map((branch) => (
          <Col span={8} key={branch.code}>
            <BranchSummary
              branchCode={branch.code}
              data={branch.data}
              province={provinceId}
            />
          </Col>
        ))}
      </Row>
    </Card>
  );
};
```

### **Cross-Province Comparison**

```javascript
const CrossProvinceAnalysis = () => {
  const { userProvinces } = usePermissions();

  return (
    <div>
      {userProvinces.map((provinceId) => (
        <ProvinceMetrics
          key={provinceId}
          provinceId={provinceId}
          showComparison={userProvinces.length > 1}
        />
      ))}
    </div>
  );
};
```

---

## 🛠️ **IMPLEMENTATION UTILITIES**

### **Core Helper Functions**

```javascript
// From utils/mappings.js
export const getBranchProvince = (branchCode) => {
  return BRANCH_TO_PROVINCE[branchCode] || "นครราชสีมา";
};

export const getProvinceBranches = (provinceId) => {
  return PROVINCES[provinceId]?.branches || [];
};

export const generateProvinceKeywords = (provinceId) => {
  const province = PROVINCES[provinceId];
  return [
    province.id,
    province.nameEn.toLowerCase(),
    province.code.toLowerCase(),
  ];
};

export const validateProvinceAccess = (userProvinces, targetProvince) => {
  return userProvinces.includes("*") || userProvinces.includes(targetProvince);
};
```

### **Data Enhancement Helpers**

```javascript
// From hooks/useGeographicData.js
export const useAutoProvinceInjection = () => {
  const { selectedBranch } = useContext(GeographicContext);

  return useCallback(
    (data) => {
      if (!selectedBranch) return data;

      const provinceId = getBranchProvince(selectedBranch);

      return {
        ...data,
        provinceId,
        branchCode: selectedBranch,
        recordedProvince: provinceId,
        recordedBranch: selectedBranch,
        recordedAt: Date.now(),
      };
    },
    [selectedBranch]
  );
};
```

---

## ✅ **VALIDATION CHECKLIST**

### **ProvinceId Integration Verification**

- [ ] All business documents include `provinceId` field
- [ ] Branch selection automatically sets province context
- [ ] Data queries respect user's geographic access
- [ ] Forms automatically inject province data on submission
- [ ] Reports filter data by user's allowed provinces
- [ ] Search functionality scopes to accessible provinces
- [ ] Audit trails include geographic context
- [ ] Existing data integration preserves business logic

### **Performance Considerations**

- [ ] Firestore indexes include `provinceId` field
- [ ] Query limitations respect user's geographic scope
- [ ] Data pagination works with provincial filtering
- [ ] Caching strategies account for province-specific data

---

**Previous Document**: [01-principles-rules-guidelines.md](./01-principles-rules-guidelines.md)  
**Next Document**: [03-rbac-implementation-integration.md](./03-rbac-implementation-integration.md)
