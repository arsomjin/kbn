import { User, UserProfile, RoleType, UserStatus, UserType, EmployeeInfo, VisitorInfo, UserAuth, UserRequestType } from "../types/user";

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
  const baseProfile: Partial<UserProfile> = {
    uid: user.id,
    accessibleProvinceIds: [],
    customPermissions: [],
    deleted: user.deleted,
    status: user.status,
    type: user.type,
    provinceId: user.provinceId,
    role: user.role,
    created: user.created.toString(),
    updated: user.updated.toString(),
    inputBy: user.inputBy,
    auth: {
      displayName: user.auth.displayName,
      email: user.auth.email,
      emailVerified: user.auth.emailVerified || false,
      firstName: user.auth.firstName || '',
      lastName: user.auth.lastName || '',
      isAnonymous: user.auth.isAnonymous || false,
      lastLogin: user.auth.lastLogin?.toString() || null,
      phoneNumber: user.auth.phoneNumber || '',
      photoURL: user.auth.photoURL || '',
    },
    company: '',
    purpose: ''
  };

  if (user.type === 'employee' && user.employeeInfo) {
    return {
      ...baseProfile,
      employeeInfo: {
        branch: user.employeeInfo.branch || '',
        department: user.employeeInfo.department || '',
        employeeCode: user.employeeInfo.employeeCode || '',
        employeeId: user.employeeInfo.employeeId,
        workBegin: user.employeeInfo.workBegin || null,
      },
      requestedType: 'employee' as UserRequestType
    } as UserProfile;
  }

  if (user.type === 'visitor' && user.visitorInfo) {
    return {
      ...baseProfile,
      requestedType: 'visitor' as UserRequestType,
      company: user.visitorInfo.organization || '',
      purpose: user.visitorInfo.purpose
    } as UserProfile;
  }

  return baseProfile as UserProfile;
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