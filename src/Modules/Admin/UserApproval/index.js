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
  EnvironmentOutlined,
  ReloadOutlined,
  CheckCircleOutlined
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
import { useResponsive } from 'hooks/useResponsive';

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
  const { isMobile, isTablet, isDesktop } = useResponsive();

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
      console.log('🔍 UserApproval: Fetching approval requests...');
      console.log('📊 UserApproval Debug Info:', {
        filterStatus,
        userRBAC: userRBAC,
        userScope: userRBAC?.geographic?.scope,
        allowedProvinces: userRBAC?.geographic?.allowedProvinces,
        allowedBranches: userRBAC?.geographic?.allowedBranches,
        user: user
      });
      
      // DEBUG: Check DEV user status specifically
      console.log('🔍 DEV User Debug:', {
        'user.isDev': user?.isDev,
        'userRBAC.isDev': userRBAC?.isDev,
        'user.displayName': user?.displayName,
        'user.email': user?.email,
        'Should bypass filtering': user?.isDev || userRBAC?.isDev
      });
      
      // DEBUG: Check user's branch access specifically
      console.log('🔍 Branch Access Debug:', {
        'userRBAC.geographic.allowedBranches': userRBAC?.geographic?.allowedBranches,
        'userRBAC.geographic.scope': userRBAC?.geographic?.scope,
        'Geographic object': userRBAC?.geographic
      });

      let query = app.firestore().collection('approvalRequests');
      
      // Filter by status
      if (filterStatus !== 'all') {
        query = query.where('status', '==', filterStatus);
        console.log('🔍 Applied status filter:', filterStatus);
      }

      // Apply Clean Slate RBAC geographic filtering (SKIP FOR DEV USERS)
      const isDevUser = user?.isDev || userRBAC?.isDev;
      console.log('🔍 Is DEV user?', isDevUser);
      
      if (!isDevUser && userRBAC?.geographic?.scope !== 'ALL') {
        const allowedProvinces = userRBAC?.geographic?.allowedProvinces || [];
        if (allowedProvinces.length > 0) {
          query = query.where('targetProvince', 'in', allowedProvinces);
          console.log('🔍 Applied province filter:', allowedProvinces);
        }
      } else if (isDevUser) {
        console.log('✅ DEV user detected - skipping geographic filtering');
      }

      console.log('🔍 Executing Firestore query...');
      const snapshot = await query.orderBy('createdAt', 'desc').get();
      
      console.log('📊 Raw query results:', {
        totalDocs: snapshot.docs.length,
        isEmpty: snapshot.empty
      });

      if (snapshot.empty) {
        console.warn('❌ No approval requests found with current filters');
        
        // DEBUG: Try fetching ALL requests without filters
        const debugSnapshot = await app.firestore().collection('approvalRequests').get();
        console.log('🔍 Debug - Total requests in database (no filters):', debugSnapshot.docs.length);
        
        if (!debugSnapshot.empty) {
          const debugRequests = debugSnapshot.docs.map(doc => ({
            id: doc.id,
            status: doc.data().status,
            targetProvince: doc.data().targetProvince,
            createdAt: doc.data().createdAt
          }));
          console.table(debugRequests);
        }
      }
      
      let requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt),
      }));

      console.log('📊 Requests before RBAC filtering:', requests.length);

      // Apply additional RBAC filtering if needed (for branch-level access) - SKIP FOR DEV USERS
      if (!isDevUser && userRBAC?.geographic?.scope === 'BRANCH') {
        const beforeBranchFilter = requests.length;
        
        // 🛠️ TEMPORARY FIX: Check if user has allowedBranches defined
        const allowedBranches = userRBAC?.geographic?.allowedBranches;
        console.log('🔍 Checking allowedBranches for filtering:', allowedBranches);
        
        if (!allowedBranches || allowedBranches.length === 0) {
          console.warn('⚠️ BRANCH-level user has no allowedBranches - skipping branch filtering');
          console.warn('⚠️ This user should probably be PROVINCE or ALL scope for admin functions');
          // Skip branch filtering for users without proper branch assignments
        } else {
          requests = filterDataByUserAccess(requests, {
            provinceField: 'targetProvince',
            branchField: 'targetBranch'
          });
          console.log(`🔍 Branch-level filtering: ${beforeBranchFilter} → ${requests.length} requests`);
        }
      } else if (isDevUser) {
        console.log('✅ DEV user detected - skipping branch-level filtering');
      }

      console.log('✅ Final approval requests:', requests.length);
      if (requests.length > 0) {
        console.table(requests.map(r => ({
          id: r.id,
          status: r.status,
          userEmail: r.userData?.email,
          targetProvince: r.targetProvince,
          targetBranch: r.targetBranch
        })));
      }

      setApprovalRequests(requests);
    } catch (error) {
      console.error('❌ Error fetching approval requests:', error);
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
      <Card 
        title={
          <Row align="middle" justify="space-between">
            <Col>
              <Space>
                <CheckCircleOutlined />
                <span>จัดการการอนุมัติผู้ใช้</span>
              </Space>
            </Col>
            <Col>
              <Button 
                icon={<ReloadOutlined />}
                onClick={fetchApprovalRequests} 
                loading={loading}
                size={isMobile ? 'small' : 'default'}
              >
                {!isMobile && 'รีเฟรช'}
              </Button>
            </Col>
          </Row>
        }
        bodyStyle={{ 
          padding: isMobile ? '12px' : '16px',
          overflowX: 'hidden'
        }}
      >
        {/* Filters Section with Responsive Grid */}
        <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: '100%' }}
              placeholder="กรองตามสถานะ"
              size={isMobile ? 'small' : 'default'}
            >
              <Option value="all">ทั้งหมด</Option>
              <Option value="pending">รอการอนุมัติ</Option>
              <Option value="approved">อนุมัติแล้ว</Option>
              <Option value="rejected">ปฏิเสธ</Option>
            </Select>
          </Col>
          
          {process.env.NODE_ENV === 'development' && (
            <Col xs={24} sm={12} md={8} lg={6}>
              <Button 
                type="dashed" 
                size={isMobile ? 'small' : 'default'}
                style={{ width: '100%' }}
                onClick={async () => {
                  console.log('🔍 Manual debug check...');
                  
                  // Import debug utility
                  const { debugApprovalRequests } = await import('../../../utils/debugApprovalRequests');
                  await debugApprovalRequests();
                  
                  // Also check if we can write to the collection
                  try {
                    const testDoc = await app.firestore()
                      .collection('approvalRequests')
                      .add({
                        test: true,
                        createdAt: new Date().toISOString()
                      });
                    console.log('✅ Test write successful, doc ID:', testDoc.id);
                    await testDoc.delete();
                    console.log('🧹 Test doc cleaned up');
                  } catch (error) {
                    console.error('❌ Test write failed:', error);
                  }
                }}
              >
                🔍 {isMobile ? 'Debug' : 'Debug Database'}
              </Button>
            </Col>
          )}
        </Row>

        {/* Table Section */}
        <Table
          columns={columns}
          dataSource={approvalRequests}
          rowKey="id"
          loading={loading}
          scroll={{ 
            x: isMobile ? 'max-content' : isTablet ? 800 : 1000
          }}
          size={isMobile ? 'small' : 'middle'}
          pagination={{
            total: approvalRequests.length,
            pageSize: isMobile ? 5 : isTablet ? 8 : 10,
            showSizeChanger: !isMobile,
            showQuickJumper: !isMobile,
            showTotal: !isMobile ? (total, range) => 
              `${range[0]}-${range[1]} จาก ${total} รายการ` : undefined,
            simple: isMobile,
            position: isMobile ? ['bottomCenter'] : ['bottomRight'],
            size: isMobile ? 'small' : 'default'
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