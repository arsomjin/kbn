# Project Data Schema

This document defines the data schema for all collections in the Firebase Firestore database.

## Common Patterns

### Standard Fields
Most documents include these common fields:
- `created`: Timestamp (number) when the record was created
- `inputBy`: User ID who created the record
- `branchCode`: Branch identifier where the record was created
- `keywords`: Array of search keywords (lowercase)
- `deleted`: Boolean flag for soft deletes
- `remark`: Optional additional notes/comments

### ID Conventions
- Entity IDs follow the pattern `{entity}Id` (e.g., `customerId`, `expenseId`)
- References to other entities use the same name (e.g., `customerId` to reference a customer)

## Collections

### changeLogs
Tracks application version changes.

```typescript
interface ChangeLog {
  version: string;
  releaseDate: number; // Timestamp
  changes: {
    type: "feature" | "fix" | "improvement";
    description: string;
  }[];
  created: number;
  inputBy: string;
}
```

# 🗄️ Firestore Data Schema – KBN

This document outlines the database schema used in the KBN platform, detailing all Firestore collections, document structures, and field descriptions. This schema was automatically generated from your Firebase project 'kubota-benjapol-test' on 5/1/2025.

---

## 📋 Overview

KBN uses Firebase Firestore as its primary database, implementing a NoSQL document-based data model. This schema documentation reflects the actual structure of your data as found in your Firestore instance.

---

## 🏗️ Database Structure

The database contains the following collections:

```
├── changeLogs/
├── data/
│   └── {documentId}/
│       ├── bankNames/
│       ├── banks/
│       ├── banks_new/
│       ├── branches/
│       ├── customers/
│       ├── dataSources/
│       ├── dealers/
│       ├── departments/
│       ├── employees/
│       ├── executives/
│       ├── expenseAccountNames/
│       ├── expenseCategories/
│       ├── expenseCategory/
│       ├── expenseName/
│       ├── expenseNames/
│       ├── expenseSubCategory/
│       ├── giveaways/
│       ├── locations/
│       ├── partList/
│       ├── permissionCategories/
│       ├── permissions/
│       ├── plants/
│       ├── referrers/
│       ├── serviceList/
│       ├── userGroups/
│       ├── vehicleList/
│       └── warehouses/
├── messageTokens/
├── messages/
├── reports/
│   └── {documentId}/
│       ├── all/
│       ├── assessment/
│       ├── customerSources/
│       ├── mktChannels/
│       ├── parts/
│       └── vehicles/
└── sections/
    └── {documentId}/
        ├── bankDeposit/
        ├── bookItems/
        ├── bookings/
        ├── credits/
        ├── executiveCashDeposit/
        ├── expenseItems/
        ├── expenseTransfer/
        ├── expenses/
        ├── fingerPrint/
        ├── gasCost/
        ├── importFingerPrint/
        ├── importFingerPrintBatch/
        ├── importLog/
        ├── importPartItems/
        ├── importParts/
        ├── importServiceItems/
        ├── importServices/
        ├── importVehicleItems/
        ├── importVehicles/
        ├── importVehicles_new/
        ├── incomeItems/
        ├── incomes/
        ├── leave/
        ├── otherVehicleIn/
        ├── otherVehicleOut/
        ├── partGroups/
        ├── partItems/
        ├── parts/
        ├── peripherals/
        ├── purchasePlan/
        ├── saleItems/
        ├── saleOut/
        ├── saleOutItems/
        ├── salePartItems/
        ├── sellParts/
        ├── serviceClose/
        ├── serviceCloseItems/
        ├── serviceItems/
        ├── serviceOrders/
        ├── services/
        ├── transfer/
        ├── transferIn/
        ├── transferItems/
        ├── transferOut/
        ├── vehicleList/
        └── vehicles/

```

---

## 📄 Collections and Documents

### 📁 changeLogs Collection

Stores changelogs-related data.

_Sample size: 5 documents_

```javascript
// changeLogs/{documentId}
{
  changes:  value,     // Array
  time:     value,     // number
  version:  value,     // string
}
```

#### Sample Data

Below are sanitized examples of documents from this collection:

**Sample 1:**

```json
{
  "changes": ["Item 1", "Item 2", "Item 3"],
  "time": 42,
  "version": "Sample text"
}
```

**Sample 2:**

```json
{
  "changes": ["Item 1", "Item 2", "Item 3"],
  "time": 42,
  "version": "Sample text"
}
```

**Sample 3:**

```json
{
  "changes": ["Item 1", "Item 2", "Item 3"],
  "time": 42,
  "version": "Sample text"
}
```

**Sample 4:**

```json
{
  "changes": ["Item 1", "Item 2", "Item 3"],
  "time": 42,
  "version": "Sample text"
}
```

**Sample 5:**

```json
{
  "changes": ["Item 1", "Item 2", "Item 3"],
  "time": 42,
  "version": "Sample text"
}
```

#### Field Descriptions

| Field     | Type   | Description         |
| --------- | ------ | ------------------- |
| `changes` | Array  | Collection of items |
| `time`    | number | Time                |
| `version` | string | Version             |

### 📁 data Collection

The data collection contains subcollections grouped by category.

#### 📁 data/account Subcollection

##### 📁 data/account/expenseAccountNames Collection

Stores expense account names data.

_Sample size: Variable documents_

```javascript
// data/account/expenseAccountNames/{documentId}
{
  created:  value,     // timestamp

  created        value,     // number
  expenseAccountNamevalue,     // string
  expenseAccountNameIdvalue,     // string
  inputBy        value,     // string
}
```

##### 📁 data/account/expenseCategories Collection

Stores expense categories data.

_Sample size: Variable documents_

```javascript
// data/account/expenseCategories/{documentId}
{
  created:  value,     // timestamp

  created        value,     // number
  expenseCategoryIdvalue,     // string
  expenseCategoryNamevalue,     // string
  inputBy        value,     // string
}
```

##### 📁 data/account/expenseCategory Collection

Stores expense category data.

_Sample size: Variable documents_

```javascript
// data/account/expenseCategory/{documentId}
{
  created:  value,     // timestamp

  created        value,     // number
  deleted        value,     // boolean
  expenseCategoryIdvalue,     // string
  expenseCategoryNamevalue,     // string
  inputBy        value,     // string
  keywords       value,     // Array<String>
}
```

##### 📁 data/account/expenseName Collection

Stores expense name data.

_Sample size: Variable documents_

```javascript
// data/account/expenseName/{documentId}
{
  created:  value,     // timestamp

  created        value,     // number
  deleted        value,     // boolean
  expenseCategoryIdvalue,     // string
  expenseCategoryNamevalue,     // string
  expenseName    value,     // string
  expenseNameId  value,     // string
  expenseSubCategoryNamevalue,     // null
  inputBy        value,     // string
  keywords       value,     // Array<String>
}
```

##### 📁 data/account/expenseNames Collection

Stores expense names related to expense categories.

_Sample size: Variable documents_

```javascript
// data/account/expenseNames/{documentId}
{
  expenseCategoryId:  value,     // reference

  expenseCategoryIdvalue,     // string
  expenseCategoryNamevalue,     // string
  expenseName    value,     // string
  expenseSubCategoryvalue,     // string
}
```

##### 📁 data/account/expenseSubCategory Collection

Stores expense subcategory data.

_Sample size: Variable documents_

```javascript
// data/account/expenseSubCategory/{documentId}
{
  importTime:  value,     // timestamp

  batchNo        value,     // number
  deleted        value,     // boolean
  expenseCategoryIdvalue,     // string
  expenseSubCategoryIdvalue,     // string
  expenseSubCategoryNamevalue,     // string
  importBy       value,     // string
  importTime     value,     // number
  keywords       value,     // Array<String>
}
```

#### 📁 data/company Subcollection

##### 📁 data/company/bankNames Collection

Stores bank name reference data.

_Sample size: Variable documents_

```javascript
// data/company/bankNames/{documentId}
{
  created:  value,     // timestamp

  bankNameId     value,     // string
  created        value,     // number
  inputBy        value,     // string
  name           value,     // string
  remark         value,     // null
}
```

##### 📁 data/company/banks Collection

Stores bank account data.

_Sample size: Variable documents_

```javascript
// data/company/banks/{documentId}
{
  created:  value,     // timestamp

  accNo          value,     // string
  bankId         value,     // string
  bankName       value,     // string
  branch         value,     // null
  created        value,     // number
  inputBy        value,     // string
  name           value,     // string
  order          value,     // number
  sameAcc        value,     // Array<String>
}
```

##### 📁 data/company/banks_new Collection

Stores updated bank account data.

_Sample size: Variable documents_

```javascript
// data/company/banks_new/{documentId}
{
  created:  value,     // timestamp

  accNo          value,     // string
  bankId         value,     // string
  bankName       value,     // string
  branch         value,     // null
  created        value,     // number
  inputBy        value,     // string
  name           value,     // string
  order          value,     // number
  sameAcc        value,     // Array<String>
}
```

##### 📁 data/company/branches Collection

Stores company branch information.

_Sample size: Variable documents_

```javascript
// data/company/branches/{documentId}
{
  branchCode:  value,     // string

  branchCode     value,     // string
  branchId       value,     // string
  branchName     value,     // string
  locationId     value,     // string
  queue          value,     // number
  remark         value,     // string
  warehouseId    value,     // string
}
```

##### 📁 data/company/departments Collection

Stores departmental structure information.

_Sample size: Variable documents_

```javascript
// data/company/departments/{documentId}
{
  departmentId:  value,     // string

  deleted        value,     // boolean
  department     value,     // string
  departmentId   value,     // string
}
```

##### 📁 data/company/employees Collection

Stores employee information.

_Sample size: Variable documents_

```javascript
// data/company/employees/{documentId}
{
  created:  value,     // timestamp

  affiliate      value,     // string
  created        value,     // number
  employeeCode   value,     // string
  endDate        value,     // null
  firstName      value,     // string
  inputBy        value,     // string
  lastName       value,     // string
  nickName       value,     // string
  position       value,     // string
  prefix         value,     // string
  startDate      value,     // string
  status         value,     // string
  workBegin      value,     // string
  workEnd        value,     // string
}
```

##### 📁 data/company/executives Collection

Stores company executive information.

_Sample size: Variable documents_

```javascript
// data/company/executives/{documentId}
{
  created:  value,     // timestamp

  branch         value,     // string
  created        value,     // number
  email          value,     // null
  executiveCode  value,     // string
  firstName      value,     // string
  group          value,     // string
  inputBy        value,     // string
  lastName       value,     // string
  phoneNumber    value,     // null
  prefix         value,     // string
}
```

##### 📁 data/company/locations Collection

Stores location information.

_Sample size: Variable documents_

```javascript
// data/company/locations/{documentId}
{
  locationId:  value,     // string

  address        value,     // string
  amphoe         value,     // string
  country        value,     // string
  locationId     value,     // string
  postcode       value,     // string
  province       value,     // string
  remark         value,     // string
  tambol         value,     // string
}
```

##### 📁 data/company/permissionCategories Collection

Stores permission category definitions.

_Sample size: Variable documents_

```javascript
// data/company/permissionCategories/{documentId}
{
  permissionCategoryId:  value,     // string

  permissionCategoryIdvalue,     // string
  permissionCategoryNamevalue,     // string
  remark         value,     // string
}
```

##### 📁 data/company/permissions Collection

Stores permission definitions.

_Sample size: Variable documents_

```javascript
// data/company/permissions/{documentId}
{
  permissionId:  value,     // string

  description    value,     // string
  permissionCategoryIdvalue,     // string
  permissionId   value,     // string
  permissionName value,     // string
}
```

##### 📁 data/company/userGroups Collection

Stores user groups for permission assignments.

_Sample size: Variable documents_

```javascript
// data/company/userGroups/{documentId}
{
  _key:  value,     // string

  _key           value,     // string
  permCats       value,     // Object
  permissions    value,     // Object
  remark         value,     // string
  userGroupId    value,     // string
  userGroupName  value,     // string
}
```

##### 📁 data/company/warehouses Collection

Stores warehouse information.

_Sample size: Variable documents_

```javascript
// data/company/warehouses/{documentId}
{
  warehouseId:  value,     // string

  locationId     value,     // string
  remark         value,     // string
  warehouseId    value,     // string
  warehouseName  value,     // string
}
```

#### 📁 data/products Subcollection

##### 📁 data/products/partList Collection

Stores product parts inventory data.

_Sample size: Variable documents_

```javascript
// data/products/partList/{documentId}
{
  pCode:  value,     // string

  creditTerm     value,     // string
  description    value,     // string
  model          value,     // string
  model_lower    value,     // string
  model_partial  value,     // string
  name           value,     // string
  name_lower     value,     // string
  name_partial   value,     // string
  pCode          value,     // string
  pCode_lower    value,     // string
  pCode_partial  value,     // string
  partType       value,     // string
  remark         value,     // string
  slp            value,     // number
  slp_no_vat     value,     // number
  standardCost   value,     // number
  wsPrice        value,     // string
}
```

##### 📁 data/products/vehicleList Collection

Stores vehicle inventory data.

_Sample size: Variable documents_

```javascript
// data/products/vehicleList/{documentId}
{
  importTime:  value,     // timestamp

  batchNo        value,     // number
  creditTerm     value,     // number
  deleted        value,     // boolean
  header         value,     // null
  importBy       value,     // string
  importTime     value,     // number
  isUsed         value,     // boolean
  keywords       value,     // Array<String>
  listPrice      value,     // number
  model          value,     // string
  name           value,     // string
  name_lower     value,     // string
  name_partial   value,     // string
  productCode    value,     // string
  productCode_lowervalue,     // string
  productCode_partialvalue,     // string
  productPCode   value,     // string
  productType    value,     // string
  productType_lowervalue,     // string
  productType_partialvalue,     // string
  wsPrice        value,     // string
}
```

#### 📁 data/sales Subcollection

##### 📁 data/sales/customers Collection

Stores customer data.

_Sample size: Variable documents_

```javascript
// data/sales/customers/{documentId}
{
  created:  value,     // timestamp

  address        value,     // Address
  agent          value,     // string
  agentId        value,     // string
  areaSize       value,     // string
  branch         value,     // string
  career         value,     // string
  created        value,     // number
  customerId     value,     // string
  customerId_lowervalue,     // string
  customerId_partialvalue,     // string
  customerLevel  value,     // string
  customerNo     value,     // string
  customerNo_lowervalue,     // string
  customerNo_partialvalue,     // string
  firstName      value,     // string
  firstName_lowervalue,     // string
  firstName_partialvalue,     // string
  idNumber       value,     // string
  inputBy        value,     // string
  interestedModelvalue,     // string
  lastName       value,     // string
  lastName_lower value,     // string
  lastName_partialvalue,     // string
  ownedModel     value,     // string
  phoneNumber    value,     // string
  phoneNumber_lowervalue,     // string
  phoneNumber_partialvalue,     // string
  plants         value,     // Array (empty)
  prefix         value,     // string
  remark         value,     // string
  sourceOfData   value,     // Array (empty)
  url            value,     // null
  whenToBuy      value,     // string
  whenToBuyRange value,     // Object
}
```

##### 📁 data/sales/dataSources Collection

Stores sales data sources.

_Sample size: Variable documents_

```javascript
// data/sales/dataSources/{documentId}
{
  created:  value,     // timestamp

  created        value,     // number
  dataSourceId   value,     // string
  inputBy        value,     // string
  name           value,     // string
  remark         value,     // null
}
```

##### 📁 data/sales/dealers Collection

Stores dealer information.

_Sample size: Variable documents_

```javascript
// data/sales/dealers/{documentId}
{
  created:  value,     // timestamp

  created        value,     // number
  dealerAddress  value,     // null
  dealerAmphoe   value,     // null
  dealerBank     value,     // null
  dealerBankAccNovalue,     // null
  dealerBankName value,     // null
  dealerBankType value,     // string
  dealerCode     value,     // string
  dealerHeadOfficevalue,     // number
  dealerId       value,     // string
  dealerName     value,     // string
  dealerPostcode value,     // null
  dealerPrefix   value,     // string
  dealerProvince value,     // null
  dealerTambol   value,     // null
  dealerTaxNumbervalue,     // string
  dealerType     value,     // string
  inputBy        value,     // string
}
```

##### 📁 data/sales/giveaways Collection

Stores promotional giveaways data.

_Sample size: Variable documents_

```javascript
// data/sales/giveaways/{documentId}
{
  // Fields would be here
}
```

##### 📁 data/sales/plants Collection

Stores manufacturing plant information.

_Sample size: Variable documents_

```javascript
// data/sales/plants/{documentId}
{
  plantId:  value,     // string

  name           value,     // string
  plantId        value,     // string
}
```

##### 📁 data/sales/referrers Collection

Stores referrer information.

_Sample size: Variable documents_

```javascript
// data/sales/referrers/{documentId}
{
  created:  value,     // timestamp

  address        value,     // Address
  created        value,     // number
  firstName      value,     // string
  firstName_lowervalue,     // string
  firstName_partialvalue,     // string
  lastName       value,     // string
  lastName_lower value,     // string
  lastName_partialvalue,     // string
  phoneNumber    value,     // string
  phoneNumber_lowervalue,     // string
  phoneNumber_partialvalue,     // string
  prefix         value,     // string
  referrerId     value,     // string
}
```

##### 📁 data/sales/serviceList Collection

Stores service offerings data.

_Sample size: Variable documents_

```javascript
// data/sales/serviceList/{documentId}
{
  created:  value,     // timestamp
  // Additional fields would be here
}
```

### 📁 messageTokens Collection

Stores messagetokens-related data.

_Sample size: 5 documents_

```javascript
// messageTokens/{documentId}
{
  branch:      value,     // string
  department:  value,     // string
  device:      value,     // Object
  email:       value,     // string
  group:       value,     // string
  token:       value,     // string
  uid:         value,     // string
  updatedAt:   value,     // number
}
```

#### Sample Data

Below are sanitized examples of documents from this collection:

**Sample 1:**

```json
{
  "uid": "u-123456",
  "department": "Sample text",
  "branch": "Sample text",
  "device": {
    "key1": "Value 1",
    "key2": "Value 2"
  },
  "email": "user@example.com",
  "group": "Sample text",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "updatedAt": 42
}
```

**Sample 2:**

```json
{
  "department": "Sample text",
  "branch": "Sample text",
  "group": "Sample text",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Sample 3:**

```json
{
  "uid": "u-123456",
  "department": "Sample text",
  "branch": "Sample text",
  "device": {
    "key1": "Value 1",
    "key2": "Value 2"
  },
  "email": "user@example.com",
  "group": "Sample text",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "updatedAt": 42
}
```

**Sample 4:**

```json
{
  "uid": "u-123456",
  "department": "Sample text",
  "branch": "Sample text",
  "device": {
    "key1": "Value 1",
    "key2": "Value 2"
  },
  "email": "user@example.com",
  "group": "Sample text",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "updatedAt": 42
}
```

**Sample 5:**

```json
{
  "department": null,
  "branch": null,
  "group": null,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Field Descriptions

| Field        | Type   | Description                           |
| ------------ | ------ | ------------------------------------- |
| `branch`     | string | Branch                                |
| `department` | string | Department                            |
| `device`     | Object | Nested object containing related data |
| `email`      | string | Email                                 |
| `group`      | string | Group                                 |
| `token`      | string | Token                                 |
| `uid`        | string | Reference to uid                      |
| `updatedAt`  | number | Timestamp                             |

### 📁 messages Collection

Stores messages-related data.

_Sample size: 5 documents_

```javascript
// messages/{documentId}
{
  by:           value,     // string
  description:  value,     // string
  duration:     value,     // string
  message:      value,     // string
  time:         value,     // string
  type:         value,     // string
}
```

#### Sample Data

Below are sanitized examples of documents from this collection:

**Sample 1:**

```json
{
  "duration": "Sample text",
  "by": "Sample text",
  "description": "This is a sample description for the item.",
  "time": "Sample text",
  "message": "Sample text",
  "type": "Sample text"
}
```

**Sample 2:**

```json
{
  "duration": "Sample text",
  "by": "Sample text",
  "description": "This is a sample description for the item.",
  "time": "Sample text",
  "message": "Sample text",
  "type": "Sample text"
}
```

**Sample 3:**

```json
{
  "duration": "Sample text",
  "by": "Sample text",
  "description": "This is a sample description for the item.",
  "time": "Sample text",
  "message": "Sample text",
  "type": "Sample text"
}
```

**Sample 4:**

```json
{
  "duration": "Sample text",
  "by": "Sample text",
  "description": "This is a sample description for the item.",
  "time": "Sample text",
  "message": "Sample text",
  "type": "Sample text"
}
```

**Sample 5:**

```json
{
  "duration": "Sample text",
  "by": "Sample text",
  "description": "This is a sample description for the item.",
  "time": "Sample text",
  "message": "Sample text",
  "type": "Sample text"
}
```

#### Field Descriptions

| Field         | Type   | Description      |
| ------------- | ------ | ---------------- |
| `by`          | string | By               |
| `description` | string | Descriptive text |
| `duration`    | string | Timestamp        |
| `message`     | string | Message          |
| `time`        | string | Time             |
| `type`        | string | Type             |

### 📁 reports Collection

The reports collection contains various reporting data.

#### 📁 reports/sales Subcollection

##### 📁 reports/sales/assessment Collection

Stores sales assessment reports.

_Sample size: Up to 100 latest documents_

```javascript
// reports/sales/assessment/{documentId}
{
  bookId:  value,     // string

  assessment     value,     // Object
  assessmentDate value,     // null
  assessmentDetailsvalue,     // null
  assessmentMonthvalue,     // null
  assessmentResultvalue,     // null
  assessmentYear value,     // null
  bookId         value,     // string
  bookNo         value,     // string
  bookNo_lower   value,     // string
  bookNo_partial value,     // string
  bookingPerson  value,     // string
  branchCode     value,     // string
  customerId     value,     // string
  firstName      value,     // string
  firstName_lowervalue,     // string
  firstName_partialvalue,     // string
  items          value,     // Array<Object>
  lastName       value,     // string
  phoneNumber    value,     // string
  prefix         value,     // string
  saleType       value,     // string
  salesPerson    value,     // Array<String>
  sourceOfData   value,     // Array<String>
}
```

##### 📁 reports/sales/customerSources Collection

Stores customer source analytics.

_Sample size: Up to 100 latest documents_

```javascript
// reports/sales/customerSources/{documentId}
{
  date:  value,     // date string

  branchCode     value,     // string
  customerId     value,     // string
  date           value,     // string
  firstName      value,     // string
  firstName_lowervalue,     // string
  firstName_partialvalue,     // string
  items          value,     // Array<Object>
  lastName       value,     // string
  phoneNumber    value,     // string
  prefix         value,     // string
  saleId         value,     // string
  saleNo         value,     // string
  saleNo_lower   value,     // string
  saleNo_partial value,     // string
  saleType       value,     // string
  salesPerson    value,     // Array<String>
  sourceOfData   value,     // Array (empty)
}
```

##### 📁 reports/sales/mktChannels Collection

Stores marketing channel analytics.

_Sample size: Up to 100 latest documents_

```javascript
// reports/sales/mktChannels/{documentId}
{
  date:  value,     // date string

  amphoe         value,     // string
  branchCode     value,     // string
  customer       value,     // string
  customerId     value,     // string
  date           value,     // string
  engineNo       value,     // Array<String>
  firstName      value,     // string
  firstName_lowervalue,     // string
  firstName_partialvalue,     // string
  items          value,     // Array<Object>
  lastName       value,     // string
  model          value,     // Array<String>
  peripheralNo   value,     // Array<String>
  peripherals    value,     // Array<Object>
  phoneNumber    value,     // string
  postcode       value,     // string
  prefix         value,     // string
  province       value,     // string
  saleId         value,     // string
  saleNo         value,     // string
  saleNo_lower   value,     // string
  saleNo_partial value,     // string
  saleType       value,     // string
  salesPerson    value,     // Array<String>
  sourceOfData   value,     // Array<String>
  tambol         value,     // string
  vehicleNo      value,     // Array<String>
  vehicles       value,     // Array<Object>
  village        value,     // string
}
```

##### 📁 reports/sales/parts Collection

Stores parts sales reports.

_Sample size: Up to 100 latest documents_

```javascript
// reports/sales/parts/{documentId}
{
  saleDate:  value,     // date string

  AD_Discount    value,     // number
  AD_DiscountQty value,     // number
  SKCDiscount    value,     // number
  SKCDiscountQty value,     // number
  SKCLoyaltyDiscountvalue,     // number
  SKCLoyaltyDiscountAmtvalue,     // number
  SKCManualDiscountvalue,     // number
  SKCManualDiscountQtyvalue,     // number
  amtOilType     value,     // number
  amtPartType    value,     // number
  batchNo        value,     // number
  billDiscount   value,     // number
  billDiscountQtyvalue,     // number
  branchCode     value,     // string
  deposit        value,     // number
  discountCoupon value,     // number
  discountPointRedeemvalue,     // number
  importBy       value,     // string
  importTime     value,     // number
  item           value,     // string
  netDepositDeductvalue,     // number
  netTotal       value,     // number
  pointsReceived value,     // number
  redeemPoint    value,     // number
  saleDate       value,     // string
  saleNo         value,     // string
  sourceOfData   value,     // string
}
```

##### 📁 reports/sales/vehicles Collection

Stores vehicle sales reports.

_Sample size: Up to 100 latest documents_

```javascript
// reports/sales/vehicles/{documentId}
{
  created:  value,     // timestamp

  accountRecordedvalue,     // null
  additionalPurchasevalue,     // Array (empty)
  address        value,     // Address
  advInstallment value,     // number
  amphoe         value,     // string
  amtBaacDebtor  value,     // null
  amtBaacFee     value,     // null
  amtDeposit     value,     // number
  amtFull        value,     // number
  amtKBN         value,     // number
  amtMAX         value,     // number
  amtOldCustomer value,     // number
  amtOther       value,     // number
  amtOthers      value,     // Array (empty)
  amtPlateAndInsurancevalue,     // number
  amtPro         value,     // number
  amtReceived    value,     // number
  amtReferrer    value,     // number
  amtReservation value,     // number
  amtSKC         value,     // number
  amtTurnOver    value,     // number
  amtTurnOverDifRefundvalue,     // number
  amtTurnOverVehiclevalue,     // null
  assessment     value,     // Object
  baacNo         value,     // null
  bookDate       value,     // string
  bookId         value,     // string
  bookNo         value,     // string
  bookNo_lower   value,     // string
  bookNo_partial value,     // string
  bookPNo        value,     // string
  bookingPerson  value,     // Array<String>
  branchCode     value,     // string
  canceled       value,     // null
  contractDate   value,     // string
  created        value,     // number
  createdBy      value,     // string
  creditRecorded value,     // null
  customer       value,     // string
  customerId     value,     // string
  customerNo     value,     // string
  date           value,     // string
  deductOther    value,     // number
  deductOthers   value,     // Array (empty)
  deliverDate    value,     // string
  depositPaymentsvalue,     // Array (empty)
  depositor      value,     // null
  downPayment    value,     // number
  engineNo       value,     // Array<String>
  firstName      value,     // string
  firstName_lowervalue,     // string
  firstName_partialvalue,     // string
  giveaways      value,     // Array<Object>
  guarantorDocs  value,     // Object
  guarantors     value,     // Array (empty)
  hasGuarantor   value,     // boolean
  hasReferrer    value,     // boolean
  hasTurnOver    value,     // boolean
  isEquipment    value,     // boolean
  isNewCustomer  value,     // boolean
  isNewReferrer  value,     // boolean
  isUsed         value,     // boolean
  items          value,     // Array<Object>
  ivAdjusted     value,     // boolean
  keywords       value,     // Array<String>
  lastName       value,     // string
  model          value,     // Array<String>
  oweKBNLeasing  value,     // number
  oweKBNLeasings value,     // Object
  payments       value,     // Array (empty)
  peripheralNo   value,     // Array<String>
  peripherals    value,     // Array (empty)
  phoneNumber    value,     // string
  postcode       value,     // string
  prefix         value,     // string
  proMonth       value,     // string
  promotions     value,     // Array<Object>
  province       value,     // string
  receiverEmployeevalue,     // string
  refNo          value,     // string
  referrer       value,     // Address
  referringDetailsvalue,     // Object
  registered     value,     // null
  remark         value,     // null
  reservationDepositorvalue,     // null
  saleCategory   value,     // string
  saleId         value,     // string
  saleNo         value,     // string
  saleNo_lower   value,     // string
  saleNo_partial value,     // string
  salePNo        value,     // string
  saleSubCategoryvalue,     // string
  saleType       value,     // string
  salesPerson    value,     // Array<String>
  sourceOfData   value,     // Array (empty)
  status         value,     // string
  tambol         value,     // string
  total          value,     // number
  turnOverCloseInstallmentvalue,     // null
  turnOverDocs   value,     // Array (empty)
  turnOverFix    value,     // boolean
  turnOverFixKBN value,     // null
  turnOverFixMAX value,     // null
  turnOverItems  value,     // Array (empty)
  vehicleNo      value,     // Array<String>
  vehicles       value,     // Array<Object>
  village        value,     // string
}
```

##### 📁 reports/services/all Collection

Stores comprehensive service reports.

_Sample size: Up to 100 latest documents_

```javascript
// reports/services/all/{documentId}
{
  docDate:  value,     // date string

  SKCDiscountPricevalue,     // number
  advisor        value,     // string
  advisorName    value,     // string
  batchNo        value,     // number
  branchCode     value,     // string
  branchName     value,     // string
  causeCode      value,     // null
  causeCodeDesc  value,     // null
  customerCode   value,     // string
  customerName   value,     // string
  dealerDiscountPricevalue,     // number
  discountType   value,     // null
  docDate        value,     // string
  engineNo       value,     // string
  freights       value,     // number
  importBy       value,     // string
  importTime     value,     // number
  jobCloseDate   value,     // string
  model          value,     // string
  netPrice       value,     // number
  oilBeforeDiscountvalue,     // number
  oilDealerDiscountvalue,     // number
  oilSKCDiscount value,     // number
  oilSum         value,     // Array (empty)
  oils           value,     // number
  orderNo        value,     // string
  orderReason    value,     // string
  orderStatus    value,     // string
  orderType      value,     // string
  orderTypeDesc  value,     // string
  others         value,     // number
  partBeforeDiscountvalue,     // number
  partDealerDiscountvalue,     // number
  partSKCDiscountvalue,     // number
  parts          value,     // number
  percentDiscountvalue,     // number
  priceBeforeDiscountvalue,     // number
  productName    value,     // string
  saleDate       value,     // string
  serviceStatus  value,     // string
  serviceTechnicianvalue,     // Array<String>
  travels        value,     // number
  vehicleModel   value,     // string
  vehicleNo      value,     // string
  wages          value,     // number
  workHour       value,     // number
}
```

### 📁 sections Collection

The sections collection contains operational data grouped by business function.

#### 📁 sections/account Subcollection

##### 📁 sections/account/bankDeposit Collection

Stores bank deposit records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/account/bankDeposit/{documentId}
{
  created:  value,     // timestamp

  branchCode     value,     // string
  created        value,     // number
  createdBy      value,     // string
  date           value,     // string
  deleted        value,     // boolean
  depositDate    value,     // string
  depositId      value,     // string
  depositor      value,     // string
  remark         value,     // string
  selfBankId     value,     // string
  status         value,     // string
  total          value,     // string
}
```

##### 📁 sections/account/executiveCashDeposit Collection

Stores executive cash deposit records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/account/executiveCashDeposit/{documentId}
{
  created:  value,     // timestamp

  branchCode     value,     // string
  created        value,     // number
  createdBy      value,     // string
  date           value,     // string
  deleted        value,     // boolean
  depositDate    value,     // string
  depositId      value,     // string
  depositor      value,     // string
  executiveId    value,     // string
  remark         value,     // string
  status         value,     // string
  total          value,     // string
}
```

##### 📁 sections/account/expenseItems Collection

Stores expense item details.

_Sample size: Up to 100 latest documents_

```javascript
// sections/account/expenseItems/{documentId}
{
  created:  value,     // timestamp

  VAT            value,     // string
  _key           value,     // string
  branchCode     value,     // string
  created        value,     // number
  date           value,     // string
  dealer         value,     // string
  department     value,     // string
  discount       value,     // null
  expenseAccountNameIdvalue,     // string
  expenseCategoryIdvalue,     // string
  expenseId      value,     // string
  expenseItemId  value,     // string
  expenseName    value,     // string
  expenseType    value,     // string
  inputBy        value,     // string
  isChevrolet    value,     // boolean
  payer          value,     // string
  priceType      value,     // string
  remark         value,     // null
  taxInvoiceNo   value,     // string
  total          value,     // number
}
```

##### 📁 sections/account/expenseTransfer Collection

Stores expense transfer records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/account/expenseTransfer/{documentId}
{
  created:  value,     // timestamp

  VAT            value,     // string
  _key           value,     // string
  accNo          value,     // null
  bank           value,     // null
  bankName       value,     // null
  beforeVAT      value,     // string
  billNo         value,     // null
  branchCode     value,     // string
  created        value,     // number
  date           value,     // string
  department     value,     // null
  docNo          value,     // string
  expenseAccountNameIdvalue,     // null
  expenseCategoryIdvalue,     // null
  expenseId      value,     // string
  expenseItemId  value,     // string
  expenseName    value,     // string
  expenseType    value,     // string
  hasWHTax       value,     // number
  inputBy        value,     // string
  ledgerCompletedvalue,     // boolean
  ledgerRecords  value,     // Array (empty)
  netTotal       value,     // string
  priceType      value,     // string
  receiver       value,     // string
  refNo          value,     // null
  remark         value,     // null
  taxInvoiceCompletedvalue,     // boolean
  taxInvoiceInfo value,     // null
  total          value,     // number
  transferCompletedvalue,     // boolean
  whTax          value,     // string
  whTaxDoc       value,     // null
}
```

##### 📁 sections/account/expenses Collection

Stores expense records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/account/expenses/{documentId}
{
  date:  value,     // date string

  billTotal      value,     // number
  branchCode     value,     // string
  changeDeposit  value,     // Array<Object>
  created        value,     // number
  date           value,     // string
  expenseCategoryvalue,     // string
  expenseId      value,     // string
  expenseType    value,     // string
  inputBy        value,     // string
  inputDate      value,     // string
  items          value,     // Array<Object>
  receiverEmployeevalue,     // string
  status         value,     // string
  total          value,     // number
}
```

##### 📁 sections/account/incomeItems Collection

Stores income item details.

_Sample size: Up to 100 latest documents_

```javascript
// sections/account/incomeItems/{documentId}
{
  // Fields would be here
}
```

##### 📁 sections/account/incomes Collection

Stores income records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/account/incomes/{documentId}
{
  created:  value,     // timestamp

  amtBattery     value,     // number
  amtDuringDay   value,     // number
  amtFieldMeter  value,     // number
  amtGPS         value,     // number
  amtIntake      value,     // number
  amtOther       value,     // number
  amtReceived    value,     // number
  amtTyre        value,     // number
  branchCode     value,     // string
  created        value,     // number
  createdBy      value,     // string
  customerId     value,     // null
  date           value,     // string
  deductOther    value,     // number
  docNo          value,     // string
  hasBankTransfervalue,     // boolean
  hasPLoan       value,     // boolean
  incomeCategory value,     // string
  incomeId       value,     // string
  incomeSubCategoryvalue,     // string
  incomeType     value,     // string
  partsDeposit   value,     // number
  payments       value,     // Array (empty)
  receiverDuringDayvalue,     // string
  receiverEmployeevalue,     // string
  remark         value,     // string
  salesPerson    value,     // Array<String>
  status         value,     // string
  total          value,     // number
}
```

#### 📁 sections/credits Subcollection

##### 📁 sections/credits/credits Collection

Stores credit records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/credits/credits/{documentId}
{
  created:  value,     // timestamp

  actualTransferDatevalue,     // null
  amtActOfLegal  value,     // number
  amtBaacFee     value,     // null
  amtFull        value,     // number
  amtInsurance   value,     // number
  amtKBN         value,     // number
  amtReceive     value,     // null
  amtReferrer    value,     // number
  branchCode     value,     // string
  contractAmtReceivedAccNovalue,     // null
  contractAmtReceivedBankvalue,     // null
  contractAmtReceivedDatevalue,     // null
  contractDeliverDatevalue,     // null
  created        value,     // number
  createdBy      value,     // string
  creditId       value,     // string
  creditNo       value,     // null
  customerId     value,     // string
  date           value,     // null
  downPayment    value,     // number
  firstInstallmentvalue,     // number
  firstName      value,     // string
  hasReferrer    value,     // boolean
  inputBy        value,     // string
  inputCreditInfoByvalue,     // null
  itemType       value,     // Array<String>
  keywords       value,     // Array (empty)
  lastName       value,     // string
  loanInfoIncome value,     // number
  netTotal       value,     // string
  prefix         value,     // string
  referrer       value,     // Object
  referringDetailsvalue,     // Object
  remark         value,     // null
  saleCutoffDate value,     // null
  saleId         value,     // string
  saleItems      value,     // Array (empty)
  saleNo         value,     // string
  saleType       value,     // string
  sendTransferDatevalue,     // null
  status         value,     // string
  taxInvoice     value,     // null
  taxInvoiceDate value,     // null
  totalBeforeDeductInsurancevalue,     // number
  totalDownDiscountvalue,     // number
  vat            value,     // number
  wht            value,     // number
}
```

#### 📁 sections/hr Subcollection

##### 📁 sections/hr/importFingerPrint Collection

Stores imported fingerprint data.

_Sample size: Up to 100 latest documents_

```javascript
// sections/hr/importFingerPrint/{documentId}
{
  importTime:  value,     // timestamp

  1              value,     // string
  2              value,     // string
  3              value,     // string
  4              value,     // string
  5              value,     // string
  6              value,     // string
  batchNo        value,     // number
  branch         value,     // string
  date           value,     // string
  employeeCode   value,     // string
  fullName       value,     // string
  importBy       value,     // string
  importTime     value,     // number
}
```

##### 📁 sections/hr/importFingerPrintBatch Collection

Stores batch fingerprint import data.

_Sample size: Up to 100 latest documents_

```javascript
// sections/hr/importFingerPrintBatch/{documentId}
{
  importTime:  value,     // timestamp

  1              value,     // string
  2              value,     // string
  3              value,     // string
  4              value,     // string
  5              value,     // string
  6              value,     // string
  batchNo        value,     // number
  branch         value,     // string
  date           value,     // string
  employeeCode   value,     // string
  fullName       value,     // string
  importBy       value,     // string
  importTime     value,     // number
}
```

##### 📁 sections/hr/leave Collection

Stores employee leave records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/hr/leave/{documentId}
{
  created:  value,     // timestamp

  approvedBy     value,     // string
  branchCode     value,     // string
  created        value,     // number
  date           value,     // string
  dates          value,     // Array<String>
  deleted        value,     // boolean
  department     value,     // string
  docId          value,     // string
  employeeId     value,     // string
  fromDate       value,     // string
  hasMedCer      value,     // boolean
  inputBy        value,     // string
  leaveDays      value,     // number
  leaveType      value,     // string
  position       value,     // string
  reason         value,     // string
  recordedBy     value,     // string
  toDate         value,     // string
}
```

#### 📁 sections/imports Subcollection

##### 📁 sections/imports/fingerPrint Collection

Stores fingerprint import records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/imports/fingerPrint/{documentId}
{
  time:  value,     // timestamp

  batchNo        value,     // number
  by             value,     // string
  dataType       value,     // string
  time           value,     // number
}
```

##### 📁 sections/imports/parts Collection

Stores parts import records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/imports/parts/{documentId}
{
  time:  value,     // timestamp

  batchNo        value,     // number
  by             value,     // string
  dataType       value,     // string
  time           value,     // number
}
```

##### 📁 sections/imports/sellParts Collection

Stores sell parts import records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/imports/sellParts/{documentId}
{
  time:  value,     // timestamp

  batchNo        value,     // number
  by             value,     // string
  dataType       value,     // string
  time           value,     // number
}
```

##### 📁 sections/imports/services Collection

Stores services import records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/imports/services/{documentId}
{
  time:  value,     // timestamp

  batchNo        value,     // number
  by             value,     // string
  dataType       value,     // string
  time           value,     // number
}
```

##### 📁 sections/imports/vehicleList Collection

Stores vehicle list import records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/imports/vehicleList/{documentId}
{
  time:  value,     // timestamp

  batchNo        value,     // number
  by             value,     // string
  dataType       value,     // string
  time           value,     // number
}
```

##### 📁 sections/imports/vehicles Collection

Stores vehicles import records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/imports/vehicles/{documentId}
{
  time:  value,     // timestamp

  batchNo        value,     // number
  by             value,     // string
  dataType       value,     // string
  time           value,     // number
}
```

#### 📁 sections/sales Subcollection

##### 📁 sections/sales/bookItems Collection

Stores booking item details.

_Sample size: Up to 100 latest documents_

```javascript
// sections/sales/bookItems/{documentId}
{
  bookItemId:  value,     // string

  _key           value,     // string
  bookId         value,     // string
  bookItemId     value,     // string
  detail         value,     // string
  engineNo       value,     // Array (empty)
  peripheralNo   value,     // Array (empty)
  productCode    value,     // string
  productName    value,     // string
  productType    value,     // null
  qty            value,     // number
  status         value,     // string
  total          value,     // number
  unitPrice      value,     // number
  vehicleNo      value,     // Array (empty)
  vehicleType    value,     // string
}
```

##### 📁 sections/sales/bookings Collection

Stores booking records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/sales/bookings/{documentId}
{
  created:  value,     // timestamp

  accountRecordedvalue,     // null
  additionalPurchasevalue,     // Array (empty)
  address        value,     // Address
  advInstallment value,     // number
  amtFull        value,     // number
  amtKBN         value,     // number
  amtMAX         value,     // number
  amtOldCustomer value,     // number
  amtPro         value,     // number
  amtReceived    value,     // number
  amtReferrer    value,     // number
  amtSKC         value,     // number
  amtTurnOver    value,     // number
  amtTurnOverDifRefundvalue,     // number
  amtTurnOverVehiclevalue,     // null
  assessment     value,     // Object
  bookId         value,     // string
  bookNo         value,     // string
  bookNo_lower   value,     // string
  bookNo_partial value,     // string
  bookPNo        value,     // string
  bookingPerson  value,     // string
  branchCode     value,     // string
  canceled       value,     // null
  created        value,     // number
  createdBy      value,     // string
  creditRecorded value,     // null
  customer       value,     // string
  customerId     value,     // string
  customerNo     value,     // string
  date           value,     // string
  deductOther    value,     // number
  deductOthers   value,     // Array (empty)
  depositor      value,     // null
  downPayment    value,     // number
  firstName      value,     // string
  firstName_lowervalue,     // string
  firstName_partialvalue,     // string
  giveaways      value,     // Array<Object>
  hasTurnOver    value,     // boolean
  isEquipment    value,     // boolean
  isNewCustomer  value,     // boolean
  isNewReferrer  value,     // boolean
  isUsed         value,     // boolean
  items          value,     // Array<Object>
  ivAdjusted     value,     // boolean
  keywords       value,     // Array<String>
  lastName       value,     // string
  oweKBNLeasing  value,     // number
  payments       value,     // Array (empty)
  phoneNumber    value,     // string
  prefix         value,     // string
  proMonth       value,     // string
  promotions     value,     // Array (empty)
  receiverEmployeevalue,     // string
  refNo          value,     // null
  referrer       value,     // Object
  referringDetailsvalue,     // Object
  remark         value,     // null
  saleCategory   value,     // string
  saleSubCategoryvalue,     // string
  saleType       value,     // string
  salesPerson    value,     // Array<String>
  sourceOfData   value,     // Array<String>
  status         value,     // string
  total          value,     // number
  turnOverCloseInstallmentvalue,     // null
  turnOverDocs   value,     // Array (empty)
  turnOverFix    value,     // boolean
  turnOverFixKBN value,     // null
  turnOverFixMAX value,     // null
  turnOverItems  value,     // Array (empty)
}
```

##### 📁 sections/sales/partGroups Collection

Stores part group categorization.

_Sample size: Up to 100 latest documents_

```javascript
// sections/sales/partGroups/{documentId}
{
  importTime:  value,     // timestamp

  AD_Discount    value,     // number
  AD_DiscountQty value,     // number
  SKCDiscount    value,     // number
  SKCDiscountQty value,     // number
  SKCLoyaltyDiscountvalue,     // number
  SKCLoyaltyDiscountAmtvalue,     // number
  SKCManualDiscountvalue,     // number
  SKCManualDiscountQtyvalue,     // number
  amtOilType     value,     // string
  amtPartType    value,     // string
  batchNo        value,     // number
  billDiscount   value,     // number
  billDiscountQtyvalue,     // number
  branchCode     value,     // string
  deposit        value,     // number
  discountCoupon value,     // number
  discountPointRedeemvalue,     // string
  importBy       value,     // string
  importTime     value,     // number
  item           value,     // number
  netDepositDeductvalue,     // number
  netTotal       value,     // string
  pointsReceived value,     // number
  redeemPoint    value,     // number
  saleDate       value,     // string
  saleNo         value,     // string
  sourceOfData   value,     // string
}
```

##### 📁 sections/sales/partItems Collection

Stores part item details.

_Sample size: Up to 100 latest documents_

```javascript
// sections/sales/partItems/{documentId}
{
  saleDate:  value,     // date string

  AD_Discount    value,     // string
  AD_DiscountPercentvalue,     // string
  AD_DiscountQty value,     // string
  Control Tower Disc Manual (Amt)value,     // string
  Kubota ID      value,     // string
  POS_No         value,     // string
  SKCDiscount    value,     // string
  SKCDiscountPercentvalue,     // string
  SKCDiscountQty value,     // string
  SKCLoyaltyDiscountvalue,     // string
  SKCLoyaltyDiscountAmtvalue,     // string
  SKCLoyaltyDiscountPercentvalue,     // string
  SKCManualDiscountvalue,     // string
  SKCManualDiscountPercentvalue,     // string
  SKCManualDiscountQtyvalue,     // string
  address        value,     // string
  amphoe         value,     // string
  amtOilType     value,     // number
  amtPartType    value,     // string
  batchNo        value,     // number
  billDiscount   value,     // string
  billDiscountPercentvalue,     // string
  billDiscountQtyvalue,     // string
  branch         value,     // string
  branchCode     value,     // string
  building       value,     // string
  cancelStatus   value,     // string
  customerId     value,     // string
  deposit        value,     // string
  discountGroup  value,     // string
  discountPointRedeemvalue,     // string
  employeeName   value,     // string
  engineNo       value,     // string
  firstName      value,     // string
  floor          value,     // string
  importBy       value,     // string
  importTime     value,     // number
  invoiceNumber  value,     // string
  item           value,     // number
  lastName       value,     // string
  marketingConsentvalue,     // string
  moo            value,     // string
  netDepositDeductvalue,     // number
  netTotal       value,     // string
  no_            value,     // number
  paymentTerms   value,     // string
  phoneNumber    value,     // string
  pointsReceived value,     // number
  postcode       value,     // string
  prefix         value,     // string
  productCode    value,     // string
  productName    value,     // string
  productType    value,     // string
  productTypeDescvalue,     // string
  province       value,     // string
  qty            value,     // number
  redeemPoint    value,     // string
  remark         value,     // string
  road           value,     // string
  room           value,     // string
  saleDate       value,     // string
  saleNo         value,     // string
  saleType       value,     // string
  shop           value,     // string
  shopCode       value,     // string
  skcEcouponAmt  value,     // string
  skcpartsdiscount20value,     // string
  skcpartsdiscountamount20value,     // string
  soi            value,     // string
  sourceOfData   value,     // string
  storeLocation  value,     // string
  storeLocationNamevalue,     // string
  tambol         value,     // string
  taxInvoice     value,     // string
  telephone      value,     // string
  unit           value,     // string
  unitPrice      value,     // number
  vehicleNo      value,     // string
  village        value,     // string
}
```

##### 📁 sections/sales/parts Collection

Stores parts sales records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/sales/parts/{documentId}
{
  saleDate:  value,     // date string

  address        value,     // Address
  batchNo        value,     // number
  branch         value,     // string
  branchCode     value,     // string
  employeeName   value,     // string
  engineNo       value,     // string
  firstName      value,     // string
  importBy       value,     // string
  importTime     value,     // number
  invoiceNumber  value,     // string
  lastName       value,     // string
  paymentTerms   value,     // string
  phoneNumber    value,     // string
  prefix         value,     // string
  saleDate       value,     // string
  saleNo         value,     // string
  saleType       value,     // string
  shop           value,     // string
  shopCode       value,     // string
  sourceOfData   value,     // string
  taxInvoice     value,     // string
  telephone      value,     // string
  vehicleNo      value,     // string
}
```

##### 📁 sections/sales/saleItems Collection

Stores sale item details.

_Sample size: Up to 100 latest documents_

```javascript
// sections/sales/saleItems/{documentId}
{
  saleDate:  value,     // date string

  _key           value,     // string
  bookId         value,     // string
  bookItemId     value,     // string
  branchCode     value,     // string
  detail         value,     // string
  engineNo       value,     // Array<String>
  isEquipment    value,     // boolean
  isUsed         value,     // boolean
  ivAdjusted     value,     // boolean
  peripheralNo   value,     // Array<String>
  productCode    value,     // string
  productName    value,     // string
  qty            value,     // number
  registered     value,     // null
  saleDate       value,     // string
  saleId         value,     // string
  saleItemId     value,     // string
  saleNo         value,     // string
  sourceOfData   value,     // Array (empty)
  status         value,     // string
  total          value,     // number
  unitPrice      value,     // number
  vehicleItemTypevalue,     // string
  vehicleNo      value,     // Array<String>
  vehicleType    value,     // string
}
```

##### 📁 sections/sales/salePartItems Collection

Stores sale part item details.

_Sample size: Up to 100 latest documents_

```javascript
// sections/sales/salePartItems/{documentId}
{
  saleDate:  value,     // date string

  _key           value,     // string
  branchCode     value,     // string
  detail         value,     // string
  discount       value,     // null
  ivAdjusted     value,     // boolean
  pCode          value,     // string
  partType       value,     // string
  productName    value,     // string
  qty            value,     // number
  registered     value,     // null
  saleDate       value,     // string
  saleId         value,     // string
  saleItemId     value,     // string
  saleNo         value,     // string
  status         value,     // string
  total          value,     // number
  unitPrice      value,     // number
}
```

##### 📁 sections/sales/vehicles Collection

Stores vehicle sales records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/sales/vehicles/{documentId}
{
  date:  value,     // date string

  accountRecordedvalue,     // null
  additionalPurchasevalue,     // Array (empty)
  address        value,     // Address
  advInstallment value,     // number
  amtBaacDebtor  value,     // null
  amtBaacFee     value,     // null
  amtDeposit     value,     // number
  amtFull        value,     // number
  amtKBN         value,     // number
  amtMAX         value,     // number
  amtOldCustomer value,     // number
  amtOther       value,     // number
  amtOthers      value,     // Array (empty)
  amtPlateAndInsurancevalue,     // number
  amtPro         value,     // number
  amtReceived    value,     // number
  amtReferrer    value,     // number
  amtReservation value,     // number
  amtSKC         value,     // number
  amtTurnOver    value,     // number
  amtTurnOverDifRefundvalue,     // number
  amtTurnOverVehiclevalue,     // null
  assessment     value,     // Object
  baacNo         value,     // null
  bookDate       value,     // string
  bookId         value,     // string
  bookNo         value,     // string
  bookNo_lower   value,     // string
  bookNo_partial value,     // string
  bookPNo        value,     // string
  bookingPerson  value,     // Array<String>
  branchCode     value,     // string
  canceled       value,     // null
  contractDate   value,     // string
  created        value,     // number
  createdBy      value,     // string
  creditRecorded value,     // null
  customer       value,     // string
  customerId     value,     // string
  customerNo     value,     // string
  date           value,     // string
  deductOther    value,     // number
  deductOthers   value,     // Array (empty)
  deliverDate    value,     // string
  depositPaymentsvalue,     // Array<Object>
  depositor      value,     // null
  downPayment    value,     // number
  engineNo       value,     // Array<String>
  firstName      value,     // string
  firstName_lowervalue,     // string
  firstName_partialvalue,     // string
  giveaways      value,     // Array<Object>
  guarantorDocs  value,     // Object
  guarantors     value,     // Array (empty)
  hasGuarantor   value,     // boolean
  hasReferrer    value,     // boolean
  hasTurnOver    value,     // boolean
  isEquipment    value,     // boolean
  isNewCustomer  value,     // boolean
  isNewReferrer  value,     // boolean
  isUsed         value,     // boolean
  items          value,     // Array<Object>
  ivAdjusted     value,     // Object
  keywords       value,     // Array<String>
  lastName       value,     // string
  model          value,     // Array<String>
  oweKBNLeasing  value,     // number
  oweKBNLeasings value,     // Object
  payments       value,     // Array<Object>
  phoneNumber    value,     // string
  prefix         value,     // string
  proMonth       value,     // string
  promotions     value,     // Array<Object>
  receiverEmployeevalue,     // string
  refNo          value,     // string
  referrer       value,     // Object
  referrerName   value,     // string
  referringDetailsvalue,     // Object
  registered     value,     // null
  remark         value,     // null
  reservationDepositorvalue,     // null
  saleCategory   value,     // string
  saleId         value,     // string
  saleNo         value,     // string
  saleNo_lower   value,     // string
  saleNo_partial value,     // string
  salePNo        value,     // string
  saleSubCategoryvalue,     // string
  saleType       value,     // string
  salesPerson    value,     // Array<String>
  sourceOfData   value,     // Array<String>
  status         value,     // string
  total          value,     // number
  turnOverCloseInstallmentvalue,     // null
  turnOverDocs   value,     // Array (empty)
  turnOverFix    value,     // boolean
  turnOverFixKBN value,     // null
  turnOverFixMAX value,     // null
  turnOverItems  value,     // Array (empty)
  vehicleNo      value,     // Array<String>
  vehicles       value,     // Array<Object>
  village        value,     // string
}
```

#### 📁 sections/services Subcollection

##### 📁 sections/services/gasCost Collection

Stores gas cost records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/services/gasCost/{documentId}
{
  date:  value,     // date string

  _key           value,     // string
  branchCode     value,     // string
  created        value,     // number
  date           value,     // string
  deleted        value,     // boolean
  destination    value,     // string
  distance       value,     // number
  gasCost        value,     // string
  inputBy        value,     // string
  meterEnd       value,     // string
  meterStart     value,     // string
  origin         value,     // string
  vehicleRegNumbervalue,     // string
}
```

##### 📁 sections/services/importServiceItems Collection

Stores imported service item records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/services/importServiceItems/{documentId}
{
  importTime:  value,     // timestamp

  SKCDiscountPricevalue,     // string
  batchNo        value,     // number
  categoryCode   value,     // string
  categoryDesc   value,     // string
  chargesCode    value,     // string
  dealerDiscountPricevalue,     // string
  description    value,     // string
  discountType   value,     // null
  importBy       value,     // string
  importTime     value,     // number
  item           value,     // string
  netPrice       value,     // string
  orderNo        value,     // string
  partType       value,     // string
  priceBeforeDiscountvalue,     // string
  qty            value,     // number
  reasonCode     value,     // string
  unit           value,     // string
  unitPrice      value,     // number
  warrantyCategoryvalue,     // string
}
```

##### 📁 sections/services/importServices Collection

Stores imported service records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/services/importServices/{documentId}
{
  docDate:  value,     // date string

  SKCDiscountPricevalue,     // number
  advisor        value,     // string
  advisorName    value,     // string
  batchNo        value,     // number
  branchCode     value,     // string
  branchName     value,     // string
  causeCode      value,     // null
  causeCodeDesc  value,     // null
  customerCode   value,     // string
  customerName   value,     // string
  dealerDiscountPricevalue,     // number
  discountType   value,     // null
  docDate        value,     // string
  engineNo       value,     // string
  freights       value,     // number
  importBy       value,     // string
  importTime     value,     // number
  jobCloseDate   value,     // string
  model          value,     // string
  netPrice       value,     // number
  oilBeforeDiscountvalue,     // number
  oilDealerDiscountvalue,     // number
  oilSKCDiscount value,     // number
  oilSum         value,     // Array (empty)
  oils           value,     // number
  orderNo        value,     // string
  orderReason    value,     // string
  orderStatus    value,     // string
  orderType      value,     // string
  orderTypeDesc  value,     // string
  others         value,     // number
  partBeforeDiscountvalue,     // number
  partDealerDiscountvalue,     // number
  partSKCDiscountvalue,     // number
  parts          value,     // number
  percentDiscountvalue,     // number
  priceBeforeDiscountvalue,     // number
  productName    value,     // string
  saleDate       value,     // string
  serviceStatus  value,     // string
  serviceTechnicianvalue,     // Array<String>
  travels        value,     // number
  vehicleModel   value,     // string
  vehicleNo      value,     // string
  wages          value,     // number
  workHour       value,     // number
}
```

##### 📁 sections/services/serviceClose Collection

Stores service close records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/services/serviceClose/{documentId}
{
  approvedDate:  value,     // date string

  CF4_3          value,     // number
  CF4_6          value,     // number
  UDT_18         value,     // number
  UDT_6          value,     // number
  VAT            value,     // number
  advance        value,     // number
  amtAllParts    value,     // number
  amtBlackGlue   value,     // number
  amtFreight     value,     // number
  amtOil         value,     // number
  amtOther       value,     // number
  amtPart        value,     // number
  amtWage        value,     // number
  approvedDate   value,     // string
  approvedTime   value,     // string
  approver       value,     // string
  branchCode     value,     // string
  cash           value,     // number
  cause          value,     // string
  corrective     value,     // string
  created        value,     // number
  createdBy      value,     // string
  customer       value,     // string
  customerApprovedDatevalue,     // string
  customerApprovedTimevalue,     // string
  customerSignedDatevalue,     // string
  customerSignedTimevalue,     // string
  discount       value,     // number
  discountBlackGluevalue,     // number
  discountCouponPercentvalue,     // number
  discountOil    value,     // number
  discountOther  value,     // number
  discountPart   value,     // number
  items          value,     // Array<Object>
  keywords       value,     // Array<String>
  model          value,     // null
  moneyTransfer  value,     // number
  notFound       value,     // boolean
  orderStatus    value,     // string
  payments       value,     // Array<Object>
  recordedDate   value,     // string
  refDoc         value,     // Address
  returnTotal    value,     // number
  serviceAddress value,     // Address
  serviceDate    value,     // string
  serviceId      value,     // string
  serviceNo      value,     // string
  serviceNo_lowervalue,     // string
  serviceNo_partialvalue,     // string
  serviceTime    value,     // string
  serviceType    value,     // string
  servicer       value,     // string
  status         value,     // string
  technicianId   value,     // Array<String>
  times          value,     // number
  total          value,     // number
  totalBeforeVat value,     // number
  vehicleRegNumbervalue,     // string
  vehicleType    value,     // string
  warrantyStatus value,     // string
}
```

##### 📁 sections/services/serviceCloseItems Collection

Stores service close item details.

_Sample size: Up to 100 latest documents_

```javascript
// sections/services/serviceCloseItems/{documentId}
{
  serviceItemId:  value,     // string

  FOC            value,     // boolean
  WR             value,     // boolean
  _key           value,     // string
  advance        value,     // number
  description    value,     // string
  discount       value,     // number
  discountCouponPercentvalue,     // number
  id             value,     // number
  item           value,     // string
  key            value,     // number
  qty            value,     // number
  returnDiscount value,     // null
  returnQty      value,     // null
  returnTotal    value,     // null
  serviceCode    value,     // string
  serviceId      value,     // string
  serviceItemId  value,     // string
  serviceItemTypevalue,     // string
  status         value,     // string
  total          value,     // number
  unit           value,     // null
  unitPrice      value,     // string
}
```

##### 📁 sections/services/serviceItems Collection

Stores service item details.

_Sample size: Up to 100 latest documents_

```javascript
// sections/services/serviceItems/{documentId}
{
  serviceItemId:  value,     // string

  FOC            value,     // boolean
  WR             value,     // boolean
  _key           value,     // string
  description    value,     // string
  discount       value,     // number
  discountCouponPercentvalue,     // number
  id             value,     // number
  item           value,     // string
  key            value,     // number
  qty            value,     // number
  serviceCode    value,     // string
  serviceId      value,     // string
  serviceItemId  value,     // string
  serviceItemTypevalue,     // string
  status         value,     // string
  total          value,     // number
  unit           value,     // null
  unitPrice      value,     // string
}
```

##### 📁 sections/services/serviceOrders Collection

Stores service order records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/services/serviceOrders/{documentId}
{
  date:  value,     // date string

  address        value,     // Address
  appointmentDatevalue,     // string
  appointmentTimevalue,     // string
  assigner       value,     // string
  boughDate      value,     // string
  branchCode     value,     // string
  closedDate     value,     // string
  contact        value,     // Object
  created        value,     // number
  createdBy      value,     // string
  customerId     value,     // string
  date           value,     // string
  dealer         value,     // string
  discount       value,     // number
  discountCouponPercentvalue,     // number
  engineNo       value,     // Array<String>
  firstName      value,     // string
  firstName_lowervalue,     // string
  firstName_partialvalue,     // string
  guaranteedEndDatevalue,     // string
  hoursOfUse     value,     // string
  items          value,     // Array<Object>
  keywords       value,     // Array<String>
  lastName       value,     // string
  lastName_lower value,     // string
  lastName_partialvalue,     // string
  notifiedBy     value,     // string
  notifyChannel  value,     // null
  notifyDate     value,     // string
  notifyDetails  value,     // string
  orderStatus    value,     // string
  peripheralNo   value,     // Array<String>
  peripheralPCodevalue,     // string
  phoneNumber    value,     // string
  prefix         value,     // string
  productPCode   value,     // string
  redo           value,     // boolean
  sameAddress    value,     // boolean
  sameName       value,     // boolean
  serviceAddress value,     // Address
  serviceId      value,     // string
  serviceNo      value,     // string
  serviceNo_lowervalue,     // string
  serviceNo_partialvalue,     // string
  serviceType    value,     // string
  status         value,     // string
  technicianId   value,     // Array<String>
  times          value,     // number
  total          value,     // number
  urgency        value,     // null
  vehicleNo      value,     // Array<String>
  vehicleType    value,     // string
  warrantyStatus value,     // string
}
```

#### 📁 sections/stocks Subcollection

##### 📁 sections/stocks/importLog Collection

Stores import log records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/stocks/importLog/{documentId}
{
  ts:  value,     // timestamp

  batchNo        value,     // number
  dataType       value,     // string
  ts             value,     // string
}
```

##### 📁 sections/stocks/importPartItems Collection

Stores imported part item details.

_Sample size: Up to 100 latest documents_

```javascript
// sections/stocks/importPartItems/{documentId}
{
  docDate:  value,     // date string

  balance        value,     // number
  batchNo        value,     // number
  branch         value,     // string
  branchCode     value,     // string
  docDate        value,     // string
  docNo          value,     // string
  export         value,     // string
  import         value,     // number
  importBy       value,     // string
  importTime     value,     // number
  item           value,     // string
  itemNo         value,     // string
  movementType   value,     // string
  peripheralNo   value,     // string
  productCode    value,     // string
  productName    value,     // string
  receiveBranch  value,     // string
  remark         value,     // string
  startBalance   value,     // number
  storeLocation  value,     // string
  storePoint     value,     // string
  transferBranchCodevalue,     // string
  transferDocNo  value,     // string
  transferLocationCodevalue,     // string
  unit           value,     // string
}
```

##### 📁 sections/stocks/importParts Collection

Stores imported parts records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/stocks/importParts/{documentId}
{
  docDate:  value,     // date string

  POS_No         value,     // string
  accountChecked value,     // null
  accountCheckedByvalue,     // null
  accountCheckedDatevalue,     // null
  balance        value,     // number
  batchNo        value,     // number
  billNoSKC      value,     // string
  branch         value,     // string
  branchCode     value,     // string
  brand          value,     // string
  discount       value,     // null
  docDate        value,     // string
  docNo          value,     // string
  export         value,     // string
  hp             value,     // string
  import         value,     // number
  importBy       value,     // string
  importTime     value,     // number
  inputBy        value,     // string
  inputDate      value,     // string
  inputTime      value,     // string
  invoiceDate    value,     // string
  item           value,     // string
  itemNo         value,     // string
  keywords       value,     // Array<String>
  model          value,     // string
  movementType   value,     // string
  order          value,     // null
  pCode          value,     // string
  peripheralNo   value,     // string
  priceType      value,     // null
  productCode    value,     // string
  productName    value,     // string
  purchaseNo     value,     // string
  receiveBranch  value,     // string
  seller         value,     // string
  startBalance   value,     // string
  storeLocation  value,     // string
  storeLocationCodevalue,     // string
  storePoint     value,     // string
  total          value,     // null
  transactionDatevalue,     // string
  transferBranchCodevalue,     // string
  transferDocNo  value,     // string
  transferLocationCodevalue,     // string
  typeCode       value,     // string
  unit           value,     // string
  unitPrice      value,     // null
  userName       value,     // string
  warehouseCheckedvalue,     // number
  warehouseCheckedByvalue,     // string
  warehouseCheckedDatevalue,     // string
  warehouseInputByvalue,     // string
  warehouseReceiveDatevalue,     // string
  ปีเอกสารอ้างอิงvalue,     // string
  ยกเลิก         value,     // string
  เอกสารอ้างอิง  value,     // string
  ใบสั่ง VSS     value,     // string
}
```

##### 📁 sections/stocks/importVehicleItems Collection

Stores imported vehicle item details.

_Sample size: Up to 100 latest documents_

```javascript
// sections/stocks/importVehicleItems/{documentId}
{
  docDate:  value,     // date string

  balance        value,     // number
  batchNo        value,     // number
  branch         value,     // string
  branchCode     value,     // string
  docDate        value,     // string
  docNo          value,     // string
  export         value,     // string
  import         value,     // number
  importBy       value,     // string
  importTime     value,     // number
  item           value,     // string
  itemNo         value,     // string
  movementType   value,     // string
  peripheralNo   value,     // string
  productCode    value,     // string
  productName    value,     // string
  receiveBranch  value,     // string
  remark         value,     // string
  startBalance   value,     // string
  storeLocation  value,     // string
  transferBranchCodevalue,     // string
  transferDocNo  value,     // string
  transferLocationCodevalue,     // string
  unit           value,     // string
  vehicleNo      value,     // string
}
```

##### 📁 sections/stocks/importVehicles Collection

Stores imported vehicles records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/stocks/importVehicles/{documentId}
{
  docDate:  value,     // date string

  accountChecked value,     // null
  accountCheckedByvalue,     // null
  accountCheckedDatevalue,     // null
  balance        value,     // number
  batchNo        value,     // number
  billNoSKC      value,     // string
  branch         value,     // string
  branchCode     value,     // string
  brand          value,     // string
  discount       value,     // null
  docDate        value,     // string
  docNo          value,     // string
  engineNo       value,     // string
  export         value,     // string
  hp             value,     // string
  import         value,     // number
  importBy       value,     // string
  importTime     value,     // number
  inputBy        value,     // string
  inputDate      value,     // string
  inputTime      value,     // string
  invoiceDate    value,     // null
  item           value,     // string
  itemNo         value,     // string
  keywords       value,     // Array<String>
  model          value,     // string
  movementType   value,     // string
  order          value,     // null
  peripheralNo   value,     // string
  priceType      value,     // null
  productCode    value,     // string
  productName    value,     // string
  purchaseNo     value,     // string
  receiveBranch  value,     // string
  seller         value,     // null
  startBalance   value,     // string
  storeLocation  value,     // string
  storeLocationCodevalue,     // string
  total          value,     // null
  transactionDatevalue,     // string
  transferBranchCodevalue,     // string
  transferDocNo  value,     // string
  transferLocationCodevalue,     // string
  typeCode       value,     // string
  unit           value,     // string
  unitPrice      value,     // null
  userName       value,     // string
  vehicleNo      value,     // string
  warehouseCheckedvalue,     // null
  warehouseCheckedByvalue,     // null
  warehouseCheckedDatevalue,     // null
  warehouseReceiveDatevalue,     // null
  ปีเอกสารอ้างอิงvalue,     // string
  ยกเลิก         value,     // string
  เอกสารอ้างอิง  value,     // string
  ใบสั่ง VSS     value,     // string
}
```

##### 📁 sections/stocks/importVehicles_new Collection

Stores updated imported vehicles records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/stocks/importVehicles_new/{documentId}
{
  // Fields would be here
}
```

##### 📁 sections/stocks/otherVehicleIn Collection

Stores other vehicle in records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/stocks/otherVehicleIn/{documentId}
{
  importDate:  value,     // date string

  approvedBy     value,     // null
  approvedDate   value,     // null
  completed      value,     // boolean
  created        value,     // number
  customer       value,     // null
  customerId     value,     // null
  deleted        value,     // boolean
  deliveredBy    value,     // string
  deliveredDate  value,     // string
  docNo          value,     // string
  docNo_lower    value,     // string
  docNo_partial  value,     // string
  importDate     value,     // string
  importId       value,     // string
  inputBy        value,     // string
  isUsed         value,     // boolean
  items          value,     // Array<Object>
  keywords       value,     // Array<String>
  origin         value,     // string
  receivedBy     value,     // string
  receivedDate   value,     // string
  recordedBy     value,     // string
  recordedDate   value,     // string
  rejected       value,     // boolean
  remark         value,     // null
  saleId         value,     // null
  saleNo         value,     // null
  subType        value,     // string
  toDestination  value,     // string
  transferType   value,     // string
  verifiedBy     value,     // string
  verifiedDate   value,     // string
}
```

##### 📁 sections/stocks/otherVehicleOut Collection

Stores other vehicle out records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/stocks/otherVehicleOut/{documentId}
{
  deliveredDate:  value,     // date string

  approvedBy     value,     // null
  approvedDate   value,     // null
  branchCode     value,     // string
  completed      value,     // boolean
  created        value,     // number
  deleted        value,     // boolean
  deliveredBy    value,     // string
  deliveredDate  value,     // string
  destination    value,     // string
  docNo          value,     // string
  docNo_lower    value,     // string
  docNo_partial  value,     // string
  exportDate     value,     // string
  exportId       value,     // string
  exportRecordedByvalue,     // string
  exportRecordedDatevalue,     // string
  exportVerifiedByvalue,     // string
  exportVerifiedDatevalue,     // string
  fromOrigin     value,     // string
  importDate     value,     // null
  inputBy        value,     // string
  isUsed         value,     // boolean
  items          value,     // Array<Object>
  keywords       value,     // Array<String>
  receivedBy     value,     // string
  receivedDate   value,     // string
  rejected       value,     // boolean
  remark         value,     // null
  transferType   value,     // string
}
```

##### 📁 sections/stocks/peripherals Collection

Stores peripheral item records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/stocks/peripherals/{documentId}
{
  docNo:  value,     // string

  branchCode     value,     // string
  docNo          value,     // string
  keywords       value,     // Array<String>
  peripheralModelvalue,     // string
  peripheralNo   value,     // string
  peripheralNoFullvalue,     // string
  peripheralNo_lowervalue,     // string
  peripheralNo_partialvalue,     // string
  productCode    value,     // string
  productName    value,     // string
  productPCode   value,     // string
  productType    value,     // string
  reserved       value,     // null
  sold           value,     // null
}
```

##### 📁 sections/stocks/purchasePlan Collection

Stores purchase plan records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/stocks/purchasePlan/{documentId}
{
  date:  value,     // date string

  _key           value,     // string
  branchCode     value,     // string
  created        value,     // number
  date           value,     // string
  deleted        value,     // boolean
  inputBy        value,     // string
  month          value,     // string
  productCode    value,     // string
  productName    value,     // string
  productType    value,     // string
  qty            value,     // number
  recordedBy     value,     // string
  remark         value,     // null
}
```

##### 📁 sections/stocks/saleOut Collection

Stores sale out records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/stocks/saleOut/{documentId}
{
  date:  value,     // date string

  address        value,     // Address
  approvedBy     value,     // string
  approvedDate   value,     // string
  bookId         value,     // string
  branchCode     value,     // string
  canceled       value,     // boolean
  completed      value,     // boolean
  created        value,     // number
  customer       value,     // string
  customerId     value,     // string
  date           value,     // string
  deleted        value,     // boolean
  deliverId      value,     // string
  deliveredBy    value,     // string
  deliveredDate  value,     // string
  docNo          value,     // string
  docNo_lower    value,     // string
  docNo_partial  value,     // string
  docPNo         value,     // string
  giveaways      value,     // Array<Object>
  inputBy        value,     // string
  isUsed         value,     // boolean
  items          value,     // Array<Object>
  keywords       value,     // Array<String>
  phoneNumber    value,     // string
  receivedBy     value,     // string
  receivedDate   value,     // string
  recordedBy     value,     // string
  recordedDate   value,     // string
  rejected       value,     // boolean
  remark         value,     // null
  saleDate       value,     // string
  saleId         value,     // string
  saleNo         value,     // string
  saleType       value,     // string
  salesPerson    value,     // Array<String>
  transferType   value,     // string
  turnOverItems  value,     // Array (empty)
  verifiedBy     value,     // string
  verifiedDate   value,     // string
}
```

##### 📁 sections/stocks/saleOutItems Collection

Stores sale out item details.

_Sample size: Up to 100 latest documents_

```javascript
// sections/stocks/saleOutItems/{documentId}
{
  date:  value,     // date string

  _key           value,     // string
  branchCode     value,     // string
  bucketNo       value,     // Array (empty)
  cancelled      value,     // null
  completed      value,     // null
  created        value,     // number
  date           value,     // string
  deleted        value,     // null
  deliverId      value,     // string
  deliverItemId  value,     // string
  docNo          value,     // string
  engineNo       value,     // Array (empty)
  exportType     value,     // string
  giveaways      value,     // Array (empty)
  peripheralNo   value,     // Array<String>
  pressureBladeNovalue,     // Array (empty)
  productCode    value,     // string
  productName    value,     // string
  qty            value,     // number
  recordedBy     value,     // string
  rejected       value,     // null
  remark         value,     // null
  saleDate       value,     // string
  saleId         value,     // string
  saleItemId     value,     // string
  saleNo         value,     // string
  sugarcanePickerNovalue,     // Array (empty)
  toDestination  value,     // null
  vehicleNo      value,     // Array (empty)
}
```

##### 📁 sections/stocks/transfer Collection

Stores transfer records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/stocks/transfer/{documentId}
{
  deliveredDate:  value,     // date string

  approvedBy     value,     // null
  approvedDate   value,     // null
  branchCode     value,     // string
  cancelled      value,     // null
  completed      value,     // null
  created        value,     // number
  deleted        value,     // null
  deliveredBy    value,     // string
  deliveredDate  value,     // string
  docNo          value,     // string
  docNo_lower    value,     // string
  docNo_partial  value,     // string
  exportDate     value,     // string
  exportRecordedByvalue,     // string
  exportRecordedDatevalue,     // string
  exportVerifiedByvalue,     // string
  exportVerifiedDatevalue,     // string
  fromOrigin     value,     // string
  importDate     value,     // null
  importRecordedByvalue,     // null
  importRecordedDatevalue,     // null
  importVerifiedByvalue,     // null
  importVerifiedDatevalue,     // null
  inputBy        value,     // string
  isUsed         value,     // boolean
  items          value,     // Array<Object>
  keywords       value,     // Array<String>
  receivedBy     value,     // string
  receivedDate   value,     // string
  rejected       value,     // null
  remark         value,     // null
  toDestination  value,     // string
  transferId     value,     // string
  transferType   value,     // string
}
```

##### 📁 sections/stocks/transferIn Collection

Stores transfer in records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/stocks/transferIn/{documentId}
{
  date:  value,     // date string

  branchCode     value,     // string
  completed      value,     // Object
  created        value,     // number
  date           value,     // string
  deleted        value,     // boolean
  deliveredBy    value,     // string
  docNo          value,     // string
  docNo_lower    value,     // string
  docNo_partial  value,     // string
  exportVerifiedByvalue,     // string
  fromOrigin     value,     // string
  inputBy        value,     // string
  items          value,     // Array<Object>
  keywords       value,     // Array<String>
  month          value,     // string
  recordedBy     value,     // string
  remark         value,     // null
  transferId     value,     // string
  transferType   value,     // string
  verifiedBy     value,     // string
}
```

##### 📁 sections/stocks/transferItems Collection

Stores transfer item details.

_Sample size: Up to 100 latest documents_

```javascript
// sections/stocks/transferItems/{documentId}
{
  exportDate:  value,     // date string

  branchCode     value,     // string
  cancelled      value,     // null
  completed      value,     // null
  deleted        value,     // null
  deliveredBy    value,     // string
  detail         value,     // string
  docNo          value,     // string
  docNo_lower    value,     // string
  engineNo       value,     // Array<String>
  exportDate     value,     // string
  exportRecordedByvalue,     // string
  exportVerifiedByvalue,     // string
  fromOrigin     value,     // string
  id             value,     // number
  importDate     value,     // null
  isUsed         value,     // boolean
  key            value,     // number
  model          value,     // string
  peripheralNo   value,     // Array<String>
  productCode    value,     // string
  productName    value,     // string
  qty            value,     // number
  receivedBy     value,     // string
  rejected       value,     // null
  toDestination  value,     // string
  transferId     value,     // string
  transferItemId value,     // string
  vehicleItemTypevalue,     // string
  vehicleNo      value,     // Array<String>
  vehicleType    value,     // string
}
```

##### 📁 sections/stocks/transferOut Collection

Stores transfer out records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/stocks/transferOut/{documentId}
{
  date:  value,     // date string

  branchCode     value,     // string
  completed      value,     // Object
  created        value,     // number
  date           value,     // string
  deleted        value,     // boolean
  deliveredBy    value,     // string
  docNo          value,     // string
  docNo_lower    value,     // string
  docNo_partial  value,     // string
  inputBy        value,     // string
  items          value,     // Array<Object>
  keywords       value,     // Array<String>
  month          value,     // string
  qty            value,     // number
  recordedBy     value,     // string
  remark         value,     // null
  toDestination  value,     // string
  transferId     value,     // string
  transferType   value,     // string
  verifiedBy     value,     // string
}
```

##### 📁 sections/stocks/vehicles Collection

Stores vehicle inventory records.

_Sample size: Up to 100 latest documents_

```javascript
// sections/stocks/vehicles/{documentId}
{
  docNo:  value,     // string

  auction        value,     // null
  baac           value,     // null
  branchCode     value,     // string
  decal          value,     // null
  decalTaken     value,     // null
  docNo          value,     // string
  engineNo       value,     // null
  exported       value,     // null
  isFIFO         value,     // boolean
  isUsed         value,     // boolean
  isVehicle      value,     // boolean
  kbnLeasing     value,     // null
  keywords       value,     // Array<String>
  model          value,     // string
  peripheralNo   value,     // string
  peripheralNoFullvalue,     // string
  peripheralNo_lowervalue,     // string
  peripheralNo_partialvalue,     // string
  productCode    value,     // string
  productName    value,     // string
  productPCode   value,     // string
  productType    value,     // string
  reserved       value,     // null
  seize          value,     // null
  skl            value,     // null
  sold           value,     // null
  transactions   value,     // Array<Object>
  transfer       value,     // null
  turnOver       value,     // null
  vehicleNo      value,     // string
  vehicleNoFull  value,     // string
  vehicleNo_lowervalue,     // string
  vehicleNo_partialvalue,     // string
  wreck          value,     // null
}
```

## 🔄 Relationships and References

Based on the schema analysis, the following relationships are detected:

- `data/account/expenseNames` references `data/account/expenseCategory` through `expenseCategoryId` field
- `sections/services/serviceCloseItems` likely references `sections/services/serviceItems` through `serviceItemId` field
- `data/company/branches` has a relationship with `data/company/employees` through branch assignments
- `data/company/departments` has a relationship with `data/company/employees` through department assignments
- `data/company/permissions` is related to `data/company/permissionCategories` through category assignment
- `data/company/userGroups` likely has a relationship with permissions and employees

---

## 📝 Data Management Considerations

### Indexing Recommendations

Based on field usage patterns, consider these indexing strategies:

- `messageTokens.updatedAt`: For filtering messageTokens by updatedAt
- `messages.type`: For filtering messages by type
- `data/company/employees.created`: For filtering and sorting employees by creation date
- `sections/sales/bookings.created`: For filtering and sorting bookings by creation date
- `sections/stocks/importVehicles.docDate`: For date-based filtering of vehicle imports
- `sections/services/serviceItems.serviceItemId`: For quick lookups of service items

### Security Rule Considerations

Consider implementing these security rules for your collections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isUserWithRole(role) {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Add rules for your collections based on their content and access patterns

    match /changeLogs/{docId} {
      allow read: if isAuthenticated();
      allow write: if isUserWithRole('ADMIN');
    }
    match /data/{docId} {
      allow read: if isAuthenticated();
      allow write: if isUserWithRole('ADMIN');
    }
    match /messageTokens/{docId} {
      allow read: if isAuthenticated();
      allow write: if isUserWithRole('ADMIN');
    }
    match /messages/{docId} {
      allow read: if isAuthenticated();
      allow write: if isUserWithRole('ADMIN');
    }
    match /reports/{docId} {
      allow read: if isAuthenticated();
      allow write: if isUserWithRole('ADMIN');
    }
    match /sections/{docId} {
      allow read: if isAuthenticated();
      allow write: if isUserWithRole('ADMIN');
    }
  }
}
```

---

## 🔗 Related Documentation

- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Authentication Flow](/Users/arsomjin/Documents/Projects/KBN/kbn/docs/authentication-flow.md)
- [API Integration](/Users/arsomjin/Documents/Projects/KBN/kbn/docs/api-integration.md)
- [Roles and Permissions](/Users/arsomjin/Documents/Projects/KBN/kbn/docs/roles-and-permissions.md)

> This documentation was automatically generated from your Firestore database structure on 5/1/2025.
