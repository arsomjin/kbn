export interface UserInfo {
  displayName?: string;
  fullName?: string;
  name?: string;
  email?: string;
  department?: string;
  role?: string;
}

export interface DocumentInfo {
  documentId?: string;
  documentType?: string;
  documentNumber?: string;
  total?: number;
  [key: string]: any;
}

export interface AuditTrailEntry {
  uid: string;
  time: number;
  action: 'create' | 'update' | 'delete';
  changes?: Record<string, any>;
  userInfo: UserInfo;
  documentInfo?: DocumentInfo;
}

export interface StatusHistoryEntry {
  status: 'draft' | 'reviewed' | 'approved' | string;
  time: number;
  uid: string;
  userInfo: UserInfo;
  comment?: string;
}
