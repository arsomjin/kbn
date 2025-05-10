/**
 * Utility functions for KBN Firebase Cloud Functions
 */

import * as _ from "lodash";
import {firestore} from "firebase-admin";
import * as admin from "firebase-admin";
import {Firestore, WriteResult} from "firebase-admin/firestore";

// Helper function type definitions
export interface Address {
  address: string | null;
  moo: string | null;
  village: string | null;
  tambol: string | null;
  amphoe: string | null;
  province: string | null;
  postcode: string | null;
}

export interface KeywordGenerationOptions {
  text: string;
  maxLength?: number;
  includeLower?: boolean;
  includePartial?: boolean;
}

/**
 * Clean values before saving to Firestore
 * @param {Record<string, unknown>} obj - Object to clean
 * @return {Record<string, unknown>} Cleaned object
 */
export function cleanValuesBeforeSave(obj: Record<string, unknown>): Record<string, unknown> {
  if (!obj) return obj;

  const newObj: Record<string, unknown> = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    // Skip undefined values
    if (value === undefined) return;

    // Handle arrays
    if (Array.isArray(value)) {
      newObj[key] = value.map((item) => {
        if (typeof item === "object" && item !== null) {
          return cleanValuesBeforeSave(item as Record<string, unknown>);
        }
        return item;
      });
      return;
    }

    // Handle objects
    if (typeof value === "object" && value !== null) {
      // Skip DocumentReference instances
      if (value instanceof firestore.DocumentReference) {
        newObj[key] = value;
        return;
      }

      // Clean nested objects
      newObj[key] = cleanValuesBeforeSave(value as Record<string, unknown>);
      return;
    }

    // Copy primitive values
    newObj[key] = value;
  });

  return newObj;
}

/**
 * Deep comparison of objects
 * @param {unknown} a - First object
 * @param {unknown} b - Second object
 * @return {boolean} True if objects are equal
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Format assessment data for reporting
 * @param {Record<string, unknown>} data - Assessment data
 * @return {Record<string, unknown>} Formatted data
 */
export function formatAssessmentData(data: Record<string, unknown>): Record<string, unknown> {
  // Implementation
  return data;
}

/**
 * Create keywords for product search
 * @param {Record<string, unknown>} product - Product data
 * @return {string[]} Array of keywords
 */
export function createProductKeywords(product: { name?: string; productCode?: string; header?: string; model?: string }): string[] {
  const keywords: string[] = [];

  // Add product name words
  if (product.name) {
    const nameWords = product.name.toLowerCase().split(/\s+/);
    keywords.push(...nameWords);
  }

  // Add product code
  if (product.productCode) {
    keywords.push(product.productCode.toLowerCase());
  }

  // Add header and model
  if (product.header) {
    keywords.push(product.header.toLowerCase());
  }

  if (product.model) {
    keywords.push(product.model.toLowerCase());
  }

  // Remove duplicates
  return _.uniq(keywords);
}

/**
 * Add search fields for case-insensitive searching
 * @param {Record<string, unknown>} data - Input data
 * @param {string[]} fields - Fields to add search variants for
 * @return {Record<string, unknown>} Data with added search fields
 */
export function addSearchFields(
  data: Record<string, unknown>,
  fields: string[]
): Record<string, unknown> {
  const result = {...data};

  fields.forEach((field) => {
    const value = data[field];
    if (value && typeof value === "string") {
      result[`${field}_lower`] = value.toLowerCase();
      result[`${field}_partial`] = partialText(value);
    }
  });

  return result;
}

/**
 * Generate partial text matches for search
 * @param {string} text - Input text
 * @return {string[]} Array of partial matches
 */
export function partialText(text: string): string[] {
  const result: string[] = [];
  const loweredText = text.toLowerCase();

  for (let i = 1; i <= loweredText.length; i++) {
    result.push(loweredText.substring(0, i));
  }

  return result;
}

/**
 * Process an array with async function
 * @param {T[]} array - Array to process
 * @param {(item: T, index: number) => Promise<unknown>} callback - Async function to call for each item
 * @return {Promise<void>}
 */
export async function arrayForEach<T>(
  array: T[],
  callback: (item: T, index: number) => Promise<unknown>
): Promise<void> {
  for (let i = 0; i < array.length; i++) {
    await callback(array[i], i);
  }
}

/**
 * Create keywords from vehicle number
 * @param {string} vehicleNo - Vehicle number
 * @return {string[]} Array of keywords
 */
export function createVehicleNoKeyWords(vehicleNo: string): string[] {
  if (!vehicleNo) return [];

  const vehicleNoLower = vehicleNo.toLowerCase();
  const keywords = [vehicleNoLower];

  // Generate partial matches
  for (let i = 3; i <= vehicleNoLower.length; i++) {
    keywords.push(vehicleNoLower.substring(0, i));
  }

  return _.uniq(keywords);
}

/**
 * Create keywords from peripheral number
 * @param {string} peripheralNo - Peripheral number
 * @return {string[]} Array of keywords
 */
export function createPeripheralNoKeyWords(peripheralNo: string): string[] {
  if (!peripheralNo) return [];

  const peripheralNoLower = peripheralNo.toLowerCase();
  const keywords = [peripheralNoLower];

  // Generate partial matches
  for (let i = 3; i <= peripheralNoLower.length; i++) {
    keywords.push(peripheralNoLower.substring(0, i));
  }

  return _.uniq(keywords);
}

/**
 * Remove all non-alphanumeric characters
 * @param {string} text - Input text
 * @return {string} Text with only alphanumeric characters
 */
export function removeAllNonAlphaNumericCharacters(text: string): string {
  if (!text) return "";
  return text.replace(/[^a-zA-Z0-9]/g, "");
}

/**
 * Extract extra sale snapshot
 * @param {Array<{ productName?: string; vehicleNo?: string | string[] }>} items - Sale items
 * @return {Record<string, unknown>} Extra sale data
 */
export function getExtraSaleSnap(items: Array<{ productName?: string; vehicleNo?: string | string[] }>): Record<string, unknown> {
  if (!items || !Array.isArray(items)) return {};

  const result: Record<string, unknown> = {};
  const models: string[] = [];
  const productNames: string[] = [];
  let vehicleNos: string[] = [];

  items.forEach((item) => {
    // Extract model
    if (item.productName) {
      const model = getModelFromName(item.productName);
      if (model) models.push(model);
      productNames.push(item.productName);
    }

    // Extract vehicle numbers
    if (item.vehicleNo) {
      if (Array.isArray(item.vehicleNo)) {
        vehicleNos = [...vehicleNos, ...item.vehicleNo];
      } else {
        vehicleNos.push(item.vehicleNo);
      }
    }
  });

  result.models = _.uniq(models);
  result.productNames = _.uniq(productNames);
  result.vehicleNos = _.uniq(vehicleNos);

  return result;
}

/**
 * Extract peripheral number
 * @param {string} text - Input text
 * @return {string} Extracted peripheral number
 */
export function extractPeripheralNo(text: string): string {
  if (!text) return "";

  // Implementation depends on business rules
  return text.trim();
}

/**
 * Extract vehicle number
 * @param {string} text - Input text
 * @return {string} Extracted vehicle number
 */
export function extractVehicleNo(text: string): string {
  if (!text) return "";

  // Implementation depends on business rules
  return text.trim();
}

/**
 * Extract peripheral model
 * @param {string} text - Input text
 * @return {string} Extracted peripheral model
 */
export function extractPeripheralModel(text: string): string {
  if (!text) return "";

  // Implementation depends on business rules
  return "";
}

/**
 * Get vehicle header
 * @param {string} name - Vehicle name
 * @return {string} Vehicle header
 */
export function getVehicleHeader(name: string): string {
  if (!name) return "";

  // Extract header based on business rules
  const parts = name.split(" ");
  return parts[0] || "";
}

/**
 * Get model from name
 * @param {string} name - Product name
 * @return {string} Model name
 */
export function getModelFromName(name: string): string {
  if (!name) return "";

  // Extract model based on business rules
  const match = name.match(/^(\w+)/);
  return match ? match[1] : "";
}

/**
 * Update other collection
 * @param {Firestore} db - Firestore instance
 * @param {string} path - Collection path
 * @param {string} id - Document ID
 * @param {any} data - Update data
 * @param {string} [provinceId] - Province ID
 * @return {Promise<WriteResult>} Promise
 */
export async function updateCollectionWithProvince(
  db: Firestore,
  path: string,
  id: string,
  data: any,
  provinceId?: string
): Promise<WriteResult> {
  const updateData = provinceId ? {...data, provinceId} : data;
  return db.collection(path).doc(id).update(updateData);
}

/**
 * Get collection with query
 * @param {FirebaseFirestore.Firestore} db - Firestore instance
 * @param {string} path - Collection path
 * @param {[string, FirebaseFirestore.WhereFilterOp, any][]} wheres - Array of where conditions
 * @param {string} [provinceId] - Province ID for filtering
 * @return {Promise<FirebaseFirestore.QuerySnapshot>} Query snapshot
 */
export async function getCollection(
  db: FirebaseFirestore.Firestore,
  path: string,
  wheres: [string, FirebaseFirestore.WhereFilterOp, any][],
  provinceId?: string
): Promise<FirebaseFirestore.QuerySnapshot> {
  let ref = db.collection(path);

  // Apply where conditions
  wheres.forEach((w) => {
    ref = ref.where(w[0], w[1], w[2]) as any;
  });

  // Add province filter if provided
  if (provinceId) {
    ref = ref.where("provinceId", "==", provinceId) as any;
  }

  return ref.get();
}

/**
 * Get document
 * @param {FirebaseFirestore.Firestore} db - Firestore instance
 * @param {string} parent - Parent document path
 * @param {string} path - Child path
 * @return {Promise<FirebaseFirestore.DocumentSnapshot>} Document snapshot
 */
export async function getDoc(
  db: FirebaseFirestore.Firestore,
  parent: string,
  path: string
): Promise<FirebaseFirestore.DocumentSnapshot> {
  return db.doc(`${parent}/${path}`).get();
}

/**
 * Create new ID
 * @param {string} prefix - ID prefix
 * @return {string} New ID
 */
export function createNewId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}${timestamp}${random}`.toUpperCase();
}

/**
 * Convert value to array
 * @param {unknown} value - Input value
 * @return {unknown[]} Array of values
 */
export function convertToArray(value: unknown): unknown[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value.split(",").map((str) => str.trim()).filter(Boolean);
  }
  return [value];
}

/**
 * Clean identity array
 * @param {any[]} array - Array to clean
 * @return {any[]} Cleaned array
 */
export function cleanIdentityArray(array: any[]): any[] {
  if (!array || !Array.isArray(array)) return [];

  return array.map((item) => {
    if (!item) return "";
    if (typeof item === "string") return cleanIdentityNumber(item);
    return String(item);
  });
}

/**
 * Clean identity number
 * @param {unknown} value - Input value
 * @return {string} Cleaned identity number
 */
export function cleanIdentityNumber(value: unknown): string {
  if (!value) return "";
  return String(value).replace(/[^\w\d]/g, "").trim();
}

/**
 * Check if product name is a vehicle
 * @param {string} name - Product name
 * @return {boolean} True if vehicle
 */
export function checkIsVehicleFromName(name: string): boolean {
  if (!name) return false;

  const vehicleKeywords = ["รถ", "รถไถ", "รถเกี่ยว"];
  const lowerName = name.toLowerCase();

  for (const keyword of vehicleKeywords) {
    if (lowerName.includes(keyword.toLowerCase())) return true;
  }

  return false;
}

/**
 * Extract numbers from last letter
 * @param {string} text - Input text
 * @return {string} Extracted numbers
 */
export function extractNumbersFromLastLetter(text: string): string {
  if (!text) return "";

  const matches = text.match(/\d+$/);
  return matches ? matches[0] : "";
}

/**
 * Create keywords for search
 * @param {string} text - Input text
 * @return {string[]} Array of keywords
 */
export function createKeywords(text: string): string[] {
  if (!text) return [];

  const keywords: string[] = [];
  const words = text.toLowerCase().split(/\s+/);

  // Add individual words
  keywords.push(...words);

  // Add partial matches for each word
  words.forEach((word) => {
    for (let i = 1; i <= word.length; i++) {
      keywords.push(word.substring(0, i));
    }
  });

  return _.uniq(keywords);
}

/**
 * Create keywords for SKC bill number
 * @param {string} billNoSKC - Bill number
 * @return {string[]} Array of keywords
 */
export function createBillNoSKCKeywords(billNoSKC: string): string[] {
  if (!billNoSKC) return [];

  const billNoLower = billNoSKC.toLowerCase();
  const cleaned = removeAllNonAlphaNumericCharacters(billNoLower);

  const keywords: string[] = [
    billNoLower,
    cleaned,
  ];

  // Generate partial matches
  for (let i = 3; i <= billNoLower.length; i++) {
    keywords.push(billNoLower.substring(0, i));
  }

  for (let i = 3; i <= cleaned.length; i++) {
    keywords.push(cleaned.substring(0, i));
  }

  return _.uniq(keywords);
}

/**
 * Get dates between start and end
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @return {string[]} Array of dates
 */
export function getDates(startDate: string, endDate: string): string[] {
  // Implementation depends on date library
  // For simplicity, we'll return dummy values
  return [startDate, endDate];
}

/**
 * Check if item has a vehicle number
 * @param {Record<string, unknown>} item - Item to check
 * @return {boolean} True if has vehicle number
 */
export function hasVehicleNo(item: Record<string, unknown>): boolean {
  return !!item && (
    (!!item.vehicleNo && item.vehicleNo !== "") ||
    (!!item.vehicleNoFull && item.vehicleNoFull !== "")
  );
}

/**
 * Check if item has a peripheral number
 * @param {Record<string, unknown>} item - Item to check
 * @return {boolean} True if has peripheral number
 */
export function hasPeripheralNo(item: Record<string, unknown>): boolean {
  return !!item && (
    (!!item.peripheralNo && item.peripheralNo !== "") ||
    (!!item.peripheralNoFull && item.peripheralNoFull !== "")
  );
}

/**
 * Update document in another collection
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 * @param {Record<string, unknown>} data - Data to update
 * @return {Promise<WriteResult>} Promise resolving to WriteResult
 */
export const updateOtherCollection = async (
  collection: string,
  docId: string,
  data: Record<string, unknown>
): Promise<WriteResult> => {
  try {
    const docRef = admin.firestore().collection(collection).doc(docId);
    return await docRef.update(data);
  } catch (error) {
    console.error("updateOtherCollection error:", error);
    throw error;
  }
};

/**
 * Generate search keywords from document fields
 * @param {Record<string, unknown>} data - Data object
 * @param {string[]} fields - Fields to generate keywords from
 * @return {string[]} Array of keywords
 */
export const generateKeywords = (
  data: Record<string, unknown>,
  fields: string[]
): string[] => {
  const keywords: Set<string> = new Set();

  fields.forEach((field) => {
    const value = data[field];
    if (typeof value === "string") {
      // Add the full value
      keywords.add(value.toLowerCase().trim());

      // Add each word
      value
        .toLowerCase()
        .split(/\s+/)
        .forEach((word) => {
          if (word) keywords.add(word);
        });

      // Add partial matches for first few characters
      for (let i = 1; i <= Math.min(value.length, 5); i++) {
        keywords.add(value.toLowerCase().substring(0, i));
      }
    }
  });

  return Array.from(keywords);
};

/**
 * Check if only the created timestamp changed between two objects
 * @param {Record<string, unknown>} before - Object before update
 * @param {Record<string, unknown>} after - Object after update
 * @return {boolean} True if only createdAt changed
 */
export const onlyCreatedAtChanged = (
  before: Record<string, unknown>,
  after: Record<string, unknown>
): boolean => {
  const beforeKeys = Object.keys(before || {});
  const afterKeys = Object.keys(after || {});
  const allKeys = new Set([...beforeKeys, ...afterKeys]);

  const changedKeys: string[] = [];

  allKeys.forEach((key) => {
    if (key === "createdAt") return; // Skip createdAt
    const beforeVal = before?.[key];
    const afterVal = after?.[key];
    const beforeStr = JSON.stringify(beforeVal);
    const afterStr = JSON.stringify(afterVal);
    if (beforeStr !== afterStr) {
      changedKeys.push(key);
    }
  });

  return changedKeys.length === 0;
};
