# Multi-Province Migration Guide

This document provides guidance on migrating the KBN platform from a single-province architecture to multi-province support. It helps GitHub Copilot understand the migration process and required changes.

## Migration Overview

The KBN platform is being extended to support multiple provinces, each with its own hierarchy of branches. This migration involves:

1. Schema updates to include province references
2. UI changes to support province selection
3. Permission system enhancements for province-level access control
4. Data migration to assign existing data to a default province

## Schema Changes

### New Fields
All operational data documents need a `provinceId` field:

```typescript
interface BaseDocument {
  // Existing fields
  id: string;
  branchCode: string;
  created: number;
  inputBy: string;
  
  // New field
  provinceId: string; // Reference to the province
}
```

### New Collection
A new `provinces` collection has been added:

```typescript
interface Province {
  provinceId: string;
  name: string;
  code: string;
  region: string;
  active: boolean;
  created: number;
  inputBy: string;
}
```

### Updated User Schema
User documents now include province access information:

```typescript
interface User {
  // Existing fields
  uid: string;
  email: string;
  role: UserRole;
  
  // New fields
  provinceId: string; // Primary province
  accessibleProvinces: {
    [provinceId: string]: boolean; // All provinces this user can access
  };
}
```

## Authentication and Permission Changes

### Updated Context Provider

```tsx
export const AuthProvider: React.FC = ({ children }) => {
  // Existing state
  const [user, setUser] = useState<User | null>(null);
  
  // New state for province management
  const [currentProvinceId, setCurrentProvinceId] = useState<string | null>(null);
  const [accessibleProvinces, setAccessibleProvinces] = useState<Province[]>([]);
  
  // Logic to determine accessible provinces based on user role
  useEffect(() => {
    if (!user) return;
    
    const fetchProvinces = async () => {
      // For admin users, fetch all provinces
      if (["GENERAL_MANAGER", "SUPER_ADMIN", "DEVELOPER"].includes(user.role)) {
        const provinces = await getAllProvinces();
        setAccessibleProvinces(provinces);
      } 
      // For general managers, fetch provinces they're assigned to
      else if (user.role === "GENERAL_MANAGER" && user.accessibleProvinces) {
        const provinceIds = Object.keys(user.accessibleProvinces).filter(
          id => user.accessibleProvinces[id] === true
        );
        const provinces = await getProvincesByIds(provinceIds);
        setAccessibleProvinces(provinces);
      } 
      // For other roles, just get their single province
      else if (user.provinceId) {
        const province = await getProvinceById(user.provinceId);
        if (province) setAccessibleProvinces([province]);
      }
      
      // Set current province to user's primary province or first accessible
      if (user.provinceId) {
        setCurrentProvinceId(user.provinceId);
      } else if (accessibleProvinces.length > 0) {
        setCurrentProvinceId(accessibleProvinces[0].provinceId);
      }
    };
    
    fetchProvinces();
  }, [user]);
  
  // Other existing logic
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        // Existing values
        
        // New values
        currentProvinceId,
        setCurrentProvinceId,
        accessibleProvinces,
        hasProvinceAccess: (provinceId) => {
          if (!user) return false;
          if (["GENERAL_MANAGER", "SUPER_ADMIN", "DEVELOPER"].includes(user.role)) return true;
          if (user.role === "GENERAL_MANAGER" && user.accessibleProvinces) {
            return user.accessibleProvinces[provinceId] === true;
          }
          return user.provinceId === provinceId;
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

## UI Components

### Province Selector Component

```tsx
import React from "react";
import { Select } from "antd";
import { useAuth } from "../hooks/useAuth";

interface ProvinceSelectorProps {
  onChange?: (provinceId: string) => void;
  disabled?: boolean;
}

export const ProvinceSelector: React.FC<ProvinceSelectorProps> = ({ 
  onChange,
  disabled = false
}) => {
  const { currentProvinceId, setCurrentProvinceId, accessibleProvinces } = useAuth();
  
  const handleChange = (value: string) => {
    setCurrentProvinceId(value);
    if (onChange) onChange(value);
  };
  
  return (
    <Select
      value={currentProvinceId || undefined}
      onChange={handleChange}
      disabled={disabled || accessibleProvinces.length <= 1}
      style={{ minWidth: 150 }}
      placeholder="Select Province"
    >
      {accessibleProvinces.map(province => (
        <Select.Option key={province.provinceId} value={province.provinceId}>
          {province.name}
        </Select.Option>
      ))}
    </Select>
  );
};
```

### Adding to Layouts

```tsx
import React from "react";
import { Layout, Menu, Avatar } from "antd";
import { ProvinceSelector } from "../components/ProvinceSelector";

const { Header } = Layout;

export const DashboardLayout: React.FC = ({ children }) => {
  return (
    <Layout>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]}>
          {/* Menu items */}
        </Menu>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
          <ProvinceSelector />
          <Avatar style={{ marginLeft: 16 }} />
        </div>
      </Header>
      <Layout.Content>
        {children}
      </Layout.Content>
      <Layout.Footer>Footer</Layout.Footer>
    </Layout>
  );
};
```

## Data Migration Strategy

### Migration Hook

```typescript
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../firebase";

export const useMigrateToMultiProvince = (defaultProvinceId: string) => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const migrateCollection = async (collectionPath: string): Promise<number> => {
    const collectionRef = collection(db, collectionPath);
    const q = query(collectionRef, where("provinceId", "==", null));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return 0;
    
    let batch = writeBatch(db);
    let count = 0;
    let totalProcessed = 0;
    
    snapshot.forEach(doc => {
      batch.update(doc.ref, { provinceId: defaultProvinceId });
      count++;
      totalProcessed++;
      
      // Firebase batch has a limit of 500 operations
      if (count >= 450) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    });
    
    if (count > 0) {
      await batch.commit();
    }
    
    return totalProcessed;
  };
  
  const migrateData = async () => {
    try {
      setIsMigrating(true);
      setError(null);
      setProgress(0);
      
      // Define collections to migrate
      const collections = [
        "data/sales/customers",
        "data/company/branches",
        "sections/sales/vehicles",
        "sections/sales/parts",
        // Add all other collections
      ];
      
      let totalProcessed = 0;
      
      for (let i = 0; i < collections.length; i++) {
        const processed = await migrateCollection(collections[i]);
        totalProcessed += processed;
        setProgress(Math.round(((i + 1) / collections.length) * 100));
      }
      
      console.log(`Migration completed: ${totalProcessed} documents updated`);
    } catch (err) {
      console.error("Migration failed:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsMigrating(false);
    }
  };
  
  return { migrateData, isMigrating, progress, error };
};
```

### Migration UI

```tsx
import React from "react";
import { Button, Card, Progress, Alert, Typography } from "antd";
import { useMigrateToMultiProvince } from "../hooks/useMigrateToMultiProvince";

const { Title, Text } = Typography;

export const DataMigrationScreen: React.FC = () => {
  const defaultProvinceId = "province-001"; // Your default province ID
  const { migrateData, isMigrating, progress, error } = useMigrateToMultiProvince(defaultProvinceId);
  
  return (
    <Card title="Multi-Province Data Migration" style={{ maxWidth: 600, margin: "0 auto" }}>
      <Title level={4}>Migrate Existing Data to Multi-Province Structure</Title>
      <Text>
        This process will update all existing records to include the default province ID.
        This is a necessary step for enabling multi-province support.
      </Text>
      
      {error && (
        <Alert 
          message="Migration Error" 
          description={error.message}
          type="error" 
          style={{ margin: "16px 0" }} 
        />
      )}
      
      {isMigrating && (
        <div style={{ margin: "24px 0" }}>
          <Progress percent={progress} status="active" />
          <Text>Migration in progress... ({progress}% complete)</Text>
        </div>
      )}
      
      <Button 
        type="primary" 
        onClick={migrateData} 
        loading={isMigrating}
        disabled={isMigrating}
        style={{ marginTop: 16 }}
      >
        Start Migration
      </Button>
    </Card>
  );
};
```

## Query Pattern Updates

### Before Migration
```typescript
// Get all customers for the current branch
const getCustomers = async (branchCode: string) => {
  const customersRef = collection(db, "data", "sales", "customers");
  const q = query(
    customersRef,
    where("branchCode", "==", branchCode),
    where("deleted", "==", false)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

### After Migration
```typescript
// Get all customers for the current branch AND province
const getCustomers = async (branchCode: string, provinceId: string) => {
  const customersRef = collection(db, "data", "sales", "customers");
  const q = query(
    customersRef,
    where("branchCode", "==", branchCode),
    where("provinceId", "==", provinceId),
    where("deleted", "==", false)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

## Handling Data Creation

### Before Migration
```typescript
const createCustomer = async (customerData) => {
  const customersRef = collection(db, "data", "sales", "customers");
  const newCustomerRef = doc(customersRef);
  
  await setDoc(newCustomerRef, {
    ...customerData,
    customerId: newCustomerRef.id,
    created: Date.now(),
    inputBy: currentUser.uid,
    branchCode: currentUser.branchCode,
    deleted: false,
    keywords: generateKeywords(customerData)
  });
  
  return newCustomerRef.id;
};
```

### After Migration
```typescript
const createCustomer = async (customerData, provinceId) => {
  const customersRef = collection(db, "data", "sales", "customers");
  const newCustomerRef = doc(customersRef);
  
  await setDoc(newCustomerRef, {
    ...customerData,
    customerId: newCustomerRef.id,
    created: Date.now(),
    inputBy: currentUser.uid,
    branchCode: currentUser.branchCode,
    provinceId: provinceId, // Add province ID
    deleted: false,
    keywords: generateKeywords(customerData)
  });
  
  return newCustomerRef.id;
};
```

## Best Practices for Multi-Province Development

1. **Always include province filtering** in all database queries
2. **Always store province ID** in all new documents
3. **Use the province selector component** in forms and filters
4. **Check province access** before allowing operations on province-specific data
5. **Test with multiple provinces** to ensure proper isolation
6. **Consider province in reports** when aggregating data
7. **Review security rules** to enforce province-level access control
8. **Use batch operations** for any cross-province data operations
9. **Include province context** in all relevant logs and monitoring