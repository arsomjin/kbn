import {
  collection,
  query,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  orderBy,
  Timestamp,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions
} from "firebase/firestore";
import { firestore } from "./firebase";
import { Province } from "../types/province";

const COLLECTION_PATH = "data/company/provinces";

// Firestore converter for Province type
const provinceConverter: FirestoreDataConverter<Province> = {
  toFirestore: (province: Province) => {
    return {
      code: province.code,
      name: province.name,
      nameEn: province.nameEn,
      status: province.status,
      region: province.region ?? "",
      description: province.description ?? "",
      settings: province.settings,
      createdAt: typeof province.createdAt === "number" ? Timestamp.fromMillis(province.createdAt) : province.createdAt,
      updatedAt: typeof province.updatedAt === "number" ? Timestamp.fromMillis(province.updatedAt) : province.updatedAt
    };
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Province => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      code: data.code,
      name: data.name,
      nameEn: data.nameEn,
      status: data.status,
      region: data.region ?? "",
      description: data.description ?? "",
      settings: data.settings,
      createdAt: data.createdAt && typeof data.createdAt.toMillis === "function"
        ? data.createdAt.toMillis()
        : typeof data.createdAt === "number"
          ? data.createdAt
          : null,
      updatedAt: data.updatedAt && typeof data.updatedAt.toMillis === "function"
        ? data.updatedAt.toMillis()
        : typeof data.updatedAt === "number"
          ? data.updatedAt
          : null
    };
  }
};

/**
 * Get all provinces with optional filters
 */
export const getProvinces = async (params?: {
  status?: "active" | "inactive";
  region?: string;
}): Promise<Province[]> => {
  try {
    const provincesRef = collection(firestore, COLLECTION_PATH).withConverter(provinceConverter);
    
    const constraints = [];
    if (params?.status) {
      constraints.push(where("status", "==", params.status));
    }
    if (params?.region) {
      constraints.push(where("region", "==", params.region));
    }
    constraints.push(orderBy("name", "asc"));

    const q = query(provincesRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error fetching provinces:", error);
    throw error;
  }
};

/**
 * Get a single province by ID
 */
export const getProvinceById = async (id: string): Promise<Province | null> => {
  try {
    const provinceRef = doc(firestore, COLLECTION_PATH, id).withConverter(provinceConverter);
    const snapshot = await getDoc(provinceRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    return snapshot.data();
  } catch (error) {
    console.error(`Error fetching province ${id}:`, error);
    throw error;
  }
};

interface CreateProvinceInput {
  code: string;
  name: string;
  nameEn: string;
  region?: string;
  description?: string;
  settings?: Province["settings"];
}

/**
 * Create a new province
 */
export const createProvince = async (input: CreateProvinceInput): Promise<Province> => {
  try {
    // Create normalized ID from English name
    const id = input.nameEn.toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special chars
      .replace(/\s+/g, "-")     // Replace spaces with hyphens
      .replace(/_/g, "-");      // Replace underscores with hyphens

    const docRef = doc(firestore, COLLECTION_PATH, id).withConverter(provinceConverter);
    const now = Date.now();

    const province: Province = {
      id,
      code: input.code,
      name: input.name,
      nameEn: input.nameEn,
      status: "active",
      region: input.region ?? "",
      description: input.description ?? "",
      settings: input.settings,
      createdAt: now,
      updatedAt: now
    };

    await setDoc(docRef, province);
    return province;
  } catch (error) {
    console.error("Error creating province:", error);
    throw error;
  }
};

/**
 * Update an existing province
 */
export const updateProvince = async (
  id: string,
  input: Partial<CreateProvinceInput> & { status?: Province["status"] }
): Promise<Province> => {
  try {
    const docRef = doc(firestore, COLLECTION_PATH, id).withConverter(provinceConverter);
    const now = Date.now();

    // Ensure region/description are never undefined
    const updates = {
      ...input,
      region: input.region ?? "",
      description: input.description ?? "",
      updatedAt: now
    };

    await updateDoc(docRef, updates);
    const updated = await getDoc(docRef);
    
    if (!updated.exists()) {
      throw new Error("Failed to fetch updated province");
    }
    
    return updated.data();
  } catch (error) {
    console.error(`Error updating province ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a province
 */
export const deleteProvince = async (id: string): Promise<void> => {
  try {
    await updateDoc(doc(firestore, COLLECTION_PATH, id), {
      status: "inactive",
      deleted: true,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error(`Error deleting province ${id}:`, error);
    throw error;
  }
};
