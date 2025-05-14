import { Timestamp } from "firebase/firestore";
import { Province, ProvinceAccess } from "./province";

/**
 * Core user authentication information
 */
export interface UserAuth {
  uid: string;
  created: number;
  displayName: string;
  email: string;
  emailVerified?: boolean;
  firstName?: string;
  lastName?: string;
  isAnonymous?: boolean;
  lastLogin?: number;
  phoneNumber?: string | null;
  photoURL?: string | null;
}

/**
 * Union type of available user roles from highest to lowest privilege
 */
export type RoleType = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'USER' | 'PENDING';

/**
 * User status enumeration
 */
export type UserStatus = 'active' | 'pending' | 'inactive' | 'blocked';

/**
 * User type enumeration
 */
export type UserType = 'employee' | 'visitor';

/**
 * Employee-specific information
 */
export interface EmployeeInfo {
  employeeId: string;
  employeeCode?: string;
  department?: string;
  position?: string;
  branch?: string;
  workBegin?: string | null;
  workEnd?: string | null;
}

/**
 * Visitor-specific information
 */
export interface VisitorInfo {
  purpose: string;
  organization?: string;
  startDate: string;
  endDate?: string | null;
}

/**
 * Complete user interface for the application
 * Supports multi-province architecture and RBAC
 */
export interface User {
  id: string;
  auth: UserAuth;
  status: UserStatus;
  role: RoleType;
  type: UserType;
  deleted: boolean;
  created: number;
  updated: number;
  inputBy: string;
  provinceId: string;
  employeeInfo?: EmployeeInfo;
  visitorInfo?: VisitorInfo;
}

export type FirestoreUserData = Omit<User, 'id'>;

/**
 * User profile interface for forms and UI
 * Contains only the fields that can be edited through the UI
 */
export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  email: string;
  phoneNumber?: string | null;
  photoURL?: string | null;
  role: RoleType;
  status: UserStatus;
  type: UserType;
  provinceId: string;
  employeeId?: string;
  employeeCode?: string;
  branch?: string;
  department?: string;
  position?: string;
  workBegin?: string;
  workEnd?: string;
  purpose?: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
  created: number;
  updated: number;
  inputBy: string;
}
