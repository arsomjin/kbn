import { User, UserProfile, RoleType, UserStatus, UserType, EmployeeInfo, VisitorInfo, UserAuth } from "../types/user";

/**
 * Form data interface for user registration/update
 */
export interface UserFormData {
  // Basic info
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string | null;
  
  // Province info
  province?: string;
  
  // Employee info
  branch?: string;
  department?: string;
  position?: string;
  employeeId?: string;
  employeeCode?: string;
  workBegin?: string;
  workEnd?: string | null;
  
  // Visitor info
  purpose?: string;
  organization?: string;
  startDate?: string;
  endDate?: string | null;
}

/**
 * Transform form data into a User object
 */
export const transformUserData = (
  formData: UserFormData,
  uid: string,
  userType: UserType,
  currentUser?: User,
): Partial<User> => {
  const timestamp = Date.now();
  const displayName = `${formData.firstName} ${formData.lastName}`.trim();

  // Base auth information
  const auth: UserAuth = {
    uid,
    created: currentUser?.auth?.created || timestamp,
    displayName,
    email: formData.email,
    emailVerified: currentUser?.auth?.emailVerified || false,
    firstName: formData.firstName,
    lastName: formData.lastName,
    phoneNumber: formData.phoneNumber,
    isAnonymous: false,
    lastLogin: timestamp,
    photoURL: formData.photoURL
  };

  // Base fields
  const baseFields: Partial<User> = {
    auth,
    status: (currentUser?.status || "pending") as UserStatus,
    role: (currentUser?.role || "pending") as RoleType,
    type: userType,
    deleted: false,
    created: currentUser?.created || timestamp,
    updated: timestamp,
    inputBy: uid,
    provinceId: formData.province || ""
  };

  // Type-specific information
  if (userType === "employee") {
    const employeeInfo: EmployeeInfo = {
      employeeCode: formData.employeeId || "",
      department: formData.department,
      position: formData.position,
      branch: formData.branch,
      workBegin: formData.workBegin || null,
      workEnd: formData.workEnd,
      employeeId: ""
    };

    return {
      ...baseFields,
      employeeInfo
    };
  } else {
    const visitorInfo: VisitorInfo = {
      purpose: formData.purpose || "",
      organization: formData.organization,
      startDate: formData.startDate || new Date().toISOString(),
      endDate: formData.endDate
    };

    return {
      ...baseFields,
      visitorInfo
    };
  }
};

/**
 * Transform a User object to UserProfile for UI/forms
 */
export const transformToUserProfile = (user: User): UserProfile => {
  const baseProfile: UserProfile = {
    uid: user.auth.uid,
    firstName: user.auth.firstName || "",
    lastName: user.auth.lastName || "",
    displayName: user.auth.displayName,
    email: user.auth.email,
    phoneNumber: user.auth.phoneNumber,
    photoURL: user.auth.photoURL,
    role: user.role,
    status: user.status,
    type: user.type,
    provinceId: user.provinceId,
    created: user.created,
    updated: user.updated,
    inputBy: user.inputBy
  };

  // Add employee-specific fields if present
  if (user.employeeInfo) {
    return {
      ...baseProfile,
      employeeId: user.employeeInfo.employeeId,
      employeeCode: user.employeeInfo.employeeCode,
      branch: user.employeeInfo.branch,
      department: user.employeeInfo.department,
      position: user.employeeInfo.position,
      workBegin: user.employeeInfo.workBegin || undefined,
      workEnd: user.employeeInfo.workEnd || undefined
    };
  }

  // Add visitor-specific fields if present
  if (user.visitorInfo) {
    return {
      ...baseProfile,
      purpose: user.visitorInfo.purpose,
      organization: user.visitorInfo.organization,
      startDate: user.visitorInfo.startDate,
      endDate: user.visitorInfo.endDate || undefined
    };
  }

  return baseProfile;
};

/**
 * Remove all keys with undefined values from an object (shallow)
 */
// In userTransform.ts
export function removeUndefinedFields<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedFields) as any;
  } else if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, removeUndefinedFields(v)])
    ) as T;
  }
  return obj;
}