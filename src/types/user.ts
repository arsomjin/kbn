import { Timestamp } from 'firebase/firestore';

/**
 * User interface representing user data in Firestore
 * Includes province-specific fields for multi-province architecture
 */
export interface User {
  id: string;
  displayName?: string;
  email: string;
  role: string;
  branch?: string;
  department?: string;
  province?: string;
  provinceId: string; // Required for multi-province architecture
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  employeeId?: string;
  phoneNumber?: string;
  status?: 'active' | 'inactive' | 'pending';
  lastLogin?: Timestamp;
  permissions?: string[];
}
