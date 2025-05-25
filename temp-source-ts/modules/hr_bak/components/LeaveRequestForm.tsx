import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Form, Button, Card, DatePicker, Select, Input, notification, Row, Col, Space, Alert } from 'antd';
import { CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { hasPermission, hasProvinceAccess } from '../../../utils/permissions';
import { PERMISSIONS } from '../../../constants/Permissions';
import dayjs from '../../../utils/dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

interface LeaveRequest {
  id?: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  provinceId: string;
  branchCode?: string;
  createdAt: string;
  updatedAt: string;
}

interface LeaveFormData {
  leaveType: string;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
  reason: string;
}

/**
 * Leave Request Component
 */
export const LeaveRequestForm: React.FC = () => {
  const { t } = useTranslation('hr');
  const { provinceId, branchCode } = useParams<{ provinceId: string; branchCode?: string }>();
  const { userProfile } = useAuth();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState<Record<string, number>>({});

  // Check permissions
  const canCreate = hasPermission(userProfile, PERMISSIONS.LEAVE_CREATE);
  const hasProvinceAccessCheck = provinceId ? hasProvinceAccess(userProfile, provinceId) : true;

  // Mock leave balance data
  const mockLeaveBalance = {
    annual: 15,
    sick: 10,
    personal: 5,
    maternity: 90,
    paternity: 15
  };

  useEffect(() => {
    if (canCreate && hasProvinceAccessCheck) {
      loadLeaveBalance();
    }
  }, [canCreate, hasProvinceAccessCheck, provinceId]);

  const loadLeaveBalance = async () => {
    try {
      // TODO: Load actual leave balance from Firebase
      setLeaveBalance(mockLeaveBalance);
    } catch (error) {
      console.error('Error loading leave balance:', error);
      notification.error({
        message: t('leave.error.loadBalanceFailed'),
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const calculateLeaveDays = (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs): number => {
    if (!startDate || !endDate) return 0;

    let days = 0;
    let current = startDate.clone();

    while (current.isSameOrBefore(endDate)) {
      // Skip weekends (Saturday = 6, Sunday = 0)
      const dayOfWeek = current.day();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++;
      }
      current = current.add(1, 'day');
    }

    return days;
  };

  const handleSubmit = async (values: LeaveFormData) => {
    try {
      setLoading(true);

      const [startDate, endDate] = values.dateRange;
      const days = calculateLeaveDays(startDate, endDate);

      // Check leave balance
      const availableBalance = leaveBalance[values.leaveType] || 0;
      if (days > availableBalance) {
        notification.warning({
          message: t('leave.warning.insufficientBalance'),
          description: t('leave.warning.insufficientBalanceDesc', {
            requested: days,
            available: availableBalance
          })
        });
        return;
      }

      const leaveRequestData: Omit<LeaveRequest, 'id'> = {
        employeeId: userProfile?.uid || '',
        leaveType: values.leaveType,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        days,
        reason: values.reason,
        status: 'pending',
        provinceId: provinceId!,
        branchCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // TODO: Submit to Firebase
      // await addDoc(collection(db, 'data', provinceId!, 'leaveRequests'), leaveRequestData);

      notification.success({
        message: t('leave.submitSuccess'),
        description: t('leave.submitSuccessDesc')
      });

      form.resetFields();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      notification.error({
        message: t('leave.error.submitFailed'),
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      const days = calculateLeaveDays(dates[0], dates[1]);
      const leaveType = form.getFieldValue('leaveType');

      if (leaveType && days > (leaveBalance[leaveType] || 0)) {
        notification.warning({
          message: t('leave.warning.exceedsBalance'),
          description: t('leave.warning.exceedsBalanceDesc', {
            days,
            balance: leaveBalance[leaveType] || 0
          })
        });
      }
    }
  };

  if (!canCreate || !hasProvinceAccessCheck) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <h3>{t('common.accessDenied')}</h3>
          <p>{t('common.insufficientPermissions')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <Card title={t('leave.requestTitle')} bordered={false}>
          <Form form={form} layout='vertical' onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name='leaveType'
                  label={t('leave.form.leaveType')}
                  rules={[{ required: true, message: t('leave.form.leaveTypeRequired') }]}
                >
                  <Select placeholder={t('leave.form.selectLeaveType')} size='large'>
                    <Option value='annual'>{t('leave.types.annual')}</Option>
                    <Option value='sick'>{t('leave.types.sick')}</Option>
                    <Option value='personal'>{t('leave.types.personal')}</Option>
                    <Option value='maternity'>{t('leave.types.maternity')}</Option>
                    <Option value='paternity'>{t('leave.types.paternity')}</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name='dateRange'
                  label={t('leave.form.dateRange')}
                  rules={[{ required: true, message: t('leave.form.dateRangeRequired') }]}
                >
                  <RangePicker
                    style={{ width: '100%' }}
                    size='large'
                    disabledDate={current => current && current < dayjs().startOf('day')}
                    onChange={handleDateRangeChange}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name='reason'
                  label={t('leave.form.reason')}
                  rules={[{ required: true, message: t('leave.form.reasonRequired') }]}
                >
                  <TextArea rows={4} placeholder={t('leave.form.reasonPlaceholder')} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginBottom: 0 }}>
              <Space>
                <Button type='primary' htmlType='submit' loading={loading} icon={<CalendarOutlined />} size='large'>
                  {t('leave.submitRequest')}
                </Button>
                <Button size='large' onClick={() => form.resetFields()}>
                  {t('common.reset')}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card title={t('leave.balanceTitle')} bordered={false}>
          <div style={{ marginBottom: 16 }}>
            <Alert message={t('leave.balanceInfo')} type='info' showIcon style={{ marginBottom: 16 }} />
          </div>

          {Object.entries(leaveBalance).map(([type, balance]) => (
            <div
              key={type}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 12,
                padding: '8px 12px',
                backgroundColor: '#f5f5f5',
                borderRadius: 6
              }}
            >
              <span>{t(`leave.types.${type}`)}</span>
              <span
                style={{
                  fontWeight: 500,
                  color: balance > 5 ? '#52c41a' : balance > 0 ? '#faad14' : '#ff4d4f'
                }}
              >
                {balance} {t('leave.days')}
              </span>
            </div>
          ))}

          <div style={{ marginTop: 16, padding: 12, backgroundColor: '#fafafa', borderRadius: 6 }}>
            <small style={{ color: '#666' }}>{t('leave.balanceNote')}</small>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default LeaveRequestForm;
