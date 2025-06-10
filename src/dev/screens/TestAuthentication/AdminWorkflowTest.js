import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Steps, 
  Button, 
  Space, 
  Alert, 
  Typography, 
  Descriptions, 
  Tag, 
  Modal, 
  Table,
  Row,
  Col,
  Statistic,
  Timeline,
  Badge
} from 'antd';
import { 
  UserAddOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  TeamOutlined,
  SafetyOutlined,
  SettingOutlined,
  BellOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { app } from '../../../firebase';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const AdminWorkflowTest = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [testData, setTestData] = useState({
    pendingUsers: [],
    approvedUsers: [],
    rejectedUsers: []
  });
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { user: currentUser } = useSelector(state => state.auth);

  useEffect(() => {
    fetchTestData();
  }, []);

  const fetchTestData = async () => {
    setLoading(true);
    try {
      // Fetch approval requests
      const approvalSnapshot = await app.firestore()
        .collection('approvalRequests')
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

      const approvalRequests = approvalSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch all users for status checking
      const usersSnapshot = await app.firestore()
        .collection('users')
        .get();

      const allUsers = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data().auth,
        fullData: doc.data()
      }));

      // Categorize users
      const pending = allUsers.filter(u => u.approvalStatus === 'pending');
      const approved = allUsers.filter(u => u.approvalStatus === 'approved');
      const rejected = allUsers.filter(u => u.approvalStatus === 'rejected');

      setTestData({
        pendingUsers: pending,
        approvedUsers: approved,
        rejectedUsers: rejected,
        approvalRequests
      });

    } catch (error) {
      console.error('Error fetching test data:', error);
    }
    setLoading(false);
  };

  const handleApproveUser = async (userId) => {
    try {
      const batch = app.firestore().batch();
      
      // Update user document
      const userRef = app.firestore().collection('users').doc(userId);
      batch.update(userRef, {
        'auth.isApproved': true,
        'auth.isActive': true,
        'auth.approvalStatus': 'approved',
        'auth.approvedBy': currentUser.uid,
        'auth.approvedAt': Date.now()
      });

      // Update approval request
      const requestSnapshot = await app.firestore()
        .collection('approvalRequests')
        .where('userId', '==', userId)
        .where('status', '==', 'pending')
        .get();

      if (!requestSnapshot.empty) {
        const requestRef = requestSnapshot.docs[0].ref;
        batch.update(requestRef, {
          status: 'approved',
          approvedBy: currentUser.uid,
          approvedAt: Date.now(),
          adminNotes: 'ทดสอบการอนุมัติผ่านระบบ Admin'
        });
      }

      await batch.commit();
      await fetchTestData(); // Refresh data
      
      return { success: true, message: 'อนุมัติผู้ใช้เรียบร้อยแล้ว' };
    } catch (error) {
      console.error('Error approving user:', error);
      return { success: false, message: 'เกิดข้อผิดพลาดในการอนุมัติ' };
    }
  };

  const handleRejectUser = async (userId, reason = 'ข้อมูลไม่ครบถ้วน') => {
    try {
      const batch = app.firestore().batch();
      
      // Update user document
      const userRef = app.firestore().collection('users').doc(userId);
      batch.update(userRef, {
        'auth.isApproved': false,
        'auth.isActive': false,
        'auth.approvalStatus': 'rejected',
        'auth.rejectedBy': currentUser.uid,
        'auth.rejectedAt': Date.now(),
        'auth.rejectionReason': reason
      });

      // Update approval request
      const requestSnapshot = await app.firestore()
        .collection('approvalRequests')
        .where('userId', '==', userId)
        .where('status', '==', 'pending')
        .get();

      if (!requestSnapshot.empty) {
        const requestRef = requestSnapshot.docs[0].ref;
        batch.update(requestRef, {
          status: 'rejected',
          rejectedBy: currentUser.uid,
          rejectedAt: Date.now(),
          rejectionReason: reason,
          adminNotes: 'ทดสอบการปฏิเสธผ่านระบบ Admin'
        });
      }

      await batch.commit();
      await fetchTestData(); // Refresh data
      
      return { success: true, message: 'ปฏิเสธผู้ใช้เรียบร้อยแล้ว' };
    } catch (error) {
      console.error('Error rejecting user:', error);
      return { success: false, message: 'เกิดข้อผิดพลาดในการปฏิเสธ' };
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'รออนุมัติ', icon: <ClockCircleOutlined /> },
      approved: { color: 'green', text: 'อนุมัติแล้ว', icon: <CheckCircleOutlined /> },
      rejected: { color: 'red', text: 'ถูกปฏิเสธ', icon: <ClockCircleOutlined /> }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const pendingColumns = [
    {
      title: 'ผู้ใช้',
      key: 'user',
      render: (_, record) => (
        <Space>
          <UserAddOutlined />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.displayName || `${record.firstName} ${record.lastName}`}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'ประเภท',
      dataIndex: 'userType',
      key: 'userType',
      render: (type) => (
        <Tag color={type === 'existing' ? 'blue' : 'green'}>
          {type === 'existing' ? 'พนักงานเดิม' : 'พนักงานใหม่'}
        </Tag>
      )
    },
    {
      title: 'แผนก',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => dept ? <Tag>{dept}</Tag> : '-'
    },
    {
      title: 'สาขา',
      dataIndex: 'homeBranch',
      key: 'homeBranch'
    },
    {
      title: 'วันที่สมัคร',
      dataIndex: 'created',
      key: 'created',
      render: (timestamp) => new Date(timestamp).toLocaleDateString('th-TH')
    },
    {
      title: 'จัดการ',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setSelectedUser(record);
              setModalVisible(true);
            }}
          >
            ดู
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={() => handleApproveUser(record.uid)}
          >
            อนุมัติ
          </Button>
          <Button
            danger
            size="small"
            onClick={() => handleRejectUser(record.uid)}
          >
            ปฏิเสธ
          </Button>
        </Space>
      )
    }
  ];

  const workflowSteps = [
    {
      title: 'ผู้ใช้สมัครสมาชิก',
      description: 'ผู้ใช้กรอกข้อมูลและสมัครเข้าใช้งานระบบ',
      icon: <UserAddOutlined />
    },
    {
      title: 'ตรวจสอบข้อมูล',
      description: 'ระบบตรวจสอบข้อมูลพนักงานและสร้างคำขออนุมัติ',
      icon: <SafetyOutlined />
    },
    {
      title: 'รอการอนุมัติ',
      description: 'ผู้จัดการ/ผู้ดูแลระบบตรวจสอบและพิจารณาอนุมัติ',
      icon: <ClockCircleOutlined />
    },
    {
      title: 'เข้าใช้งานระบบ',
      description: 'ผู้ใช้ที่ได้รับอนุมัติสามารถเข้าใช้งานระบบได้',
      icon: <CheckCircleOutlined />
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3}>
        <TeamOutlined /> Admin Workflow Testing Dashboard
      </Title>
      
      <Alert
        message="ทดสอบกระบวนการอนุมัติผู้ใช้งาน"
        description="หน้านี้ใช้สำหรับทดสอบกระบวนการอนุมัติผู้ใช้งานและการจัดการสิทธิ์ในระบบ"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="รออนุมัติ"
              value={testData.pendingUsers.length}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="อนุมัติแล้ว"
              value={testData.approvedUsers.length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="ถูกปฏิเสธ"
              value={testData.rejectedUsers.length}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="ทั้งหมด"
              value={testData.pendingUsers.length + testData.approvedUsers.length + testData.rejectedUsers.length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Workflow Steps */}
      <Card title="กระบวนการอนุมัติผู้ใช้งาน" style={{ marginBottom: 24 }}>
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          {workflowSteps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Steps>
        
        <Space>
          <Button 
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            ก่อนหน้า
          </Button>
          <Button 
            type="primary"
            onClick={() => setCurrentStep(Math.min(workflowSteps.length - 1, currentStep + 1))}
            disabled={currentStep === workflowSteps.length - 1}
          >
            ถัดไป
          </Button>
        </Space>
      </Card>

      {/* Pending Users Table */}
      <Card 
        title={
          <Space>
            <BellOutlined />
            <span>ผู้ใช้รออนุมัติ ({testData.pendingUsers.length})</span>
          </Space>
        }
        extra={
          <Button onClick={fetchTestData} loading={loading}>
            รีเฟรช
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Table
          columns={pendingColumns}
          dataSource={testData.pendingUsers}
          rowKey="uid"
          loading={loading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      {/* Quick Actions */}
      <Card title="การทดสอบด่วน">
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" title="สร้างผู้ใช้ทดสอบ">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button block type="dashed">
                  สร้างผู้ใช้ปกติ
                </Button>
                <Button block type="dashed">
                  สร้างผู้ใช้พนักงานเดิม
                </Button>
                <Button block type="dashed">
                  สร้างผู้ใช้ผู้จัดการ
                </Button>
              </Space>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="ทดสอบการอนุมัติ">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  block 
                  type="primary"
                  disabled={testData.pendingUsers.length === 0}
                >
                  อนุมัติทั้งหมด
                </Button>
                <Button 
                  block 
                  danger
                  disabled={testData.pendingUsers.length === 0}
                >
                  ปฏิเสธทั้งหมด
                </Button>
              </Space>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="การนำทาง">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button block onClick={() => window.open('/admin/user-approval', '_blank')}>
                  หน้าอนุมัติผู้ใช้
                </Button>
                <Button block onClick={() => window.open('/admin/user-management', '_blank')}>
                  หน้าจัดการผู้ใช้
                </Button>
                <Button block onClick={() => window.open('/admin/permission-management', '_blank')}>
                  หน้าจัดการสิทธิ์
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* User Details Modal */}
      <Modal
        title={<><UserAddOutlined /> รายละเอียดผู้ใช้</>}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedUser && (
          <div>
            <Descriptions bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="ชื่อ-สกุล" span={2}>
                {selectedUser.displayName || `${selectedUser.firstName} ${selectedUser.lastName}`}
              </Descriptions.Item>
              <Descriptions.Item label="อีเมล" span={1}>
                {selectedUser.email}
              </Descriptions.Item>
              <Descriptions.Item label="ประเภทผู้ใช้">
                <Tag color={selectedUser.userType === 'existing' ? 'blue' : 'green'}>
                  {selectedUser.userType === 'existing' ? 'พนักงานเดิม' : 'พนักงานใหม่'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="รหัสพนักงาน">
                {selectedUser.employeeId || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="สถานะ">
                {getStatusTag(selectedUser.approvalStatus)}
              </Descriptions.Item>
              <Descriptions.Item label="แผนก">
                {selectedUser.department || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="จังหวัด">
                {selectedUser.homeProvince || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="สาขา">
                {selectedUser.homeBranch || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Space>
              <Button 
                type="primary" 
                onClick={() => {
                  handleApproveUser(selectedUser.uid);
                  setModalVisible(false);
                }}
              >
                อนุมัติ
              </Button>
              <Button 
                danger 
                onClick={() => {
                  handleRejectUser(selectedUser.uid);
                  setModalVisible(false);
                }}
              >
                ปฏิเสธ
              </Button>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminWorkflowTest; 