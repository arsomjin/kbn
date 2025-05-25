declare module 'firebase/config' {
  import { Firestore } from 'firebase/firestore';
  import { Auth } from 'firebase/auth';
  import { FirebaseStorage } from 'firebase/storage';
  import { FirebaseApp } from 'firebase/app';

  const db: Firestore;
  const auth: Auth;
  const storage: FirebaseStorage;
  const app: FirebaseApp;

  export { db, auth, storage, app };
}

declare module 'utils/format' {
  const formatCurrency: (amount: number) => string;
  const formatNumber: (number: number) => string;
  const formatDate: (timestamp: number, format?: string) => string;
  const formatDateRange: (startTimestamp: number, endTimestamp: number, format?: string) => string;
  const formatPhoneNumber: (phoneNumber: string) => string;
  const formatFileSize: (bytes: number) => string;

  export { formatCurrency, formatNumber, formatDate, formatDateRange, formatPhoneNumber, formatFileSize };
}

declare module 'utils/permissions' {
  import { PermissionValue } from 'constants/Permissions';

  const hasPermission: (permission: PermissionValue) => boolean;
  const hasProvinceAccess: (provinceId: string) => boolean;
  const hasBranchAccess: (branchCode: string) => boolean;
  const hasAnyPermission: (permissions: PermissionValue[]) => boolean;
  const hasAllPermissions: (permissions: PermissionValue[]) => boolean;

  export { hasPermission, hasProvinceAccess, hasBranchAccess, hasAnyPermission, hasAllPermissions };
}

declare module 'constants/permissions' {
  const PERMISSIONS: {
    // Data Access permissions
    DATA_VIEW: 'DATA_VIEW';
    DATA_EDIT: 'DATA_EDIT';
    DATA_CREATE: 'DATA_CREATE';
    DATA_DELETE: 'DATA_DELETE';
    DATA_EXPORT: 'DATA_EXPORT';
    DATA_IMPORT: 'DATA_IMPORT';

    // User Management permissions
    USER_VIEW: 'USER_VIEW';
    USER_EDIT: 'USER_EDIT';
    USER_CREATE: 'USER_CREATE';
    USER_DELETE: 'USER_DELETE';
    USER_ROLE_EDIT: 'USER_ROLE_EDIT';
    USER_INVITE: 'USER_INVITE';

    // Content Management permissions
    CONTENT_VIEW: 'CONTENT_VIEW';
    CONTENT_EDIT: 'CONTENT_EDIT';
    CONTENT_CREATE: 'CONTENT_CREATE';
    CONTENT_DELETE: 'CONTENT_DELETE';
    CONTENT_PUBLISH: 'CONTENT_PUBLISH';

    // System Configuration permissions
    SYSTEM_SETTINGS_VIEW: 'SYSTEM_SETTINGS_VIEW';
    SYSTEM_SETTINGS_EDIT: 'SYSTEM_SETTINGS_EDIT';
    SYSTEM_LOGS_VIEW: 'SYSTEM_LOGS_VIEW';

    // Operational Actions permissions
    REPORT_VIEW: 'REPORT_VIEW';
    REPORT_CREATE: 'REPORT_CREATE';
    TASK_ASSIGN: 'TASK_ASSIGN';
    TASK_COMPLETE: 'TASK_COMPLETE';

    // Document Workflow permissions
    DOCUMENT_CREATE: 'DOCUMENT_CREATE';
    DOCUMENT_EDIT: 'DOCUMENT_EDIT';
    DOCUMENT_VIEW: 'DOCUMENT_VIEW';
    DOCUMENT_DELETE: 'DOCUMENT_DELETE';
    DOCUMENT_REVIEW: 'DOCUMENT_REVIEW';
    DOCUMENT_APPROVE: 'DOCUMENT_APPROVE';
    DOCUMENT_REJECT: 'DOCUMENT_REJECT';

    // Region Management permissions
    BRANCH_MANAGE: 'BRANCH_MANAGE';
    BRANCH_REPORTS_VIEW: 'BRANCH_REPORTS_VIEW';
    BRANCH_ANALYTICS_VIEW: 'BRANCH_ANALYTICS_VIEW';
    PROVINCE_MANAGE: 'PROVINCE_MANAGE';
    PROVINCE_REPORTS_VIEW: 'PROVINCE_REPORTS_VIEW';
    PROVINCE_ANALYTICS_VIEW: 'PROVINCE_ANALYTICS_VIEW';

    // Account permissions
    VIEW_ACCOUNTS: 'view:accounts';
    VIEW_INCOME: 'view:income';
    VIEW_EXPENSE: 'view:expense';
    ADD_INCOME: 'add:income';
    ADD_EXPENSE: 'add:expense';
    EDIT_INCOME: 'edit:income';
    EDIT_EXPENSE: 'edit:expense';
    DELETE_INCOME: 'delete:income';
    DELETE_EXPENSE: 'delete:expense';
    APPROVE_INCOME: 'approve:income';
    APPROVE_EXPENSE: 'approve:expense';
    EXPORT_ACCOUNTS: 'export:accounts';
  };

  type PermissionValue = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

  export { PERMISSIONS, PermissionValue };
}
