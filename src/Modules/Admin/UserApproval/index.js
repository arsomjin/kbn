import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Descriptions, 
  message,
  Popconfirm,
  Select,
  Row,
  Col,
  Typography
} from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined, 
  EyeOutlined,
  UserOutlined,
  BankOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { app } from '../../../firebase';
import { usePermissions } from 'hooks/usePermissions';
import LayoutWithRBAC from 'components/layout/LayoutWithRBAC';
import { 
  getRequestTypeInfo, 
  getDepartmentInfo, 
  getLocationInfo 
} from 'utils/userMappings';

const { Title } = Typography;
const { Option } = Select;

const UserApproval = () => {
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('pending');
  
  const { user } = useSelector(state => state.auth);
  const { filterDataByUserAccess, hasPermission, userRBAC } = usePermissions();

  // Validate Clean Slate RBAC structure
  React.useEffect(() => {
    if (user && !user.access) {
      console.warn('🚨 UserApproval: User missing Clean Slate RBAC structure:', user.uid);
      console.warn('⚠️ User needs migration to user.access.* format');
    }
  }, [user]);

  useEffect(() => {
    fetchApprovalRequests();
  }, [filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchApprovalRequests = async () => {
    setLoading(true);
    try {
      let query = app.firestore().collection('approvalRequests');
      
      // Filter by status
      if (filterStatus !== 'all') {
        query = query.where('status', '==', filterStatus);
      }

      // Apply Clean Slate RBAC geographic filtering
      if (userRBAC?.geographic?.scope !== 'ALL') {
        const allowedProvinces = userRBAC?.geographic?.allowedProvinces || [];
        if (allowedProvinces.length > 0) {
          query = query.where('targetProvince', 'in', allowedProvinces);
        }
      }

      const snapshot = await query.orderBy('createdAt', 'desc').get();
      
      let requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt),
      }));

      // Apply additional RBAC filtering if needed (for branch-level access)
      if (userRBAC?.geographic?.scope === 'BRANCH') {
        requests = filterDataByUserAccess(requests, {
          provinceField: 'targetProvince',
          branchField: 'targetBranch'
        });
      }

      setApprovalRequests(requests);
    } catch (error) {
      console.error('Error fetching approval requests:', error);
      message.error('ไม่สามารถโหลดข้อมูลคำขออนุมัติได้');
    }
    setLoading(false);
  };

  const handleApprove = async (requestId, userData) => {
    setActionLoading(true);
    try {
      const batch = app.firestore().batch();

      // Update user status
      const userRef = app.firestore().collection('users').doc(userData.userId);
      batch.update(userRef, {
        'auth.isActive': true,
        'auth.isApproved': true,
        'auth.approvalStatus': 'approved',
        'auth.approvedBy': user.uid,
        'auth.approvedAt': Date.now()
      });

      // Update approval request
      const requestRef = app.firestore().collection('approvalRequests').doc(requestId);
      batch.update(requestRef, {
        status: 'approved',
        approvedBy: user.uid,
        approvedAt: Date.now(),
        approverName: user.displayName || `${user.firstName} ${user.lastName}`
      });

      await batch.commit();
      
      message.success('อนุมัติผู้ใช้เรียบร้อยแล้ว');
      fetchApprovalRequests();
    } catch (error) {
      console.error('Error approving user:', error);
      message.error('ไม่สามารถอนุมัติผู้ใช้ได้');
    }
    setActionLoading(false);
  };

  const handleReject = async (requestId, reason) => {
    setActionLoading(true);
    try {
      const batch = app.firestore().batch();

      // Update approval request
      const requestRef = app.firestore().collection('approvalRequests').doc(requestId);
      batch.update(requestRef, {
        status: 'rejected',
        rejectedBy: user.uid,
        rejectedAt: Date.now(),
        rejectionReason: reason,
        rejectorName: user.displayName || `${user.firstName} ${user.lastName}`
      });

      await batch.commit();
      
      message.success('ปฏิเสธคำขอเรียบร้อยแล้ว');
      fetchApprovalRequests();
    } catch (error) {
      console.error('Error rejecting user:', error);
      message.error('ไม่สามารถปฏิเสธคำขอได้');
    }
    setActionLoading(false);
  };

  const showDetails = (record) => {
    setSelectedRequest(record);
    setModalVisible(true);
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'รอการอนุมัติ' },
      approved: { color: 'green', text: 'อนุมัติแล้ว' },
      rejected: { color: 'red', text: 'ปฏิเสธ' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getRequestTypeTag = (requestType) => {
    const requestInfo = getRequestTypeInfo(requestType);
    return <Tag color={requestInfo.color}>{requestInfo.text}</Tag>;
  };

  const columns = [
    {
      title: 'ชื่อ-นามสกุล',
      dataIndex: ['userData', 'displayName'],
      key: 'displayName',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          <span>{text || `${record.userData?.firstName} ${record.userData?.lastName}`}</span>
        </Space>
      ),
    },
    {
      title: 'อีเมล',
      dataIndex: ['userData', 'email'],
      key: 'email',
    },
    {
      title: 'ประเภทคำขอ',
      dataIndex: 'requestType',
      key: 'requestType',
      render: (requestType) => getRequestTypeTag(requestType),
    },
    {
      title: 'แผนก',
      dataIndex: ['userData', 'department'],
      key: 'department',
      render: (department) => {
        if (!department) return '-';
        const deptInfo = getDepartmentInfo(department);
        return <Tag color={deptInfo.color}>{deptInfo.text}</Tag>;
      },
    },
    {
      title: 'จังหวัด',
      dataIndex: 'targetProvince',
      key: 'targetProvince',
      render: (province) => {
        const locationInfo = getLocationInfo(province, '');
        return (
          <Space>
            <EnvironmentOutlined />
            <span>{locationInfo.provinceName || province}</span>
          </Space>
        );
      },
    },
    {
      title: 'สาขา',
      dataIndex: 'targetBranch',
      key: 'targetBranch',
      render: (branch) => {
        const locationInfo = getLocationInfo('', branch);
        return (
          <Space>
            <BankOutlined />
            <span>{locationInfo.branchName || branch}</span>
          </Space>
        );
      },
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'วันที่ขอ',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date.toLocaleDateString('th-TH'),
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => showDetails(record)}
          >
            ดูรายละเอียด
          </Button>
          
          {record.status === 'pending' && hasPermission('users.approve', {
            provinceId: record.targetProvince,
            branchCode: record.targetBranch
          }) && (
            <>
              <Popconfirm
                title="อนุมัติผู้ใช้นี้?"
                description="ผู้ใช้จะสามารถเข้าใช้งานระบบได้ทันที"
                onConfirm={() => handleApprove(record.id, record)}
                okText="อนุมัติ"
                cancelText="ยกเลิก"
                okType="primary"
              >
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  loading={actionLoading}
                  size="small"
                >
                  อนุมัติ
                </Button>
              </Popconfirm>
              
              <Popconfirm
                title="ปฏิเสธคำขอนี้?"
                description="กรุณาระบุเหตุผล"
                onConfirm={() => handleReject(record.id, 'ไม่ระบุเหตุผล')}
                okText="ปฏิเสธ"
                cancelText="ยกเลิก"
                okType="danger"
              >
                <Button
                  danger
                  icon={<CloseOutlined />}
                  loading={actionLoading}
                  size="small"
                >
                  ปฏิเสธ
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <LayoutWithRBAC permission="users.manage" title="จัดการการอนุมัติผู้ใช้">
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Space size="large">
              <Title level={4} style={{ margin: 0 }}>คำขออนุมัติผู้ใช้งาน</Title>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 200 }}
              >
                <Option value="all">ทั้งหมด</Option>
                <Option value="pending">รอการอนุมัติ</Option>
                <Option value="approved">อนุมัติแล้ว</Option>
                <Option value="rejected">ปฏิเสธ</Option>
              </Select>
              <Button onClick={fetchApprovalRequests} loading={loading}>
                รีเฟรช
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={approvalRequests}
          rowKey="id"
          loading={loading}
          pagination={{
            total: approvalRequests.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
        />
      </Card>

      <Modal
        title="รายละเอียดคำขออนุมัติ"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedRequest && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ชื่อ-นามสกุล">
              {selectedRequest.userData?.displayName || 
               `${selectedRequest.userData?.firstName} ${selectedRequest.userData?.lastName}`}
            </Descriptions.Item>
            <Descriptions.Item label="อีเมล">
              {selectedRequest.userData?.email}
            </Descriptions.Item>
            <Descriptions.Item label="ประเภทคำขอ">
              {getRequestTypeTag(selectedRequest.requestType)}
            </Descriptions.Item>
            <Descriptions.Item label="แผนก">
              {selectedRequest.userData?.department ? (
                (() => {
                  const deptInfo = getDepartmentInfo(selectedRequest.userData.department);
                  return <Tag color={deptInfo.color}>{deptInfo.text}</Tag>;
                })()
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="ระดับการเข้าถึง">
              {selectedRequest.userData?.access?.authority || 'ไม่ระบุ'}
            </Descriptions.Item>
            <Descriptions.Item label="จังหวัด">
              {getLocationInfo(selectedRequest.targetProvince, '').provinceName || selectedRequest.targetProvince}
            </Descriptions.Item>
            <Descriptions.Item label="สาขา">
              {getLocationInfo('', selectedRequest.targetBranch).branchName || selectedRequest.targetBranch}
            </Descriptions.Item>
            <Descriptions.Item label="สถานะ">
              {getStatusTag(selectedRequest.status)}
            </Descriptions.Item>
            <Descriptions.Item label="วันที่ขอ">
              {selectedRequest.createdAt?.toLocaleString('th-TH')}
            </Descriptions.Item>
            
            {selectedRequest.status === 'approved' && (
              <>
                <Descriptions.Item label="อนุมัติโดย">
                  {selectedRequest.approverName}
                </Descriptions.Item>
                <Descriptions.Item label="วันที่อนุมัติ">
                  {new Date(selectedRequest.approvedAt).toLocaleString('th-TH')}
                </Descriptions.Item>
              </>
            )}
            
            {selectedRequest.status === 'rejected' && (
              <>
                <Descriptions.Item label="ปฏิเสธโดย">
                  {selectedRequest.rejectorName}
                </Descriptions.Item>
                <Descriptions.Item label="วันที่ปฏิเสธ">
                  {new Date(selectedRequest.rejectedAt).toLocaleString('th-TH')}
                </Descriptions.Item>
                <Descriptions.Item label="เหตุผล">
                  {selectedRequest.rejectionReason}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>
    </LayoutWithRBAC>
  );
};

export default UserApproval; 