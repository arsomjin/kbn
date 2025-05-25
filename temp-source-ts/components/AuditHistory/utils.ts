import { AuditTrailEntry, UserInfo, DocumentInfo } from './types';

/**
 * Creates a new audit trail entry
 */
export const createAuditTrailEntry = (
  uid: string,
  action: 'create' | 'update' | 'delete',
  userInfo: UserInfo,
  changes?: Record<string, any>,
  documentInfo?: DocumentInfo
): AuditTrailEntry => {
  return {
    uid,
    time: Date.now(),
    action,
    changes,
    userInfo,
    documentInfo
  };
};

/**
 * Compares two objects and returns the differences
 */
export const getObjectDifferences = (oldObj: Record<string, any>, newObj: Record<string, any>): Record<string, any> => {
  const changes: Record<string, any> = {};

  // Check for added or modified properties
  Object.keys(newObj).forEach(key => {
    if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
      changes[key] = {
        old: oldObj[key],
        new: newObj[key]
      };
    }
  });

  // Check for removed properties
  Object.keys(oldObj).forEach(key => {
    if (!(key in newObj)) {
      changes[key] = {
        old: oldObj[key],
        new: null
      };
    }
  });

  return changes;
};

/**
 * Formats a change object for display
 */
export const formatChange = (key: string, change: { old: any; new: any }): string => {
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return `${key}: ${formatValue(change.old)} → ${formatValue(change.new)}`;
};
