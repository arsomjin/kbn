import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  notification,
  Row,
  Col,
  Avatar,
  Typography,
  Tabs,
  Alert
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { hasPermission, hasProvinceAccess } from '../../../utils/permissions';
import { PERMISSIONS } from '../../../constants/Permissions';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  position: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approverName?: string;
  approvedDate?: string;
  rejectionReason?: string;
  provinceId: string;
  branchCode?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApprovalAction {
  requestId: string;
  action: 'approve' | 'reject';
  comments?: string;
}

/**
 * Leave Approval Component
 */
export const LeaveApproval: React.FC = () => {
  const { t } = useTranslation('hr');
  const { provinceId, branchCode } = useParams<{ provinceId: string; branchCode?: string }>();
  const { userProfile } = useAuth();

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject'>('approve');
  const [form] = Form.useForm();

  // Check permissions
  const canApprove = hasPermission(userProfile, PERMISSIONS.LEAVE_APPROVE);
  const canReject = hasPermission(userProfile, PERMISSIONS.LEAVE_REJECT);
  const hasProvinceAccessCheck = provinceId ? hasProvinceAccess(userProfile, provinceId) : true;

  // Mock data for development
  const mockRequests: LeaveRequest[] = [
    {
      id: '1',
      employeeId: 'emp1',
      employeeName: 'John Doe',
      department: 'IT',
      position: 'Developer',
      leaveType: 'annual',
      startDate: '2024-12-25',
      endDate: '2024-12-27',
      days: 3,
      reason: 'Christmas vacation with family',
      status: 'pending',
      provinceId: provinceId || 'bangkok',
      branchCode: branchCode,
      createdAt: '2024-12-18T08:00:00Z',
      updatedAt: '2024-12-18T08:00:00Z'
    },
    {
      id: '2',
      employeeId: 'emp2',
      employeeName: 'Jane Smith',
      department: 'HR',
      position: 'HR Specialist',
      leaveType: 'sick',
      startDate: '2024-12-23',
      endDate: '2024-12-24',
      days: 2,
      reason: 'Medical appointment and recovery',
      status: 'pending',
      provinceId: provinceId || 'bangkok',
      branchCode: branchCode,
      createdAt: '2024-12-20T10:00:00Z',
      updatedAt: '2024-12-20T10:00:00Z'
    },
    {
      id: '3',
      employeeId: 'emp3',
      employeeName: 'Bob Wilson',
      department: 'Sales',
      position: 'Sales Manager',
      leaveType: 'personal',
      startDate: '2024-12-30',
      endDate: '2024-12-30',
      days: 1,
      reason: 'Personal matters',
      status: 'approved',
      approvedBy: userProfile?.uid,
      approverName: 'Manager Name',
      approvedDate: '2024-12-21T14:00:00Z',
      provinceId: provinceId || 'bangkok',
      branchCode: branchCode,
      createdAt: '2024-12-19T15:00:00Z',
      updatedAt: '2024-12-21T14:00:00Z'
    }
  ];

  useEffect(() => {
    if ((canApprove || canReject) && hasProvinceAccessCheck) {
      loadLeaveRequests();
    }
  }, [canApprove, canReject, hasProvinceAccessCheck, provinceId, branchCode]);

  const loadLeaveRequests = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual Firebase query
      // const leaveRequestsRef = collection(db, 'data', provinceId!, 'leaveRequests');
      // const q = query(
      //   leaveRequestsRef,
      //   where('provinceId', '==', provinceId),
      //   ...(branchCode ? [where('branchCode', '==', branchCode)] : []),
      //   orderBy('createdAt', 'desc')
      // );
      // const snapshot = await getDocs(q);
      // const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Using mock data for now
      const filteredRequests = mockRequests.filter(
        req => req.provinceId === provinceId && (!branchCode || req.branchCode === branchCode)
      );

      setLeaveRequests(filteredRequests);
    } catch (error) {
      console.error('Error loading leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = (request: LeaveRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setCurrentAction(action);
    form.resetFields();
    setApprovalModalVisible(true);
  };

  const submitApprovalAction = async (values: { comments?: string }) => {
    if (!selectedRequest) return;

    try {
      setActionLoading(selectedRequest.id);

      const updateData = {
        status: currentAction === 'approve' ? 'approved' : 'rejected',
        approvedBy: userProfile?.uid,
        approverName: userProfile?.displayName || 'Manager',
        approvedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(currentAction === 'reject' && values.comments
          ? {
              rejectionReason: values.comments
            }
          : {})
      };

      // TODO: Update in Firebase
      // await updateDoc(doc(db, 'data', provinceId!, 'leaveRequests', selectedRequest.id), updateData);

      notification.success({
        message: t(`leave.${currentAction}Success`),
        description: t(`leave.${currentAction}SuccessDesc`, {
          name: selectedRequest.employeeName
        })
      });

      setApprovalModalVisible(false);
      loadLeaveRequests();
    } catch (error) {
      console.error('Error updating leave request:', error);
      notification.error({
        message: t('leave.error.actionFailed'),
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setDetailModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'pending':
        return 'orange';
      case 'rejected':
        return 'red';
      default:
        return 'default';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'annual':
        return 'blue';
      case 'sick':
        return 'volcano';
      case 'personal':
        return 'purple';
      case 'maternity':
        return 'pink';
      case 'paternity':
        return 'cyan';
      default:
        return 'default';
    }
  };

  const getPriorityLevel = (request: LeaveRequest) => {
    const today = dayjs();
    const startDate = dayjs(request.startDate);
    const daysUntilLeave = startDate.diff(today, 'days');

    if (daysUntilLeave <= 1) return 'high';
    if (daysUntilLeave <= 3) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ff4d4f';
      case 'medium':
        return '#faad14';
      case 'low':
        return '#52c41a';
      default:
        return '#d9d9d9';
    }
  };

  const renderApprovalActions = (request: LeaveRequest) => {
    if (request.status !== 'pending') return null;

    return (
      <Space>
        {canApprove && (
          <Button
            type='primary'
            size='small'
            icon={<CheckOutlined />}
            onClick={() => handleApprovalAction(request, 'approve')}
            loading={actionLoading === request.id}
          >
            {t('leave.approve')}
          </Button>
        )}
        {canReject && (
          <Button
            danger
            size='small'
            icon={<CloseOutlined />}
            onClick={() => handleApprovalAction(request, 'reject')}
            loading={actionLoading === request.id}
          >
            {t('leave.reject')}
          </Button>
        )}
      </Space>
    );
  };

  const columns = [
    {
      title: t('leave.table.employee'),
      key: 'employee',
      render: (request: LeaveRequest) => (
        <Space>
          <Avatar src={request.employeeAvatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{request.employeeName}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {request.department} • {request.position}
            </div>
          </div>
        </Space>
      )
    },
    {
      title: t('leave.table.type'),
      dataIndex: 'leaveType',
      key: 'leaveType',
      render: (type: string) => <Tag color={getLeaveTypeColor(type)}>{t(`leave.types.${type}`)}</Tag>
    },
    {
      title: t('leave.table.period'),
      key: 'period',
      render: (request: LeaveRequest) => {
        const priority = getPriorityLevel(request);
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarOutlined />
              <span>{dayjs(request.startDate).format('DD/MM/YYYY')}</span>
              {request.startDate !== request.endDate && (
                <>
                  <span>-</span>
                  <span>{dayjs(request.endDate).format('DD/MM/YYYY')}</span>
                </>
              )}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: getPriorityColor(priority),
                fontWeight: 500,
                marginTop: 2
              }}
            >
              {t(`leave.priority.${priority}`)} • {request.days} {t('leave.daysUnit')}
            </div>
          </div>
        );
      }
    },
    {
      title: t('leave.table.reason'),
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      width: 200
    },
    {
      title: t('leave.table.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{t(`leave.status.${status}`)}</Tag>
    },
    {
      title: t('leave.table.submittedDate'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <div>
          <div>{dayjs(date).format('DD/MM/YYYY')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{dayjs(date).format('HH:mm')}</div>
        </div>
      )
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (request: LeaveRequest) => (
        <Space>
          <Button type='text' icon={<EyeOutlined />} onClick={() => handleViewDetails(request)} />
          {renderApprovalActions(request)}
        </Space>
      )
    }
  ];

  const pendingRequests = leaveRequests.filter(r => r.status === 'pending');
  const processedRequests = leaveRequests.filter(r => r.status !== 'pending');

  if ((!canApprove && !canReject) || !hasProvinceAccessCheck) {
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
    <div>
      <Card>
        <Row justify='space-between' align='middle' style={{ marginBottom: 16 }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              {t('leave.approvalTitle')}
            </Title>
          </Col>
          <Col>
            <Alert
              message={t('leave.pendingCount', { count: pendingRequests.length })}
              type={pendingRequests.length > 0 ? 'warning' : 'success'}
              showIcon
            />
          </Col>
        </Row>

        <Tabs defaultActiveKey='pending'>
          <TabPane
            tab={
              <span>
                <ClockCircleOutlined />
                {t('leave.tabs.pending')} ({pendingRequests.length})
              </span>
            }
            key='pending'
          >
            <Table
              columns={columns}
              dataSource={pendingRequests}
              rowKey='id'
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  t('common.pagination.total', {
                    start: range[0],
                    end: range[1],
                    total
                  })
              }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <CheckOutlined />
                {t('leave.tabs.processed')} ({processedRequests.length})
              </span>
            }
            key='processed'
          >
            <Table
              columns={columns}
              dataSource={processedRequests}
              rowKey='id'
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  t('common.pagination.total', {
                    start: range[0],
                    end: range[1],
                    total
                  })
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Approval Action Modal */}
      <Modal
        title={t(`leave.${currentAction}Request`)}
        open={approvalModalVisible}
        onCancel={() => setApprovalModalVisible(false)}
        footer={null}
      >
        {selectedRequest && (
          <div>
            <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
              <Text strong>{selectedRequest.employeeName}</Text>
              <br />
              <Text type='secondary'>
                {t(`leave.types.${selectedRequest.leaveType}`)} • {selectedRequest.days} {t('leave.daysUnit')}
              </Text>
              <br />
              <Text type='secondary'>
                {dayjs(selectedRequest.startDate).format('DD/MM/YYYY')} -{' '}
                {dayjs(selectedRequest.endDate).format('DD/MM/YYYY')}
              </Text>
            </div>

            <Form form={form} layout='vertical' onFinish={submitApprovalAction}>
              {currentAction === 'reject' && (
                <Form.Item
                  name='comments'
                  label={t('leave.rejectionReason')}
                  rules={[{ required: true, message: t('leave.rejectionReasonRequired') }]}
                >
                  <TextArea rows={4} placeholder={t('leave.rejectionReasonPlaceholder')} />
                </Form.Item>
              )}

              {currentAction === 'approve' && (
                <Form.Item name='comments' label={t('leave.approvalComments')}>
                  <TextArea rows={3} placeholder={t('leave.approvalCommentsPlaceholder')} />
                </Form.Item>
              )}

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setApprovalModalVisible(false)}>{t('common.cancel')}</Button>
                  <Button
                    type='primary'
                    htmlType='submit'
                    loading={!!actionLoading}
                    danger={currentAction === 'reject'}
                  >
                    {t(`leave.${currentAction}`)}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={t('leave.requestDetails')}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key='close' onClick={() => setDetailModalVisible(false)}>
            {t('common.close')}
          </Button>
        ]}
        width={600}
      >
        {selectedRequest && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>{t('leave.details.employee')}:</Text>
                <div style={{ marginTop: 4 }}>
                  <Space>
                    <Avatar src={selectedRequest.employeeAvatar} icon={<UserOutlined />} />
                    <div>
                      <div>{selectedRequest.employeeName}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {selectedRequest.department} • {selectedRequest.position}
                      </div>
                    </div>
                  </Space>
                </div>
              </Col>
              <Col span={12}>
                <Text strong>{t('leave.details.status')}:</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag color={getStatusColor(selectedRequest.status)}>
                    {t(`leave.status.${selectedRequest.status}`)}
                  </Tag>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Text strong>{t('leave.details.type')}:</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag color={getLeaveTypeColor(selectedRequest.leaveType)}>
                    {t(`leave.types.${selectedRequest.leaveType}`)}
                  </Tag>
                </div>
              </Col>
              <Col span={12}>
                <Text strong>{t('leave.details.totalDays')}:</Text>
                <div style={{ marginTop: 4 }}>
                  {selectedRequest.days} {t('leave.daysUnit')}
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Text strong>{t('leave.details.startDate')}:</Text>
                <div style={{ marginTop: 4 }}>{dayjs(selectedRequest.startDate).format('DD/MM/YYYY')}</div>
              </Col>
              <Col span={12}>
                <Text strong>{t('leave.details.endDate')}:</Text>
                <div style={{ marginTop: 4 }}>{dayjs(selectedRequest.endDate).format('DD/MM/YYYY')}</div>
              </Col>
            </Row>

            <Row style={{ marginTop: 16 }}>
              <Col span={24}>
                <Text strong>{t('leave.details.reason')}:</Text>
                <div
                  style={{
                    marginTop: 8,
                    padding: 12,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 6,
                    minHeight: 60
                  }}
                >
                  {selectedRequest.reason}
                </div>
              </Col>
            </Row>

            {selectedRequest.status !== 'pending' && (
              <Row style={{ marginTop: 16 }}>
                <Col span={24}>
                  <Text strong>{t('leave.details.approvalInfo')}:</Text>
                  <div
                    style={{
                      marginTop: 8,
                      padding: 12,
                      backgroundColor: selectedRequest.status === 'approved' ? '#f6ffed' : '#fff2f0',
                      borderRadius: 6,
                      border: `1px solid ${selectedRequest.status === 'approved' ? '#b7eb8f' : '#ffccc7'}`
                    }}
                  >
                    <div>
                      <Text strong>{t('leave.details.processedBy')}:</Text> {selectedRequest.approverName}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <Text strong>{t('leave.details.processedDate')}:</Text>{' '}
                      {dayjs(selectedRequest.approvedDate).format('DD/MM/YYYY HH:mm')}
                    </div>
                    {selectedRequest.rejectionReason && (
                      <div style={{ marginTop: 8 }}>
                        <Text strong>{t('leave.details.rejectionReason')}:</Text>
                        <div style={{ marginTop: 4 }}>{selectedRequest.rejectionReason}</div>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            )}

            {selectedRequest.status === 'pending' && (
              <Row justify='center' style={{ marginTop: 24 }}>
                <Col>
                  <Space size='large'>
                    {canApprove && (
                      <Button
                        type='primary'
                        size='large'
                        icon={<CheckOutlined />}
                        onClick={() => {
                          setDetailModalVisible(false);
                          handleApprovalAction(selectedRequest, 'approve');
                        }}
                      >
                        {t('leave.approve')}
                      </Button>
                    )}
                    {canReject && (
                      <Button
                        danger
                        size='large'
                        icon={<CloseOutlined />}
                        onClick={() => {
                          setDetailModalVisible(false);
                          handleApprovalAction(selectedRequest, 'reject');
                        }}
                      >
                        {t('leave.reject')}
                      </Button>
                    )}
                  </Space>
                </Col>
              </Row>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeaveApproval;
