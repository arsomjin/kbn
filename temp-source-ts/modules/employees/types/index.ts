import { Timestamp } from 'firebase/firestore';

export interface Employee {
  employeeCode: string;
  id: string;
  provinceId: string;
  branchId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  address: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  status: EmployeeStatus;
  salary: number;
  bankAccount: string;
  bankName: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  documents: {
    id: string;
    type: string;
    url: string;
    uploadedAt: Timestamp;
  }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
  deleted: boolean;
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED'
}

export interface EmployeeFilters {
  search?: string;
  status?: EmployeeStatus;
  department?: string;
  position?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface EmployeeFormData {
  provinceId: string;
  branchId: string;
  employeeId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  prefix: string;
  photoUrl?: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  address: string;
  startDate: Date;
  endDate?: Date;
  status: EmployeeStatus;
  salary: number;
  bankAccount: string;
  bankName: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  documents?: File[];
}

export interface EmployeeState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  filters: EmployeeFilters;
  selectedEmployee: Employee | null;
}
