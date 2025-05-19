import { useState, useCallback } from 'react';
import { AuditTrailEntry, StatusHistoryEntry, UserInfo } from './types';
import { createAuditTrailEntry, getObjectDifferences } from './utils';

interface UseAuditTrailProps {
  initialAuditTrail?: AuditTrailEntry[];
  initialStatusHistory?: StatusHistoryEntry[];
}

interface UseAuditTrailReturn {
  auditTrail: AuditTrailEntry[];
  statusHistory: StatusHistoryEntry[];
  addAuditEntry: (
    uid: string,
    action: 'create' | 'update' | 'delete',
    userInfo: UserInfo,
    oldData?: Record<string, any>,
    newData?: Record<string, any>,
    documentInfo?: any
  ) => void;
  addStatusEntry: (uid: string, status: string, userInfo: UserInfo, comment?: string) => void;
  clearAuditTrail: () => void;
  clearStatusHistory: () => void;
}

export const useAuditTrail = ({
  initialAuditTrail = [],
  initialStatusHistory = []
}: UseAuditTrailProps = {}): UseAuditTrailReturn => {
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>(initialAuditTrail);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>(initialStatusHistory);

  const addAuditEntry = useCallback(
    (
      uid: string,
      action: 'create' | 'update' | 'delete',
      userInfo: UserInfo,
      oldData?: Record<string, any>,
      newData?: Record<string, any>,
      documentInfo?: any
    ) => {
      const changes = oldData && newData ? getObjectDifferences(oldData, newData) : undefined;
      const entry = createAuditTrailEntry(uid, action, userInfo, changes, documentInfo);
      setAuditTrail(prev => [...prev, entry]);
    },
    []
  );

  const addStatusEntry = useCallback((uid: string, status: string, userInfo: UserInfo, comment?: string) => {
    const entry: StatusHistoryEntry = {
      status,
      time: Date.now(),
      uid,
      userInfo,
      comment
    };
    setStatusHistory(prev => [...prev, entry]);
  }, []);

  const clearAuditTrail = useCallback(() => {
    setAuditTrail([]);
  }, []);

  const clearStatusHistory = useCallback(() => {
    setStatusHistory([]);
  }, []);

  return {
    auditTrail,
    statusHistory,
    addAuditEntry,
    addStatusEntry,
    clearAuditTrail,
    clearStatusHistory
  };
};
