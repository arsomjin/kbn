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
  Typography,
  Divider,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  UserOutlined,
  BankOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { app } from '../../../firebase';
import { usePermissions } from '../../../hooks/usePermissions';
import LayoutWithRBAC from '../../../components/layout/LayoutWithRBAC';
import {
  getRequestTypeInfo,
  getDepartmentInfo,
  getLocationInfo,
} from '../../../utils/userMappings';
import {
  getProvinceName,
  getBranchName,
  getDepartmentName,
} from '../../../utils/mappings';
import {
  sendApprovalNotification,
  sendRejectionNotification,
} from '../../../utils/userNotifications';
import { useResponsive } from '../../../hooks/useResponsive';
import {
  ApprovalPopconfirm,
  RejectPopconfirm,
} from '../../../components/StandardPopconfirm';

// Import digital user manual
import ScreenWithManual from '../../../components/ScreenWithManual';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const UserApproval = () => {
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionRequestId, setRejectionRequestId] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const { filterDataByUserAccess, hasPermission, userRBAC } = usePermissions();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Predefined rejection reasons for better user feedback
  const REJECTION_REASONS = [
    {
      value: 'incomplete_information',
      label: 'ข้อมูลไม่ครบถ้วน',
      description: 'กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วน',
    },
    {
      value: 'invalid_department',
      label: 'แผนกไม่ถูกต้อง',
      description: 'แผนกที่เลือกไม่ตรงกับตำแหน่งงานจริง',
    },
    {
      value: 'invalid_branch',
      label: 'สาขาไม่ถูกต้อง',
      description: 'สาขาที่เลือกไม่ตรงกับสถานที่ปฏิบัติงาน',
    },
    {
      value: 'duplicate_account',
      label: 'บัญชีผู้ใช้ซ้ำ',
      description: 'มีบัญชีผู้ใช้นี้อยู่ในระบบแล้ว',
    },
    {
      value: 'invalid_employee_code',
      label: 'รหัสพนักงานไม่ถูกต้อง',
      description: 'รหัสพนักงานไม่ตรงกับข้อมูลในระบบ HR',
    },
    {
      value: 'unauthorized_access',
      label: 'ไม่มีสิทธิ์เข้าใช้งาน',
      description: 'ไม่ได้รับอนุญาตให้เข้าใช้งานระบบนี้',
    },
    {
      value: 'other',
      label: 'อื่นๆ',
      description: 'เหตุผลอื่นๆ (กรุณาระบุในช่องรายละเอียด)',
    },
  ];

  // Validate Clean Slate RBAC structure
  React.useEffect(() => {
    if (user && !user.access) {
      console.warn(
        '🚨 UserApproval: User missing Clean Slate RBAC structure:',
        user.uid
      );
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
        user: user,
      });

      // DEBUG: Check DEV user status specifically
      console.log('🔍 DEV User Debug:', {
        'user.isDev': user?.isDev,
        'userRBAC.isDev': userRBAC?.isDev,
        'user.displayName': user?.displayName,
        'user.email': user?.email,
        'Should bypass filtering': user?.isDev || userRBAC?.isDev,
      });

      // DEBUG: Check user's branch access specifically
      console.log('🔍 Branch Access Debug:', {
        'userRBAC.geographic.allowedBranches':
          userRBAC?.geographic?.allowedBranches,
        'userRBAC.geographic.scope': userRBAC?.geographic?.scope,
        'Geographic object': userRBAC?.geographic,
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
        isEmpty: snapshot.empty,
      });

      if (snapshot.empty) {
        console.warn('❌ No approval requests found with current filters');

        // DEBUG: Try fetching ALL requests without filters
        const debugSnapshot = await app
          .firestore()
          .collection('approvalRequests')
          .get();
        console.log(
          '🔍 Debug - Total requests in database (no filters):',
          debugSnapshot.docs.length
        );

        if (!debugSnapshot.empty) {
          const debugRequests = debugSnapshot.docs.map((doc) => ({
            id: doc.id,
            status: doc.data().status,
            targetProvince: doc.data().targetProvince,
            createdAt: doc.data().createdAt,
          }));
          console.table(debugRequests);
        }
      }

      let requests = snapshot.docs.map((doc) => ({
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
        console.log(
          '🔍 Checking allowedBranches for filtering:',
          allowedBranches
        );

        if (!allowedBranches || allowedBranches.length === 0) {
          console.warn(
            '⚠️ BRANCH-level user has no allowedBranches - skipping branch filtering'
          );
          console.warn(
            '⚠️ This user should probably be PROVINCE or ALL scope for admin functions'
          );
          // Skip branch filtering for users without proper branch assignments
        } else {
          requests = filterDataByUserAccess(requests, {
            provinceField: 'targetProvince',
            branchField: 'targetBranch',
          });
          console.log(
            `🔍 Branch-level filtering: ${beforeBranchFilter} → ${requests.length} requests`
          );
        }
      } else if (isDevUser) {
        console.log('✅ DEV user detected - skipping branch-level filtering');
      }

      console.log('✅ Final approval requests:', requests.length);
      if (requests.length > 0) {
        console.table(
          requests.map((r) => ({
            id: r.id,
            status: r.status,
            userEmail: r.userData?.email,
            targetProvince: r.targetProvince,
            targetBranch: r.targetBranch,
          }))
        );
      }

      // Sort requests by createdAt in descending order (newest first)
      requests.sort((a, b) => b.createdAt - a.createdAt);

      setApprovalRequests(requests);
    } catch (error) {
      console.error('❌ Error fetching approval requests:', error);
      message.error('ไม่สามารถโหลดข้อมูลคำขออนุมัติได้');
    }
    setLoading(false);
  };

  const handleApprove = async (requestId, requestData) => {
    setActionLoading(true);
    try {
      console.log('🔄 Approving user with Clean Slate RBAC...');
      console.log('📊 Request data:', requestData);

      // Validate required data before proceeding
      if (!requestId) {
        throw new Error('Request ID is required');
      }

      if (!requestData || !requestData.userData) {
        throw new Error('Request data or user data is missing');
      }

      // Extract userId with multiple fallback options
      const userData = requestData.userData;
      const userId =
        userData.userId ||
        userData.uid ||
        requestData.userId ||
        requestData.uid;

      if (!userId) {
        console.error('❌ No valid user ID found in request data:', {
          requestData,
          userData,
          availableKeys: Object.keys(userData || {}),
        });
        throw new Error('ไม่พบ User ID ในข้อมูลคำขอ - กรุณาลองใหม่อีกครั้ง');
      }

      console.log('✅ User ID found:', userId);

      const batch = app.firestore().batch();

      // Update user status (Clean Slate RBAC structure)
      const userRef = app.firestore().collection('users').doc(userId);

      // Clean Slate RBAC approval updates
      const userUpdates = {
        // Status fields (top level for Clean Slate)
        isActive: true,
        isApproved: true,
        approvalStatus: 'approved',
        approvedBy: user.uid,
        approvedAt: Date.now(),

        // Clean up any legacy auth structure if it exists
        'auth.isActive': app.firestore.FieldValue.delete(),
        'auth.isApproved': app.firestore.FieldValue.delete(),
        'auth.approvalStatus': app.firestore.FieldValue.delete(),

        // Update metadata
        lastUpdated: Date.now(),
        updatedBy: user.uid,
      };

      batch.update(userRef, userUpdates);

      // Update approval request
      const requestRef = app
        .firestore()
        .collection('approvalRequests')
        .doc(requestId);
      batch.update(requestRef, {
        status: 'approved',
        approvedBy: user.uid,
        approvedAt: Date.now(),
        approverName: user.displayName || `${user.firstName} ${user.lastName}`,
        processedUserId: userId, // Add this for debugging future issues
      });

      await batch.commit();

      console.log('✅ User approved successfully with Clean Slate RBAC');

      // Send approval notification to the user
      try {
        const approverInfo = {
          uid: user.uid,
          name:
            user.displayName ||
            `${user.firstName} ${user.lastName}` ||
            'ผู้จัดการ',
        };

        await sendApprovalNotification(userId, approverInfo, userData);
        console.log('✅ Approval notification sent to user');
      } catch (notificationError) {
        console.error(
          '❌ Error sending approval notification:',
          notificationError
        );
        // Don't fail the approval process if notification fails
      }

      message.success(
        'อนุมัติผู้ใช้เรียบร้อยแล้ว - ผู้ใช้สามารถเข้าใช้งานได้ทันที'
      );
      fetchApprovalRequests();
    } catch (error) {
      console.error('❌ Error approving user:', error);
      console.error('❌ Request data causing error:', requestData);
      message.error(
        'ไม่สามารถอนุมัติผู้ใช้ได้: ' +
          (error.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ')
      );
    }
    setActionLoading(false);
  };

  const handleReject = async (requestId, reason) => {
    setActionLoading(true);
    try {
      console.log(
        '🔄 Rejecting approval request:',
        requestId,
        'Reason:',
        reason
      );

      // Get the approval request data
      const requestDoc = await app
        .firestore()
        .collection('approvalRequests')
        .doc(requestId)
        .get();

      if (!requestDoc.exists) {
        throw new Error('ไม่พบคำขออนุมัติ');
      }

      const requestData = requestDoc.data();
      const userId = requestData.userId;

      if (!userId) {
        throw new Error('ไม่พบ User ID ในคำขออนุมัติ');
      }

      // Update approval request status
      await app
        .firestore()
        .collection('approvalRequests')
        .doc(requestId)
        .update({
          status: 'rejected',
          rejectedBy: user.uid,
          rejectorName:
            user.displayName || `${user.firstName} ${user.lastName}`,
          rejectedAt: Date.now(),
          rejectionReason: reason,
          updatedAt: Date.now(),
        });

      // ENHANCED: Update user document with detailed rejection data for Clean Slate RBAC
      const userRejectionUpdates = {
        isActive: false,
        isApproved: false,
        approvalStatus: 'rejected',
        rejectedBy: user.uid,
        rejectedAt: Date.now(),
        rejectionReason: reason,
        rejectorName: user.displayName || `${user.firstName} ${user.lastName}`,
        // Clean Slate RBAC rejection structure
        access: {
          ...requestData.userData?.access,
          status: 'rejected',
          rejectedAt: Date.now(),
          rejectionDetails: {
            reason: reason,
            rejectedBy: user.uid,
            rejectorName:
              user.displayName || `${user.firstName} ${user.lastName}`,
            canReapply: true, // Allow user to reapply with corrections
            reapplyAfter: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          },
        },
      };

      await app
        .firestore()
        .collection('users')
        .doc(userId)
        .update(userRejectionUpdates);

      console.log('✅ User rejection completed successfully');

      // Send rejection notification to the user
      try {
        const rejectorInfo = {
          uid: user.uid,
          name:
            user.displayName ||
            `${user.firstName} ${user.lastName}` ||
            'ผู้จัดการ',
        };

        await sendRejectionNotification(
          userId,
          rejectorInfo,
          reason,
          requestData.userData
        );
        console.log('✅ Rejection notification sent to user');
      } catch (notificationError) {
        console.error(
          '❌ Error sending rejection notification:',
          notificationError
        );
        // Don't fail the rejection process if notification fails
      }

      message.success('ปฏิเสธคำขออนุมัติเรียบร้อยแล้ว');

      // Refresh the list
      fetchApprovalRequests();
    } catch (error) {
      console.error('❌ Error rejecting approval request:', error);
      message.error('เกิดข้อผิดพลาดในการปฏิเสธคำขออนุมัติ');
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
      rejected: { color: 'red', text: 'ปฏิเสธ' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getRequestTypeTag = (requestType) => {
    const requestInfo = getRequestTypeInfo(requestType);

    // Special handling for reapplication requests
    if (requestType === 'reapplication') {
      return <Tag color='blue'>ส่งคำขอใหม่</Tag>;
    }

    return <Tag color={requestInfo.color}>{requestInfo.text}</Tag>;
  };

  const columns = [
    {
      title: 'ชื่อ-นามสกุล',
      dataIndex: ['userData', 'displayName'],
      key: 'displayName',
      render: (text, record) => {
        // Improved name display with fallback logic
        const userData = record.userData || {};
        const displayName =
          userData.displayName ||
          `${userData.firstName || ''} ${userData.lastName || ''}`.trim() ||
          userData.email?.split('@')[0] ||
          'ไม่ระบุชื่อ';

        return (
          <Space>
            <UserOutlined />
            <span>{displayName}</span>
          </Space>
        );
      },
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
      render: (department, record) => {
        // Enhanced department display with multiple fallback sources
        const userData = record.userData || {};
        const dept =
          department ||
          userData.access?.departments?.[0] ||
          userData.departments?.[0] ||
          null;

        if (!dept) return <Tag color='default'>ไม่ระบุแผนก</Tag>;

        // Use mapping utility for consistent display
        const departmentName = getDepartmentName(dept);
        const deptInfo = getDepartmentInfo(dept);

        return <Tag color={deptInfo.color}>{departmentName}</Tag>;
      },
    },
    {
      title: 'จังหวัด',
      dataIndex: 'targetProvince',
      key: 'targetProvince',
      render: (province) => {
        // Use improved province mapping
        const provinceName = getProvinceName(province) || province || 'ไม่ระบุ';
        return (
          <Space>
            <EnvironmentOutlined />
            <span>{provinceName}</span>
          </Space>
        );
      },
    },
    {
      title: 'สาขา',
      dataIndex: 'targetBranch',
      key: 'targetBranch',
      render: (branch) => {
        // Use improved branch mapping
        const branchName = getBranchName(branch) || branch || 'ไม่ระบุ';
        return (
          <Space>
            <BankOutlined />
            <span>{branchName}</span>
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
        <Space size='middle'>
          <Button
            type='text'
            icon={<EyeOutlined />}
            onClick={() => showDetails(record)}
            size='small'
            style={{
              borderRadius: '6px',
              fontWeight: '500',
              height: '32px',
              minWidth: '72px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1890ff',
              border: '1px solid transparent',
            }}
          >
            ดูรายละเอียด
          </Button>

          {record.status === 'pending' &&
            hasPermission('users.approve', {
              provinceId: record.targetProvince,
              branchCode: record.targetBranch,
            }) && (
              <>
                <ApprovalPopconfirm
                  onConfirm={() => handleApprove(record.id, record)}
                >
                  <Button
                    type='primary'
                    icon={<CheckOutlined />}
                    loading={actionLoading}
                    size='small'
                    style={{
                      borderRadius: '6px',
                      fontWeight: '500',
                      height: '32px',
                      minWidth: '72px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    อนุมัติ
                  </Button>
                </ApprovalPopconfirm>

                <RejectPopconfirm onConfirm={() => showRejectModal(record.id)}>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    loading={actionLoading}
                    size='small'
                    style={{
                      borderRadius: '6px',
                      fontWeight: '500',
                      height: '32px',
                      minWidth: '72px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ปฏิเสธ
                  </Button>
                </RejectPopconfirm>
              </>
            )}
        </Space>
      ),
    },
  ];

  const showRejectModal = (requestId) => {
    setRejectionRequestId(requestId);
    setRejectionReason('');
    setRejectModalVisible(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason) {
      message.error('กรุณาเลือกเหตุผลในการปฏิเสธ');
      return;
    }

    const selectedReasonObj = REJECTION_REASONS.find(
      (r) => r.value === rejectionReason
    );
    const reasonText = selectedReasonObj
      ? `${selectedReasonObj.label}: ${selectedReasonObj.description}`
      : rejectionReason;

    await handleReject(rejectionRequestId, reasonText);
    setRejectModalVisible(false);
    setRejectionReason('');
    setRejectionRequestId(null);
  };

  return (
    <ScreenWithManual screenType='user-approval' showManualOnFirstVisit={true}>
      <LayoutWithRBAC permission='users.manage' title='จัดการการอนุมัติผู้ใช้'>
        <Card
          title={
            <Row align='middle' justify='space-between'>
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
            overflowX: 'hidden',
          }}
        >
          {/* Filters Section with Responsive Grid */}
          <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: '100%' }}
                placeholder='กรองตามสถานะ'
                size={isMobile ? 'small' : 'default'}
              >
                <Option value='all'>ทั้งหมด</Option>
                <Option value='pending'>รอการอนุมัติ</Option>
                <Option value='approved'>อนุมัติแล้ว</Option>
                <Option value='rejected'>ปฏิเสธ</Option>
              </Select>
            </Col>

            {process.env.NODE_ENV === 'development' && (
              <Col xs={24} sm={12} md={8} lg={6}>
                <Button
                  type='dashed'
                  size={isMobile ? 'small' : 'default'}
                  style={{ width: '100%' }}
                  onClick={async () => {
                    console.log('🔍 Manual debug check...');

                    // Import debug utility
                    const { debugApprovalRequests } = await import(
                      '../../../utils/debugApprovalRequests'
                    );
                    await debugApprovalRequests();

                    // Also check if we can write to the collection
                    try {
                      const testDoc = await app
                        .firestore()
                        .collection('approvalRequests')
                        .add({
                          test: true,
                          createdAt: new Date().toISOString(),
                        });
                      console.log(
                        '✅ Test write successful, doc ID:',
                        testDoc.id
                      );
                      await testDoc.delete();
                      console.log('🧹 Test doc cleaned up');
                    } catch (error) {
                      console.error('❌ Test write failed:', error);
                    }
                  }}
                >
                  ดูข้อมูลดีบัก
                </Button>
              </Col>
            )}
          </Row>

          {/* Table Section */}
          <Table
            columns={columns}
            dataSource={approvalRequests}
            rowKey='id'
            loading={loading}
            scroll={{
              x: isMobile ? 'max-content' : isTablet ? 800 : 1000,
            }}
            size={isMobile ? 'small' : 'middle'}
            pagination={{
              total: approvalRequests.length,
              pageSize: isMobile ? 5 : isTablet ? 8 : 10,
              showSizeChanger: !isMobile,
              showQuickJumper: !isMobile,
              showTotal: !isMobile
                ? (total, range) =>
                    `${range[0]}-${range[1]} จาก ${total} รายการ`
                : undefined,
              simple: isMobile,
              position: isMobile ? ['bottomCenter'] : ['bottomRight'],
              size: isMobile ? 'small' : 'default',
            }}
          />
        </Card>

        <Modal
          title='รายละเอียดคำขออนุมัติ'
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          {selectedRequest && (
            <>
              <Descriptions column={1} bordered>
                <Descriptions.Item label='ชื่อ-นามสกุล'>
                  {(() => {
                    const userData = selectedRequest.userData || {};
                    return (
                      userData.displayName ||
                      `${userData.firstName || ''} ${userData.lastName || ''}`.trim() ||
                      userData.email?.split('@')[0] ||
                      'ไม่ระบุชื่อ'
                    );
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label='อีเมล'>
                  {selectedRequest.userData?.email || 'ไม่ระบุอีเมล'}
                </Descriptions.Item>
                <Descriptions.Item label='ประเภทคำขอ'>
                  {getRequestTypeTag(selectedRequest.requestType)}
                  {selectedRequest.requestType === 'reapplication' && (
                    <div style={{ marginTop: '8px' }}>
                      <Tag color='orange' style={{ fontSize: '11px' }}>
                        คำขอใหม่หลังจากถูกปฏิเสธ
                      </Tag>
                    </div>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label='แผนก'>
                  {(() => {
                    const userData = selectedRequest.userData || {};
                    const dept =
                      userData.department ||
                      userData.access?.departments?.[0] ||
                      userData.departments?.[0];

                    if (!dept) return <Tag color='default'>ไม่ระบุแผนก</Tag>;

                    const departmentName = getDepartmentName(dept);
                    const deptInfo = getDepartmentInfo(dept);
                    return <Tag color={deptInfo.color}>{departmentName}</Tag>;
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label='ระดับการเข้าถึง'>
                  {selectedRequest.userData?.access?.authority ||
                    selectedRequest.userData?.accessLevel ||
                    'ไม่ระบุ'}
                </Descriptions.Item>
                <Descriptions.Item label='จังหวัด'>
                  {getProvinceName(selectedRequest.targetProvince) ||
                    selectedRequest.targetProvince ||
                    'ไม่ระบุ'}
                </Descriptions.Item>
                <Descriptions.Item label='สาขา'>
                  {getBranchName(selectedRequest.targetBranch) ||
                    selectedRequest.targetBranch ||
                    'ไม่ระบุ'}
                </Descriptions.Item>
                <Descriptions.Item label='สถานะ'>
                  {getStatusTag(selectedRequest.status)}
                </Descriptions.Item>
                <Descriptions.Item label='วันที่ขอ'>
                  {selectedRequest.createdAt?.toLocaleString('th-TH')}
                </Descriptions.Item>

                {selectedRequest.status === 'approved' && (
                  <>
                    <Descriptions.Item label='อนุมัติโดย'>
                      {selectedRequest.approverName}
                    </Descriptions.Item>
                    <Descriptions.Item label='วันที่อนุมัติ'>
                      {new Date(selectedRequest.approvedAt).toLocaleString(
                        'th-TH'
                      )}
                    </Descriptions.Item>
                  </>
                )}

                {selectedRequest.status === 'rejected' && (
                  <>
                    <Descriptions.Item label='ปฏิเสธโดย'>
                      {selectedRequest.rejectorName}
                    </Descriptions.Item>
                    <Descriptions.Item label='วันที่ปฏิเสธ'>
                      {new Date(selectedRequest.rejectedAt).toLocaleString(
                        'th-TH'
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label='เหตุผล'>
                      {selectedRequest.rejectionReason}
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>

              {/* Reapplication specific information */}
              {selectedRequest?.requestType === 'reapplication' && (
                <div style={{ marginTop: '24px' }}>
                  <Divider orientation='left'>ข้อมูลการปฏิเสธครั้งก่อน</Divider>
                  <Descriptions bordered size='small' column={1}>
                    <Descriptions.Item label='เหตุผลที่ถูกปฏิเสธ'>
                      <Text type='danger'>
                        {selectedRequest.previousRejection?.reason ||
                          'ไม่ได้ระบุเหตุผล'}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label='วันที่ถูกปฏิเสธ'>
                      {selectedRequest.previousRejection?.rejectedAt
                        ? new Date(
                            selectedRequest.previousRejection.rejectedAt
                          ).toLocaleString('th-TH')
                        : 'ไม่ทราบวันที่'}
                    </Descriptions.Item>
                    <Descriptions.Item label='ปฏิเสธโดย'>
                      {selectedRequest.previousRejection?.rejectedBy ||
                        'ไม่ทราบ'}
                    </Descriptions.Item>
                  </Descriptions>

                  {selectedRequest.improvementNote && (
                    <div style={{ marginTop: '16px' }}>
                      <Divider orientation='left'>การปรับปรุงที่ได้ทำ</Divider>
                      <Card
                        size='small'
                        style={{
                          background: '#f6ffed',
                          border: '1px solid #b7eb8f',
                        }}
                      >
                        <Paragraph
                          style={{ margin: 0, whiteSpace: 'pre-wrap' }}
                        >
                          {selectedRequest.improvementNote}
                        </Paragraph>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </Modal>

        <Modal
          title='เลือกเหตุผลในการปฏิเสธ'
          visible={rejectModalVisible}
          onCancel={() => setRejectModalVisible(false)}
          footer={null}
          width={600}
        >
          <Select
            value={rejectionReason}
            onChange={setRejectionReason}
            style={{ width: '100%' }}
            placeholder='เลือกเหตุผล'
            size={isMobile ? 'small' : 'default'}
          >
            {REJECTION_REASONS.map((reason) => (
              <Option key={reason.value} value={reason.value}>
                {reason.label}
              </Option>
            ))}
          </Select>
          <Button
            type='primary'
            onClick={handleRejectConfirm}
            loading={actionLoading}
            style={{ width: '100%', marginTop: 16 }}
          >
            ยืนยัน
          </Button>
        </Modal>
      </LayoutWithRBAC>
    </ScreenWithManual>
  );
};

export default UserApproval;
