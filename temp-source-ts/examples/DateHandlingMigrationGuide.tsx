/**
 * Migration Guide: From Old Date Functions to New Date Handling System
 *
 * This guide shows how to migrate from the old cleanValuesBeforeSave/formatValuesBeforeLoad
 * functions to the new comprehensive date handling system.
 */

import React, { useState } from 'react';
import { Form, DatePicker, Button, notification } from 'antd';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../services/firebase';

// ===== OLD WAY (DEPRECATED) =====
/*
import { cleanValuesBeforeSave, formatValuesBeforeLoad } from 'utils/functions';

const saveData = async (formValues) => {
  // Old way - not recommended
  const cleanData = cleanValuesBeforeSave(formValues);
  await setDoc(doc(firestore, 'collection', 'docId'), cleanData);
};

const loadData = async () => {
  const docSnap = await getDoc(doc(firestore, 'collection', 'docId'));
  if (docSnap.exists()) {
    // Old way - not recommended
    const formData = formatValuesBeforeLoad(docSnap.data());
    form.setFieldsValue(formData);
  }
};
*/

// ===== NEW WAY (RECOMMENDED) =====

import { useDateHandling, processFormDataForFirestore, processFirestoreDataForForm } from '../utils/dateHandling';

// Method 1: Using the hook (recommended for components)
const MigratedComponent: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Use the hook for easy access to date handling functions
  const { prepareForSave, prepareForForm } = useDateHandling();

  const saveData = async (formValues: any) => {
    try {
      setLoading(true);

      // NEW: Use prepareForSave instead of cleanValuesBeforeSave
      const firestoreData = prepareForSave(formValues);
      await setDoc(doc(firestore, 'collection', 'docId'), firestoreData);

      notification.success({ message: 'บันทึกสำเร็จ' });
    } catch (error) {
      console.error('Save error:', error);
      notification.error({ message: 'เกิดข้อผิดพลาด' });
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const docSnap = await getDoc(doc(firestore, 'collection', 'docId'));
      if (docSnap.exists()) {
        // NEW: Use prepareForForm instead of formatValuesBeforeLoad
        const formData = prepareForForm(docSnap.data());
        form.setFieldsValue(formData);
      }
    } catch (error) {
      console.error('Load error:', error);
      notification.error({ message: 'เกิดข้อผิดพลาด' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} onFinish={saveData}>
      <Form.Item name='createdDate' label='วันที่สร้าง'>
        <DatePicker />
      </Form.Item>
      <Form.Item name='startDate' label='วันที่เริ่มต้น'>
        <DatePicker />
      </Form.Item>
      <Form.Item>
        <Button type='primary' htmlType='submit' loading={loading}>
          บันทึก
        </Button>
        <Button onClick={loadData} loading={loading}>
          โหลด
        </Button>
      </Form.Item>
    </Form>
  );
};

// Method 2: Using functions directly (for utility functions or non-components)
export const migratedUtilityFunctions = {
  // NEW: Save function using direct import
  saveToFirestore: async (formData: Record<string, any>, collectionPath: string, docId: string) => {
    try {
      // NEW: Use processFormDataForFirestore instead of cleanValuesBeforeSave
      const firestoreData = processFormDataForFirestore(formData);
      await setDoc(doc(firestore, collectionPath, docId), firestoreData);
      return { success: true };
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      return { success: false, error };
    }
  },

  // NEW: Load function using direct import
  loadFromFirestore: async (collectionPath: string, docId: string) => {
    try {
      const docSnap = await getDoc(doc(firestore, collectionPath, docId));
      if (docSnap.exists()) {
        // NEW: Use processFirestoreDataForForm instead of formatValuesBeforeLoad
        const formData = processFirestoreDataForForm(docSnap.data());
        return { success: true, data: formData };
      }
      return { success: false, error: 'Document not found' };
    } catch (error) {
      console.error('Error loading from Firestore:', error);
      return { success: false, error };
    }
  }
};

// ===== MIGRATION STEPS =====

/*
STEP-BY-STEP MIGRATION:

1. Replace imports:
   OLD: import { cleanValuesBeforeSave, formatValuesBeforeLoad } from 'utils/functions';
   NEW: import { useDateHandling } from 'utils/dateHandling'; // for components
   NEW: import { processFormDataForFirestore, processFirestoreDataForForm } from 'utils/dateHandling'; // for utilities

2. Replace function calls:
   OLD: const cleanData = cleanValuesBeforeSave(formValues);
   NEW: const cleanData = prepareForSave(formValues); // using hook
   NEW: const cleanData = processFormDataForFirestore(formValues); // direct function

   OLD: const formData = formatValuesBeforeLoad(firestoreData);
   NEW: const formData = prepareForForm(firestoreData); // using hook
   NEW: const formData = processFirestoreDataForForm(firestoreData); // direct function

3. Update error handling:
   The new system includes built-in error handling with user-friendly notifications

4. Test thoroughly:
   - Verify date fields are converted correctly
   - Check that nested objects work properly
   - Ensure arrays with date objects are handled
   - Test with existing data in Firestore

BENEFITS OF MIGRATION:
- Better TypeScript support
- More robust error handling
- Consistent date handling across the app
- Support for more date formats
- Better performance
- Built-in validation
- Timezone awareness
- Comprehensive testing
*/

export default MigratedComponent;
