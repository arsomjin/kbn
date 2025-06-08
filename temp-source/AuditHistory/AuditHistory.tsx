import React from 'react';
import { Card, Timeline, Collapse, Button, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { AuditTrailEntry, StatusHistoryEntry, UserInfo } from './types';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { CheckCircleTwoTone } from '@ant-design/icons';

interface AuditHistoryProps {
  auditTrail?: AuditTrailEntry[];
  statusHistory?: StatusHistoryEntry[];
  className?: string;
  employees?: Record<string, any>;
  /**
   * Optional callback when approve is clicked. Receives the new status entry.
   */
  onApprove?: (entry: StatusHistoryEntry) => void;
}

const AuditHistory: React.FC<AuditHistoryProps> = ({
  auditTrail = [],
  statusHistory = [],
  className = '',
  employees: employeesProp,
  onApprove,
}) => {
  const { t, i18n } = useTranslation('inputPrice');
  const employeesFromRedux = useSelector((state: RootState) => state.employees.employees);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const employees = employeesProp || employeesFromRedux;
  const [localStatusHistory, setLocalStatusHistory] =
    React.useState<StatusHistoryEntry[]>(statusHistory);

  // Helper to check DOCUMENT_APPROVE permission
  const hasDocumentApprovePermission = React.useMemo(() => {
    // TODO: Type currentUser with permissions properly
    const perms = (currentUser && (currentUser as any).permissions) || [];
    return Array.isArray(perms) && perms.includes('DOCUMENT_APPROVE');
  }, [currentUser]);

  // Helper to get employee full name
  const getEmployeeName = (userInfo: any) => {
    if (!userInfo) return t('unknownUser', 'Unknown User');
    if (userInfo.id && employees[userInfo.id]) {
      const emp = employees[userInfo.id];
      return `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
    }
    if (userInfo.employeeCode) {
      const emp = Object.values(employees).find(
        (e: any) => e.employeeCode === userInfo.employeeCode,
      );
      if (emp) return `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
    }
    if (userInfo.email) {
      const emp = Object.values(employees).find((e: any) => e.email === userInfo.email);
      if (emp) return `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
    }
    if (userInfo.name && typeof userInfo.name === 'string' && /^BAS\d{5,}$/.test(userInfo.name)) {
      const emp = Object.values(employees).find((e: any) => e.employeeCode === userInfo.name);
      if (emp) return `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
    }
    return (
      userInfo.displayName || userInfo.fullName || userInfo.name || t('unknownUser', 'Unknown User')
    );
  };

  // Helper to format value for display
  const formatValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (Array.isArray(value)) {
      if (value.every((v) => typeof v !== 'object')) return value.join(', ');
      return value
        .map((v) => (typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)))
        .join(', ');
    }
    if (typeof value === 'object') {
      if (value instanceof Date) return dayjs(value).format('YYYY-MM-DD');
      if (value._isAMomentObject || value.$d) return dayjs(value).format('YYYY-MM-DD');
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const formatValueWithEmployee = (key: string, value: any) => {
    if (
      (key === 'name' ||
        key === 'createdBy' ||
        key === 'updatedBy' ||
        key === 'employeeCode' ||
        key === 'userInfo') &&
      value &&
      typeof value === 'object' &&
      typeof value.name === 'string' &&
      /^BAS\d{5,}$/.test(value.name)
    ) {
      const emp = Object.values(employees).find((e: any) => e.employeeCode === value.name);
      if (emp) return `${value.name} (${emp.firstName} ${emp.lastName})`;
      return value.name;
    }
    if (
      (key === 'name' ||
        key === 'createdBy' ||
        key === 'updatedBy' ||
        key === 'employeeCode' ||
        key === 'userInfo') &&
      typeof value === 'string' &&
      /^BAS\d{5,}$/.test(value)
    ) {
      const emp = Object.values(employees).find((e: any) => e.employeeCode === value);
      if (emp) return `${value} (${emp.firstName} ${emp.lastName})`;
    }
    return formatValue(value);
  };

  const renderChanges = (changes: Record<string, any>) => {
    if (!changes) return null;
    return (
      <ul className="ml-2 mt-1 text-sm text-gray-700 dark:text-gray-300">
        {Object.entries(changes).map(([key, val]) => {
          if (val && typeof val === 'object' && 'old' in val && 'new' in val) {
            return (
              <li key={key}>
                <b>{t(`fields.${key}`, key)}:</b>
                {formatValueWithEmployee(key, val.old)} <span className="mx-1">→</span>{' '}
                {formatValueWithEmployee(key, val.new)}
              </li>
            );
          }
          return (
            <li key={key}>
              <b>{t(`fields.${key}`, key)}:</b> {formatValue(val)}
            </li>
          );
        })}
      </ul>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'reviewed':
        return 'blue';
      case 'draft':
        return 'gray';
      default:
        return 'orange';
    }
  };

  const renderAuditTrail = () => (
    <Card className="bg-gray-50 dark:bg-gray-800">
      <Timeline>
        {auditTrail.map((entry, index) => {
          console.log('ENTRY ***', entry);
          return (
            <Timeline.Item key={index} color={entry.action === 'create' ? 'green' : 'blue'}>
              <div className="flex flex-col space-y-1">
                <div className="font-medium">{getEmployeeName(entry.userInfo)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {entry.time ? dayjs(entry.time).format('YYYY-MM-DD HH:mm:ss') : ''}
                </div>
                <div className="text-sm">
                  {entry.action === 'create'
                    ? t('createdDocument', 'Created document')
                    : t('updatedDocument', 'Updated document')}
                </div>
                {entry.changes ? renderChanges(entry.changes) : null}
              </div>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </Card>
  );

  // Approve handler
  const handleApprove = () => {
    if (!currentUser) return;
    const entry: StatusHistoryEntry = {
      status: 'approved',
      time: Date.now(),
      uid: currentUser.uid || 'unknown',
      userInfo: {
        name: currentUser.displayName || currentUser.email || 'Unknown',
        email: currentUser.email || '',
        department: undefined,
        role: undefined,
      },
      comment: t('approved', 'Approved'),
    };
    setLocalStatusHistory((prev) => [...prev, entry]);
    if (onApprove) onApprove(entry);
  };

  const isApproved =
    localStatusHistory.length > 0 &&
    localStatusHistory[localStatusHistory.length - 1].status === 'approved';

  const renderStatusHistory = () => (
    <Card className="bg-gray-50 dark:bg-gray-800">
      <Timeline>
        {localStatusHistory.map((entry, index) => {
          return (
            <Timeline.Item
              key={index}
              color={getStatusColor(entry.status)}
              dot={
                entry.status === 'approved' ? (
                  <Tooltip title={t('approved', 'Approved')}>
                    <CheckCircleTwoTone twoToneColor="#52c41a" />
                  </Tooltip>
                ) : undefined
              }
            >
              <div className="flex flex-col space-y-1">
                <div className="font-medium">{getEmployeeName(entry.userInfo)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {entry.time ? dayjs(entry.time).format('YYYY-MM-DD HH:mm:ss') : ''}
                </div>
                <div className="text-sm">
                  {t('history.statusChanged', {
                    status: t(`status.${entry.status}`, entry.status),
                    user: getEmployeeName(entry.userInfo),
                  })}
                </div>
              </div>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </Card>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div />
        {!isApproved && hasDocumentApprovePermission && (
          <Button
            type="primary"
            icon={<CheckCircleTwoTone twoToneColor="#fff" />}
            onClick={handleApprove}
            aria-label={t('approveAndFinish', 'Approve & Finish')}
          >
            {t('approveAndFinish', 'Approve & Finish')}
          </Button>
        )}
      </div>
      <Collapse
        className="bg-transparent border-none"
        items={[
          {
            key: '1',
            label: (
              <div className="flex items-center">
                <span className="font-medium">{t('changeHistory', 'Change History')}</span>
                {auditTrail.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({auditTrail.length} {t('changes', 'changes')})
                  </span>
                )}
              </div>
            ),
            children:
              auditTrail.length > 0 ? (
                renderAuditTrail()
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {t('noChanges', 'No changes recorded')}
                </div>
              ),
          },
          {
            key: '2',
            label: (
              <div className="flex items-center">
                <span className="font-medium">{t('statusHistory', 'Status History')}</span>
                {localStatusHistory.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({localStatusHistory.length} {t('statusChanges', 'status changes')})
                  </span>
                )}
              </div>
            ),
            children:
              localStatusHistory.length > 0 ? (
                renderStatusHistory()
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {t('noStatusChanges', 'No status changes recorded')}
                </div>
              ),
          },
        ]}
      />
    </div>
  );
};

export default AuditHistory;
