/**
 * Comprehensive Notifications Page
 * Central hub for all types of notifications and alerts
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  List,
  Badge,
  Button,
  Space,
  Typography,
  Avatar,
  Tag,
  Empty,
  Row,
  Col,
  Divider,
  Tooltip,
  Switch,
  Select,
  DatePicker,
  Input
} from 'antd';
import {
  BellOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  SearchOutlined,
  FilterOutlined,
  SettingOutlined,
  MarkAllReadOutlined,
  DeleteOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { app } from '../../firebase';
import { usePermissions } from '../../hooks/usePermissions';
import { useResponsive } from '../../hooks/useResponsive';
import LayoutWithRBAC from '../../components/layout/LayoutWithRBAC';
import { getBranchName, getProvinceName, getDepartmentName } from '../../utils/mappings';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('approvals');
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [systemNotifications, setSystemNotifications] = useState([]);
  const [userActivities, setUserActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  const { user } = useSelector(state => state.auth);
  const { hasPermission } = usePermissions();
  const { isMobile, isTablet } = useResponsive();
  const history = useHistory();

  // Check permissions
  const canSeeApprovals = hasPermission('users.approve') || hasPermission('users.manage');
  const canSeeSystemNotifications = hasPermission('admin.notifications') || hasPermission('users.manage');

  useEffect(() => {
    fetchNotifications();
  }, [activeTab, statusFilter, dateRange]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      if (activeTab === 'approvals' && canSeeApprovals) {
        await fetchApprovalRequests();
      } else if (activeTab === 'system' && canSeeSystemNotifications) {
        await fetchSystemNotifications();
      } else if (activeTab === 'activities') {
        await fetchUserActivities();
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
    setLoading(false);
  };

  const fetchApprovalRequests = async () => {
    try {
      let query = app.firestore().collection('approvalRequests');
      
      if (statusFilter !== 'all') {
        query = query.where('status', '==', statusFilter);
      }

      if (dateRange && dateRange.length === 2) {
        query = query
          .where('createdAt', '>=', dateRange[0].valueOf())
          .where('createdAt', '<=', dateRange[1].valueOf());
      }

      const snapshot = await query.orderBy('createdAt', 'desc').limit(50).get();
      
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt),
        type: 'approval'
      }));

      // Filter by user's geographic permissions
      const filteredRequests = requests.filter(request => {
        return hasPermission('users.approve', {
          provinceId: request.targetProvince,
          branchCode: request.targetBranch
        });
      });

      setApprovalRequests(filteredRequests);
    } catch (error) {
      console.error('Error fetching approval requests:', error);
    }
  };

  const fetchSystemNotifications = async () => {
    try {
      let query = app.firestore().collection('systemNotifications');
      
      if (dateRange && dateRange.length === 2) {
        query = query
          .where('createdAt', '>=', dateRange[0].valueOf())
          .where('createdAt', '<=', dateRange[1].valueOf());
      }

      const snapshot = await query.orderBy('createdAt', 'desc').limit(50).get();
      
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt),
        type: 'system'
      }));

      setSystemNotifications(notifications);
    } catch (error) {
      console.error('Error fetching system notifications:', error);
    }
  };

  const fetchUserActivities = async () => {
    try {
      let query = app.firestore()
        .collection('userActivities')
        .where('userId', '==', user.uid);
      
      if (dateRange && dateRange.length === 2) {
        query = query
          .where('createdAt', '>=', dateRange[0].valueOf())
          .where('createdAt', '<=', dateRange[1].valueOf());
      }

      const snapshot = await query.orderBy('createdAt', 'desc').limit(50).get();
      
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt),
        type: 'activity'
      }));

      setUserActivities(activities);
    } catch (error) {
      console.error('Error fetching user activities:', error);
    }
  };

  const getNotificationIcon = (notification) => {
    const iconProps = { style: { fontSize: 16 } };
    
    switch (notification.type) {
      case 'approval':
        return <UserAddOutlined {...iconProps} style={{ color: '#faad14' }} />;
      case 'system':
        switch (notification.severity || notification.level) {
          case 'error':
            return <ExclamationCircleOutlined {...iconProps} style={{ color: '#ff4d4f' }} />;
          case 'warning':
            return <WarningOutlined {...iconProps} style={{ color: '#faad14' }} />;
          case 'success':
            return <CheckCircleOutlined {...iconProps} style={{ color: '#52c41a' }} />;
          default:
            return <InfoCircleOutlined {...iconProps} style={{ color: '#1890ff' }} />;
        }
      case 'activity':
        return <BellOutlined {...iconProps} style={{ color: '#722ed1' }} />;
      default:
        return <BellOutlined {...iconProps} />;
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'รอดำเนินการ' },
      approved: { color: 'green', text: 'อนุมัติแล้ว' },
      rejected: { color: 'red', text: 'ปฏิเสธ' },
      completed: { color: 'blue', text: 'เสร็จสิ้น' },
      active: { color: 'green', text: 'ใช้งาน' },
      inactive: { color: 'default', text: 'ไม่ใช้งาน' }
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const renderApprovalItem = (item) => (
    <List.Item
      key={item.id}
      actions={[
        <Button
          key="view-details"
          type="link"
          size="small"
          onClick={() => history.push('/admin/user-approval')}
        >
          ดูรายละเอียด
        </Button>
      ]}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            icon={getNotificationIcon(item)}
            style={{ backgroundColor: '#fff2e8' }}
          />
        }
        title={
          <Space>
            <Text strong>
              {item.userData?.displayName || 
               `${item.userData?.firstName} ${item.userData?.lastName}` ||
               item.userData?.email?.split('@')[0] ||
               'ผู้ใช้ใหม่'}
            </Text>
            {getStatusTag(item.status)}
          </Space>
        }
        description={
          <div>
            <Text type="secondary">
              {getDepartmentName(item.userData?.department)} • {getBranchName(item.targetBranch)}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {moment(item.createdAt).fromNow()}
            </Text>
          </div>
        }
      />
    </List.Item>
  );

  const renderSystemNotification = (item) => (
    <List.Item key={item.id}>
      <List.Item.Meta
        avatar={
          <Avatar
            icon={getNotificationIcon(item)}
            style={{ backgroundColor: '#f6ffed' }}
          />
        }
        title={<Text strong>{item.title || 'ระบบแจ้งเตือน'}</Text>}
        description={
          <div>
            <Paragraph>{item.message || item.description}</Paragraph>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {moment(item.createdAt).fromNow()}
            </Text>
          </div>
        }
      />
    </List.Item>
  );

  const renderActivityItem = (item) => (
    <List.Item key={item.id}>
      <List.Item.Meta
        avatar={
          <Avatar
            icon={getNotificationIcon(item)}
            style={{ backgroundColor: '#f9f0ff' }}
          />
        }
        title={<Text>{item.action || item.description}</Text>}
        description={
          <div>
            <Text type="secondary">{item.details}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {moment(item.createdAt).fromNow()}
            </Text>
          </div>
        }
      />
    </List.Item>
  );

  const getTabCount = (tab) => {
    switch (tab) {
      case 'approvals':
        return approvalRequests.filter(r => r.status === 'pending').length;
      case 'system':
        return systemNotifications.filter(n => !n.read).length;
      case 'activities':
        return userActivities.length;
      default:
        return 0;
    }
  };

  const filteredData = () => {
    let data = [];
    switch (activeTab) {
      case 'approvals':
        data = approvalRequests;
        break;
      case 'system':
        data = systemNotifications;
        break;
      case 'activities':
        data = userActivities;
        break;
    }

    if (searchText) {
      data = data.filter(item => 
        JSON.stringify(item).toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (showOnlyUnread) {
      data = data.filter(item => !item.read);
    }

    return data;
  };

  return (
    <LayoutWithRBAC title="การแจ้งเตือน">
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Row align="middle" justify="space-between" gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Title level={3} style={{ margin: 0 }}>
                <Space>
                  <BellOutlined />
                  ศูนย์การแจ้งเตือน
                </Space>
              </Title>
            </Col>
            <Col xs={24} sm={12}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={fetchNotifications}
                  loading={loading}
                >
                  รีเฟรช
                </Button>
                <Button icon={<SettingOutlined />}>
                  ตั้งค่า
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Filters */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8} md={6}>
              <Search
                placeholder="ค้นหาการแจ้งเตือน"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
                placeholder="กรองตามสถานะ"
              >
                <Option value="all">ทั้งหมด</Option>
                <Option value="pending">รอดำเนินการ</Option>
                <Option value="approved">อนุมัติแล้ว</Option>
                <Option value="rejected">ปฏิเสธ</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={8}>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                style={{ width: '100%' }}
                placeholder={['เริ่มต้น', 'สิ้นสุด']}
              />
            </Col>
            <Col xs={24} md={4}>
              <Space>
                <Text>แสดงเฉพาะที่ยังไม่อ่าน:</Text>
                <Switch
                  checked={showOnlyUnread}
                  onChange={setShowOnlyUnread}
                  size="small"
                />
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size={isMobile ? 'small' : 'default'}
        >
          {canSeeApprovals && (
            <Tabs.TabPane
              key="approvals"
              tab={
                <Space>
                  <UserAddOutlined />
                  คำขออนุมัติ
                  <Badge count={getTabCount('approvals')} size="small" />
                </Space>
              }
            >
              <div style={{ minHeight: 400 }}>
                {filteredData().length === 0 ? (
                  <Empty
                    description="ไม่มีการแจ้งเตือน"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <List
                    loading={loading}
                    dataSource={filteredData()}
                    renderItem={renderApprovalItem}
                    pagination={{
                      pageSize: isMobile ? 5 : 10,
                      showSizeChanger: !isMobile,
                      showQuickJumper: !isMobile,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} จาก ${total} รายการ`
                    }}
                  />
                )}
              </div>
            </Tabs.TabPane>
          )}

          {canSeeSystemNotifications && (
            <Tabs.TabPane
              key="system"
              tab={
                <Space>
                  <BellOutlined />
                  แจ้งเตือนระบบ
                  <Badge count={getTabCount('system')} size="small" />
                </Space>
              }
            >
              <div style={{ minHeight: 400 }}>
                {filteredData().length === 0 ? (
                  <Empty
                    description="ไม่มีการแจ้งเตือน"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <List
                    loading={loading}
                    dataSource={filteredData()}
                    renderItem={renderSystemNotification}
                    pagination={{
                      pageSize: isMobile ? 5 : 10,
                      showSizeChanger: !isMobile,
                      showQuickJumper: !isMobile,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} จาก ${total} รายการ`
                    }}
                  />
                )}
              </div>
            </Tabs.TabPane>
          )}

          <Tabs.TabPane
            key="activities"
            tab={
              <Space>
                <InfoCircleOutlined />
                กิจกรรมของฉัน
              </Space>
            }
          >
            <div style={{ minHeight: 400 }}>
              {filteredData().length === 0 ? (
                <Empty
                  description="ไม่มีการแจ้งเตือน"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  loading={loading}
                  dataSource={filteredData()}
                  renderItem={renderActivityItem}
                  pagination={{
                    pageSize: isMobile ? 5 : 10,
                    showSizeChanger: !isMobile,
                    showQuickJumper: !isMobile,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} จาก ${total} รายการ`
                  }}
                />
              )}
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </LayoutWithRBAC>
  );
};

export default NotificationsPage; 