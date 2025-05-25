import { Timestamp } from 'firebase/firestore';
import { Dayjs } from 'dayjs';

/**
 * Base HR record interface
 */
export interface HRRecord {
  provinceId: string;
  branchCode: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
  deleted: boolean;
}

/**
 * Employee Status Enum
 */
export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated',
  PROBATION = 'probation',
  RESIGNED = 'resigned'
}

/**
 * Employee Interface
 */
export interface Employee extends HRRecord {
  id?: string; // Document ID from Firestore
  employeeId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  prefix: string;
  nickName?: string;
  photoUrl?: string;
  avatar?: string; // Legacy support for avatar field
  email: string;
  phone: string;
  address: string;
  tambol?: string;
  amphoe?: string;
  province?: string;
  postcode?: string;
  department: string;
  position: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  hireDate?: string; // Legacy support - hire date as string
  workBegin?: string;
  workEnd?: string;
  status: EmployeeStatus;
  salary: number;
  bankAccount?: string;
  bankName?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  documents?: {
    id: string;
    type: string;
    url: string;
    uploadedAt: Timestamp;
  }[];
  remark?: string;
  affiliate?: string; // For legacy support
}

/**
 * Employee Form Data Interface
 */
export interface EmployeeFormData {
  employeeId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  prefix: string;
  nickName?: string;
  email: string;
  phone: string;
  address: string;
  tambol?: string;
  amphoe?: string;
  province?: string;
  postcode?: string;
  department: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  hireDate?: Date; // Legacy support for hire date
  workBegin?: string;
  workEnd?: string;
  status: EmployeeStatus;
  salary: number;
  bankAccount?: string;
  bankName?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  documents?: File[];
  remark?: string;
  affiliate?: string;
}

/**
 * Employee Filters Interface
 */
export interface EmployeeFilters {
  search?: string;
  status?: EmployeeStatus;
  department?: string;
  position?: string;
  startDate?: Date;
  endDate?: Date;
  branchCode?: string;
  provinceId?: string;
}

/**
 * Leave Types
 */
export enum LeaveType {
  SICK = 'sick',
  PERSONAL = 'personal',
  ANNUAL = 'annual',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  EMERGENCY = 'emergency',
  ABSENT = 'absent'
}

/**
 * Leave Status
 */
export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

/**
 * Leave Type Status
 */
export enum LeaveTypeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

/**
 * Leave Type Configuration Interface
 */
export interface LeaveTypeConfig extends HRRecord {
  name: string;
  description?: string;
  category: string;
  allowancePerYear: number;
  maxConsecutiveDays: number;
  minDaysNotice: number;
  requiresApproval: boolean;
  requiresDocuments: boolean;
  carryOverAllowed: boolean;
  maxCarryOverDays: number;
  status: LeaveTypeStatus;
}

/**
 * Leave Request Interface
 */
export interface LeaveRequest extends HRRecord {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  position: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approverName?: string;
  approvedDate?: Timestamp;
  rejectionReason?: string;
  hasMedicalCertificate?: boolean;
  attachments?: string[];
  recordedBy?: string;
}

/**
 * Attendance Status
 */
export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HALF_DAY = 'half_day',
  LEAVE = 'leave'
}

/**
 * Attendance Record Interface
 */
export interface AttendanceRecord extends HRRecord {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  position: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  lateMinutes?: number;
  overtimeMinutes?: number;
  notes?: string;
  recordedBy?: string;
}

/**
 * Fingerprint Data Interface
 */
export interface FingerprintData extends HRRecord {
  employeeCode: string;
  employeeName: string;
  timestamp: Timestamp;
  deviceId: string;
  isCheckIn: boolean;
  processed: boolean;
}

/**
 * Department Interface
 */
export interface Department extends HRRecord {
  code: string;
  name: string;
  description?: string;
  managerId?: string;
  managerName?: string;
  isActive: boolean;
  employeeCount?: number;
  branchId?: string;
}

/**
 * Position Interface
 */
export interface Position extends HRRecord {
  code: string;
  title: string;
  description?: string;
  departmentId: string;
  departmentName?: string;
  level: string;
  minSalary?: number;
  maxSalary?: number;
  requiredSkills?: string[];
  isActive: boolean;
  employeeCount?: number;
  branchId?: string;
}

/**
 * Payroll Record Interface
 */
export interface PayrollRecord extends HRRecord {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  position: string;
  period: string;
  basicSalary: number;
  overtime: number;
  allowances: number;
  deductions: number;
  tax: number;
  socialSecurity: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'paid';
  approvedBy?: string;
  approvedDate?: Timestamp;
  paidDate?: Timestamp;
  branchId?: string;
}

/**
 * HR Report Types
 */
export type HRReportType =
  | 'attendance_summary'
  | 'leave_summary'
  | 'payroll_summary'
  | 'employee_report'
  | 'department_report';

/**
 * HR Report Filters
 */
export interface HRReportFilters {
  reportType?: HRReportType;
  dateRange?: [Dayjs | null, Dayjs | null] | null;
  department?: string;
  departments?: string[];
  position?: string;
  employee?: string;
  employeeIds?: string[];
  status?: string;
  branches?: string[];
}

/**
 * HR Analytics Data
 */
export interface HRAnalytics {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  turnoverRate: number;
  averageAttendance: number;
  pendingLeaves: number;
  departmentBreakdown: {
    department: string;
    count: number;
  }[];
  attendanceTrend: {
    date: string;
    present: number;
    absent: number;
    late: number;
  }[];
  leaveTrend: {
    month: string;
    sick: number;
    personal: number;
    annual: number;
  }[];
}

/**
 * HR Settings Interface
 */
export interface HRSettings extends HRRecord {
  workingHours: {
    start: string;
    end: string;
    lunchStart: string;
    lunchEnd: string;
  };
  workingDays: string[];
  overtimeRules: {
    enabled: boolean;
    minimumMinutes: number;
    rate: number;
  };
  leaveRules: {
    [key in LeaveType]: {
      allowancePerYear: number;
      maxConsecutiveDays: number;
      minDaysNotice: number;
      requiresApproval: boolean;
      carryOver: boolean;
    };
  };
  attendanceRules: {
    lateThresholdMinutes: number;
    halfDayThresholdMinutes: number;
    autoMarkAbsent: boolean;
  };
}

/**
 * Training Record Interface
 */
export interface TrainingRecord extends HRRecord {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  trainingTitle: string;
  trainingType: 'internal' | 'external' | 'online' | 'certification';
  startDate: string;
  endDate: string;
  duration: number; // in hours
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  cost?: number;
  provider?: string;
  certificateUrl?: string;
  notes?: string;
}

/**
 * Performance Review Interface
 */
export interface PerformanceReview extends HRRecord {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  reviewPeriod: string;
  reviewerId: string;
  reviewerName: string;
  goals: {
    goal: string;
    weight: number;
    achievement: number;
    notes?: string;
  }[];
  overallRating: number;
  strengths: string[];
  areasForImprovement: string[];
  developmentPlan: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved';
  submittedDate?: Timestamp;
  reviewedDate?: Timestamp;
  approvedDate?: Timestamp;
}

/**
 * Employee Document Interface
 */
export interface EmployeeDocument extends HRRecord {
  employeeId: string;
  documentType: 'contract' | 'id_card' | 'resume' | 'certificate' | 'other';
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedDate: Timestamp;
  expiryDate?: Timestamp;
  isConfidential: boolean;
}

/**
 * Attendance Statistics Interface
 */
export interface AttendanceStatistics {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  presentPercentage: number;
  absentPercentage: number;
  latePercentage: number;
  averageCheckInTime: string;
  averageCheckOutTime: string;
  totalWorkingDays: number;
  totalPresentDays: number;
  totalAbsentDays: number;
  totalLateDays: number;
  monthlyTrend: {
    date: string;
    present: number;
    absent: number;
    late: number;
    percentage: number;
  }[];
}

/**
 * HR API Response Interface
 */
export interface HRApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}
