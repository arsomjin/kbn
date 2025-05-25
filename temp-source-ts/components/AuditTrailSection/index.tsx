import React from 'react';
import { Row, Col, Form, DatePicker, Tooltip, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import EmployeeSelector from '../EmployeeSelector';

interface AuditTrailSectionProps {
  canEditEditedBy: boolean;
  canEditReviewedBy: boolean;
  canEditApprovedBy: boolean;
}

const AuditTrailSection: React.FC<AuditTrailSectionProps> = ({
  canEditEditedBy,
  canEditReviewedBy,
  canEditApprovedBy
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Divider />
      <Row gutter={16} className='mb-4 mt-4'>
        <Col xs={24} md={8}>
          <Form.Item
            name={['auditTrail', 0, 'userInfo', 'name']}
            label={<span className='font-medium'>* {t('editor', 'ผู้แก้ไข')}</span>}
            rules={[{ required: canEditEditedBy, message: t('selectEditor', 'กรุณาเลือกผู้แก้ไข') }]}
          >
            {canEditEditedBy ? (
              <EmployeeSelector disabled={false} />
            ) : (
              <Tooltip title={t('noPermissionEdit', 'You do not have permission to edit this field.')}>
                <span style={{ display: 'block' }}>
                  <EmployeeSelector disabled={true} />
                </span>
              </Tooltip>
            )}
          </Form.Item>
          <Form.Item
            name={['auditTrail', 0, 'time']}
            label={<span className='font-medium'>{t('editDate', 'วันที่แก้ไข')}</span>}
            rules={[{ required: canEditEditedBy, message: t('selectEditDate', 'กรุณาเลือกวันที่แก้ไข') }]}
          >
            {canEditEditedBy ? (
              <DatePicker disabled={false} style={{ width: '100%' }} />
            ) : (
              <Tooltip title={t('noPermissionEdit', 'You do not have permission to edit this field.')}>
                <span style={{ display: 'block' }}>
                  <DatePicker disabled={true} style={{ width: '100%' }} />
                </span>
              </Tooltip>
            )}
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name={['auditTrail', 1, 'userInfo', 'name']}
            label={<span className='font-medium'>* {t('reviewer', 'ผู้ตรวจสอบ')}</span>}
            rules={[{ required: canEditReviewedBy, message: t('selectReviewer', 'กรุณาเลือกผู้ตรวจสอบ') }]}
          >
            {canEditReviewedBy ? (
              <EmployeeSelector disabled={false} />
            ) : (
              <Tooltip title={t('noPermissionEdit', 'You do not have permission to edit this field.')}>
                <span style={{ display: 'block' }}>
                  <EmployeeSelector disabled={true} />
                </span>
              </Tooltip>
            )}
          </Form.Item>
          <Form.Item
            name={['auditTrail', 1, 'time']}
            label={<span className='font-medium'>{t('reviewDate', 'วันที่ตรวจสอบ')}</span>}
            rules={[{ required: canEditReviewedBy, message: t('selectReviewDate', 'กรุณาเลือกวันที่ตรวจสอบ') }]}
          >
            {canEditReviewedBy ? (
              <DatePicker disabled={false} style={{ width: '100%' }} />
            ) : (
              <Tooltip title={t('noPermissionEdit', 'You do not have permission to edit this field.')}>
                <span style={{ display: 'block' }}>
                  <DatePicker disabled={true} style={{ width: '100%' }} />
                </span>
              </Tooltip>
            )}
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name={['auditTrail', 2, 'userInfo', 'name']}
            label={<span className='font-medium'>* {t('approver', 'ผู้อนุมัติ')}</span>}
            rules={[{ required: canEditApprovedBy, message: t('selectApprover', 'กรุณาเลือกผู้อนุมัติ') }]}
          >
            {canEditApprovedBy ? (
              <EmployeeSelector disabled={false} />
            ) : (
              <Tooltip title={t('noPermissionEdit', 'You do not have permission to edit this field.')}>
                <span style={{ display: 'block' }}>
                  <EmployeeSelector disabled={true} />
                </span>
              </Tooltip>
            )}
          </Form.Item>
          <Form.Item
            name={['auditTrail', 2, 'time']}
            label={<span className='font-medium'>{t('approveDate', 'วันที่อนุมัติ')}</span>}
            rules={[{ required: canEditApprovedBy, message: t('selectApproveDate', 'กรุณาเลือกวันที่อนุมัติ') }]}
          >
            {canEditApprovedBy ? (
              <DatePicker disabled={false} style={{ width: '100%' }} />
            ) : (
              <Tooltip title={t('noPermissionEdit', 'You do not have permission to edit this field.')}>
                <span style={{ display: 'block' }}>
                  <DatePicker disabled={true} style={{ width: '100%' }} />
                </span>
              </Tooltip>
            )}
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default AuditTrailSection;
