import React from 'react';
import { Card, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import EmployeeSelector from 'components/EmployeeSelector';
import DatePicker from 'elements/DatePicker';

export interface DocumentAuditTrailValue {
  editedBy: string;
  reviewedBy: string;
  approvedBy: string;
  editedDate?: string;
  reviewedDate?: string;
  approvedDate?: string;
  changes?: Array<{
    uid: string;
    time: number;
    changes: Record<string, any>;
    action: 'create' | 'update';
    userInfo: {
      name: string;
      email: string;
      department?: string;
      role?: string;
    };
    documentInfo: {
      expenseId: string;
      billNoSKC: string;
      taxInvoiceNo: string;
      total: number;
    };
  }>;
}

interface DocumentAuditTrailProps {
  value: DocumentAuditTrailValue;
  onChange?: (value: DocumentAuditTrailValue) => void;
  disabled?: boolean;
  canEditEditedBy?: boolean;
  canEditReviewedBy?: boolean;
  canEditApprovedBy?: boolean;
  i18nNamespace?: string;
}

const DocumentAuditTrail: React.FC<DocumentAuditTrailProps> = ({
  value,
  onChange,
  disabled = false,
  canEditEditedBy = true,
  canEditReviewedBy = true,
  canEditApprovedBy = true,
  i18nNamespace = 'inputPrice'
}) => {
  const { t } = useTranslation(i18nNamespace);

  // Ensure all fields are present with defaults
  const safeValue: DocumentAuditTrailValue = {
    editedBy: value?.editedBy ?? '',
    reviewedBy: value?.reviewedBy ?? '',
    approvedBy: value?.approvedBy ?? '',
    editedDate: value?.editedDate,
    reviewedDate: value?.reviewedDate,
    approvedDate: value?.approvedDate
  };

  const handleFieldChange = (field: keyof DocumentAuditTrailValue, fieldValue: any) => {
    if (onChange) {
      onChange({ ...safeValue, [field]: fieldValue });
    }
  };

  return (
    <div className='w-full max-w-5xl mx-auto mt-4'>
      <Row gutter={[16, 16]} justify='center' align='stretch'>
        {/* Edited By Block */}
        <Col xs={24} md={8}>
          <Card
            className='bg-gray-50 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700'
            bodyStyle={{ padding: '1rem 0.75rem' }}
          >
            <div className='flex flex-col gap-2 items-center'>
              <span className='font-semibold text-gray-700 dark:text-gray-200 text-center'>
                {t('editedBy', 'Edited By')}
              </span>
              <EmployeeSelector
                value={safeValue.editedBy}
                disabled={disabled || !canEditEditedBy}
                style={{ width: '100%' }}
                placeholder={t('selectEditor', 'Select Editor')}
                onChange={v => handleFieldChange('editedBy', v)}
              />
              <DatePicker
                value={safeValue.editedDate}
                disabled={disabled || !canEditEditedBy}
                style={{ width: '100%' }}
                placeholder={t('editDate', 'Edit Date')}
                onChange={d => handleFieldChange('editedDate', d)}
              />
            </div>
          </Card>
        </Col>
        {/* Reviewed By Block */}
        <Col xs={24} md={8}>
          <Card
            className='bg-gray-50 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700'
            bodyStyle={{ padding: '1rem 0.75rem' }}
          >
            <div className='flex flex-col gap-2 items-center'>
              <span className='font-semibold text-gray-700 dark:text-gray-200 text-center'>
                {t('reviewedBy', 'Reviewed By')}
              </span>
              <EmployeeSelector
                value={safeValue.reviewedBy}
                disabled={disabled || !canEditReviewedBy}
                style={{ width: '100%' }}
                placeholder={t('selectReviewer', 'Select Reviewer')}
                onChange={v => handleFieldChange('reviewedBy', v)}
              />
              <DatePicker
                value={safeValue.reviewedDate}
                disabled={disabled || !canEditReviewedBy}
                style={{ width: '100%' }}
                placeholder={t('reviewDate', 'Review Date')}
                onChange={d => handleFieldChange('reviewedDate', d)}
              />
            </div>
          </Card>
        </Col>
        {/* Approved By Block */}
        <Col xs={24} md={8}>
          <Card
            className='bg-gray-50 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700'
            bodyStyle={{ padding: '1rem 0.75rem' }}
          >
            <div className='flex flex-col gap-2 items-center'>
              <span className='font-semibold text-gray-700 dark:text-gray-200 text-center'>
                {t('approvedBy', 'Approved By')}
              </span>
              <EmployeeSelector
                value={safeValue.approvedBy}
                disabled={disabled || !canEditApprovedBy}
                style={{ width: '100%' }}
                placeholder={t('selectApprover', 'Select Approver')}
                onChange={v => handleFieldChange('approvedBy', v)}
              />
              <DatePicker
                value={safeValue.approvedDate}
                disabled={disabled || !canEditApprovedBy}
                style={{ width: '100%' }}
                placeholder={t('approveDate', 'Approve Date')}
                onChange={d => handleFieldChange('approvedDate', d)}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DocumentAuditTrail;
