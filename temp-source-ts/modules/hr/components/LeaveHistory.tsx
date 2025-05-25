import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Table, Card, Tag, Space, Button, DatePicker, Select, Input, Modal, Row, Col, Tooltip, Typography } from 'antd';
import {
  CalendarOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { hasPermission, hasProvinceAccess } from '../../../utils/permissions';
import { PERMISSIONS } from '../../../constants/Permissions';
import dayjs from '../../../utils/dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;
const { Text } = Typography;

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
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

/**
 * Leave History Component
 */
export const LeaveHistory: React.FC = () => {
  const { t } = useTranslation('hr');
  const { provinceId, branchCode } = useParams<{ provinceId: string; branchCode?: string }>();
  const { userProfile } = useAuth();

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Check permissions
  const canView = hasPermission(userProfile, PERMISSIONS.LEAVE_VIEW);
  const canEdit = hasPermission(userProfile, PERMISSIONS.LEAVE_EDIT);
  const hasProvinceAccessCheck = provinceId ? hasProvinceAccess(userProfile, provinceId) : true;

  // Mock data for development
  const mockLeaveRequests: LeaveRequest[] = [
    {
      id: '1',
      employeeId: userProfile?.uid || 'emp1',
      employeeName: 'John Doe',
      leaveType: 'annual',
      startDate: '2024-12-25',
      endDate: '2024-12-27',
      days: 3,
      reason: 'Christmas vacation with family',
      status: 'approved',
      approvedBy: 'manager1',
      approverName: 'Jane Smith',
      approvedDate: '2024-12-20T10:00:00Z',
      provinceId: provinceId || 'bangkok',
      branchCode: branchCode,
      createdAt: '2024-12-18T08:00:00Z',
      updatedAt: '2024-12-20T10:00:00Z'
    },
    {
      id: '2',
      employeeId: userProfile?.uid || 'emp1',
      employeeName: 'John Doe',
      leaveType: 'sick',
      startDate: '2024-11-15',
      endDate: '2024-11-16',
      days: 2,
      reason: 'Flu symptoms and doctor appointment',
      status: 'approved',
      approvedBy: 'manager1',
      approverName: 'Jane Smith',
      approvedDate: '2024-11-15T09:00:00Z',
      provinceId: provinceId || 'bangkok',
      branchCode: branchCode,
      createdAt: '2024-11-14T16:00:00Z',
      updatedAt: '2024-11-15T09:00:00Z'
    },
    {
      id: '3',
      employeeId: userProfile?.uid || 'emp1',
      employeeName: 'John Doe',
      leaveType: 'personal',
      startDate: '2024-10-30',
      endDate: '2024-10-30',
      days: 1,
      reason: 'Personal matters',
      status: 'rejected',
      approvedBy: 'manager1',
      approverName: 'Jane Smith',
      rejectionReason: 'Already too many people on leave that day',
      approvedDate: '2024-10-28T14:00:00Z',
      provinceId: provinceId || 'bangkok',
      branchCode: branchCode,
      createdAt: '2024-10-25T11:00:00Z',
      updatedAt: '2024-10-28T14:00:00Z'
    }
  ];

  useEffect(() => {
    if (canView && hasProvinceAccessCheck) {
      loadLeaveHistory();
    }
  }, [canView, hasProvinceAccessCheck, provinceId, branchCode]);

  const loadLeaveHistory = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual Firebase query
      // const leaveRequestsRef = collection(db, 'data', provinceId!, 'leaveRequests');
      // const q = query(
      //   leaveRequestsRef,
      //   where('employeeId', '==', userProfile?.uid),
      //   where('provinceId', '==', provinceId),
      //   orderBy('createdAt', 'desc')
      // );
      // const snapshot = await getDocs(q);
      // const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Using mock data for now
      const filteredRequests = mockLeaveRequests.filter(
        req =>
          req.provinceId === provinceId &&
          req.employeeId === userProfile?.uid &&
          (!branchCode || req.branchCode === branchCode)
      );

      setLeaveRequests(filteredRequests);
    } catch (error) {
      console.error('Error loading leave history:', error);
    } finally {
      setLoading(false);
    }
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

  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setDetailModalVisible(true);
  };

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch =
      searchText === '' ||
      request.reason.toLowerCase().includes(searchText.toLowerCase()) ||
      request.leaveType.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = leaveTypeFilter === 'all' || request.leaveType === leaveTypeFilter;

    let matchesDateRange = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const requestStart = dayjs(request.startDate);
      const requestEnd = dayjs(request.endDate);
      matchesDateRange =
        (requestStart.isSameOrAfter(dateRange[0]) && requestEnd.isSameOrBefore(dateRange[1])) ||
        (requestStart.isSameOrBefore(dateRange[1]) && requestEnd.isSameOrAfter(dateRange[0]));
    }

    return matchesSearch && matchesStatus && matchesType && matchesDateRange;
  });

  const columns = [
    {
      title: t('leave.table.type'),
      dataIndex: 'leaveType',
      key: 'leaveType',
      render: (type: string) => <Tag color={getLeaveTypeColor(type)}>{t(`leave.types.${type}`)}</Tag>
    },
    {
      title: t('leave.table.period'),
      key: 'period',
      render: (request: LeaveRequest) => (
        <div>
          <div>{dayjs(request.startDate).format('DD/MM/YYYY')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {request.startDate === request.endDate
              ? t('leave.singleDay')
              : `${t('common.to')} ${dayjs(request.endDate).format('DD/MM/YYYY')}`}
          </div>
        </div>
      )
    },
    {
      title: t('leave.table.days'),
      dataIndex: 'days',
      key: 'days',
      align: 'center' as const,
      render: (days: number) => (
        <Text strong>
          {days} {t('leave.daysUnit')}
        </Text>
      )
    },
    {
      title: t('leave.table.reason'),
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: {
        showTitle: false
      },
      render: (reason: string) => (
        <Tooltip title={reason} placement='topLeft'>
          {reason}
        </Tooltip>
      )
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
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (request: LeaveRequest) => (
        <Space>
          <Button type='text' icon={<EyeOutlined />} onClick={() => handleViewDetails(request)} />
          {canEdit && request.status === 'pending' && (
            <Button
              type='text'
              icon={<EditOutlined />}
              onClick={() => {
                // TODO: Navigate to edit form
                console.log('Edit request:', request.id);
              }}
            />
          )}
        </Space>
      )
    }
  ];

  if (!canView || !hasProvinceAccessCheck) {
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
            <h2 style={{ margin: 0 }}>{t('leave.historyTitle')}</h2>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Search
              placeholder={t('leave.searchPlaceholder')}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select
              style={{ width: '100%' }}
              placeholder={t('leave.filterStatus')}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value='all'>{t('common.all')}</Option>
              <Option value='pending'>{t('leave.status.pending')}</Option>
              <Option value='approved'>{t('leave.status.approved')}</Option>
              <Option value='rejected'>{t('leave.status.rejected')}</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              style={{ width: '100%' }}
              placeholder={t('leave.filterType')}
              value={leaveTypeFilter}
              onChange={setLeaveTypeFilter}
            >
              <Option value='all'>{t('common.all')}</Option>
              <Option value='annual'>{t('leave.types.annual')}</Option>
              <Option value='sick'>{t('leave.types.sick')}</Option>
              <Option value='personal'>{t('leave.types.personal')}</Option>
              <Option value='maternity'>{t('leave.types.maternity')}</Option>
              <Option value='paternity'>{t('leave.types.paternity')}</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={[t('common.startDate'), t('common.endDate')]}
              value={dateRange}
              onChange={setDateRange}
              allowClear
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredRequests}
          rowKey='id'
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              t('common.pagination.total', {
                start: range[0],
                end: range[1],
                total
              })
          }}
        />
      </Card>

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
                <Text strong>{t('leave.details.type')}:</Text>
                <div>
                  <Tag color={getLeaveTypeColor(selectedRequest.leaveType)} style={{ marginTop: 4 }}>
                    {t(`leave.types.${selectedRequest.leaveType}`)}
                  </Tag>
                </div>
              </Col>
              <Col span={12}>
                <Text strong>{t('leave.details.status')}:</Text>
                <div>
                  <Tag color={getStatusColor(selectedRequest.status)} style={{ marginTop: 4 }}>
                    {t(`leave.status.${selectedRequest.status}`)}
                  </Tag>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Text strong>{t('leave.details.startDate')}:</Text>
                <div>{dayjs(selectedRequest.startDate).format('DD/MM/YYYY')}</div>
              </Col>
              <Col span={12}>
                <Text strong>{t('leave.details.endDate')}:</Text>
                <div>{dayjs(selectedRequest.endDate).format('DD/MM/YYYY')}</div>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Text strong>{t('leave.details.totalDays')}:</Text>
                <div>
                  {selectedRequest.days} {t('leave.daysUnit')}
                </div>
              </Col>
              <Col span={12}>
                <Text strong>{t('leave.details.submittedDate')}:</Text>
                <div>{dayjs(selectedRequest.createdAt).format('DD/MM/YYYY HH:mm')}</div>
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
                      <Text strong>{t('leave.details.approvedBy')}:</Text> {selectedRequest.approverName}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <Text strong>{t('leave.details.approvedDate')}:</Text>{' '}
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
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeaveHistory;
