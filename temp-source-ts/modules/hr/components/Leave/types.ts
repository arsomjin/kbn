import { Timestamp } from 'firebase/firestore';
import { AuditTrailEntry } from 'components/AuditHistory/types';

/**
 * Leave Record Interface for the Leave module
 */
export interface LeaveRecord {
  id: number;
  key: string;
  _id?: string;
  employeeId: string;
  position?: string;
  department?: string;
  leaveType?: 'ลาป่วย' | 'ลากิจ' | 'ขาดงาน' | string;
  leaveDays?: number;
  fromDate?: string;
  toDate?: string;
  reason?: string;
  branchCode?: string;
  date?: string;
  recordedBy?: string;
  approvedBy?: string;
  hasMedCer?: boolean;
  docId?: string;
  deleted?: boolean;
  created?: number;
  inputBy?: string;
  editedBy?: AuditTrailEntry[];
  [key: string]: any;
}

/**
 * Leave Form Values Interface
 */
export interface LeaveFormValues {
  branchCode: string;
  date: string;
  employeeId: string;
  department?: string;
  position: string;
  leaveType: string;
  reason?: string;
  leaveDays: number;
  fromDate: string;
  toDate: string;
  recordedBy: string;
  approvedBy: string;
  hasMedCer?: boolean;
}

/**
 * Initial Leave Values
 */
export interface InitialLeaveValues {
  branchCode: string | null;
  date: string;
  employeeId: string | null;
  department: string | null;
  position: string | null;
  leaveType: string | null;
  reason: string | null;
  leaveDays: number | null;
  fromDate: string | undefined;
  toDate: string | undefined;
  recordedBy: string | null;
  approvedBy: string | null;
  hasMedCer: boolean;
}

/**
 * Edit Leave Modal Props Interface
 */
export interface EditLeaveProps {
  selectedData?: Partial<LeaveRecord>;
  visible: boolean;
  onOk: (editValues: Partial<LeaveRecord>) => Promise<void>;
  onCancel: () => void;
  POSITIONS: string[];
  grant?: boolean;
  [key: string]: any;
}

/**
 * Leave Component Props Interface
 */
export interface LeaveProps {
  readOnly?: boolean;
  grant?: boolean;
  onBack?: (() => void) | null;
  activeStep?: number;
  branchCode?: string | null;
  date?: string | null;
}
