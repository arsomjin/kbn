import React from 'react';
import { Button } from 'elements';
import { CheckOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useResponsive } from '../hooks/useResponsive';

interface DocumentStatusActionsProps {
  canApprove: boolean;
  docStatus: 'draft' | 'reviewed' | 'approved' | 'rejected';
  isReadOnly: boolean;
  onApprove: () => void;
  onReject: () => void;
}

/**
 * Renders Approve/Reject buttons for document workflow.
 * Only shows if not completed (not approved/rejected) and user has permission.
 */
export const DocumentStatusActions: React.FC<DocumentStatusActionsProps> = ({
  canApprove,
  docStatus,
  isReadOnly,
  onApprove,
  onReject
}) => {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  if (!canApprove || docStatus === 'approved' || docStatus === 'rejected') return null;
  return (
    <>
      <Button
        type='primary'
        icon={<CheckOutlined />}
        style={{
          minWidth: isMobile ? 120 : 160,
          fontSize: isMobile ? 14 : 16,
          height: isMobile ? 36 : 40,
          marginLeft: isMobile ? 8 : 16
        }}
        onClick={onApprove}
        disabled={isReadOnly}
        data-testid='approve-btn'
      >
        {t('approve', 'อนุมัติ')}
      </Button>
      <Button
        danger
        icon={<CheckOutlined />}
        style={{
          minWidth: isMobile ? 120 : 160,
          fontSize: isMobile ? 14 : 16,
          height: isMobile ? 36 : 40,
          marginLeft: isMobile ? 8 : 16,
          backgroundColor: '#ff4d4f', // AntD red
          borderColor: '#ff4d4f',
          color: '#fff'
        }}
        onClick={onReject}
        disabled={isReadOnly}
        data-testid='reject-btn'
      >
        {t('reject', 'ปฏิเสธ')}
      </Button>
    </>
  );
};

interface DocumentStatusWatermarkProps {
  docStatus: 'approved' | 'rejected' | string;
}

/**
 * Shows a watermark/sign for completed document process (APPROVED/REJECTED).
 */
export const DocumentStatusWatermark: React.FC<DocumentStatusWatermarkProps> = ({ docStatus }) => {
  const { t } = useTranslation('common');
  const { isMobile } = useResponsive();
  if (docStatus !== 'approved' && docStatus !== 'rejected') return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: isMobile ? '30%' : '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        pointerEvents: 'none',
        opacity: 0.18,
        fontSize: isMobile ? 48 : 96,
        color: docStatus === 'approved' ? '#52c41a' : '#ff4d4f',
        fontWeight: 900,
        textTransform: 'uppercase',
        userSelect: 'none',
        whiteSpace: 'nowrap'
      }}
      data-testid='status-watermark'
    >
      {docStatus === 'approved' ? t('approved', 'APPROVED') : t('rejected', 'REJECTED')}
    </div>
  );
};
