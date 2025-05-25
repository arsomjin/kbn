export interface AttendanceRecord {
  id: number;
  key: string; // Changed from number to string for table compatibility
  date: string;
  branch: string;
  employeeCode: string;
  fullName: string;
  importTime?: number;
  importBy?: string;
  [key: string]: any; // For dynamic columns (1-13)
}

export interface ImportInfo {
  time: any; // Using any to match legacy Firebase timestamp type
  by: string;
}

export interface SearchFormValues {
  startDate: string;
  endDate: string;
}
