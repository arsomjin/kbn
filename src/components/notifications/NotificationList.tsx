import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Table,
  Tag,
  Typography,
  Space,
  Button,
  Input,
  Select,
  Card,
  Empty,
  Tooltip,
  Badge,
  Pagination,
  DatePicker
} from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { RootState } from '../../store';
import { useNotifications } from '../../hooks/useNotifications';
import { Notification, NotificationType } from '../../services/notificationService';
import { notificationController } from '../../controllers/notificationController';
import './NotificationList.css';
import dayjs from 'dayjs';
import { getTimestampMillis } from '../../utils/timestampUtils';
import { Timestamp } from 'firebase/firestore';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * NotificationList - Full page list of notifications with filtering and pagination
 */
const NotificationList: React.FC = () => {
  const navigate = useNavigate();
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);
  const { notifications, unreadCount, isLoading, hasMore, loadMoreNotifications, markAsRead, markAllAsRead } =
    useNotifications(userProfile);

  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    dateRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Apply filters whenever filters or notifications change
  useEffect(() => {
    const filtered = notifications.filter(notification => {
      const matchesSearch =
        !filters.search ||
        notification.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        notification.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchesType = filters.type === 'all' || notification.type === filters.type;

      const matchesStatus =
        filters.status === 'all' ||
        (filters.status === 'read' && notification.isRead) ||
        (filters.status === 'unread' && !notification.isRead);

      let matchesDate = true;
      if (filters.dateRange) {
        const notificationMillis = getTimestampMillis(notification.createdAt);
        const notificationDate = new Date(notificationMillis);
        const startDate = filters.dateRange[0].toDate();
        const endDate = filters.dateRange[1].toDate();
        // Set end date to end of day
        endDate.setHours(23, 59, 59, 999);
        matchesDate = notificationDate >= startDate && notificationDate <= endDate;
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });

    setFilteredNotifications(filtered);
    setCurrentPage(1);
  }, [filters, notifications]);

  const handleNotificationClick = (notification: Notification) => {
    if (!userProfile?.uid || !notification.id) return;

    // Track notification click for analytics
    notificationController.trackEngagement(notification.id, userProfile.uid, 'click');

    // Mark as read
    markAsRead(notification.id);

    // Navigate if there's a link
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      status: 'all',
      dateRange: null
    });
  };

  // For pagination
  const paginatedNotifications = filteredNotifications.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (page === Math.ceil(filteredNotifications.length / pageSize) && hasMore) {
      loadMoreNotifications();
    }
  };

  // Render different icon based on notification type
  const renderTypeIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case NotificationType.WARNING:
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case NotificationType.ERROR:
        return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      case NotificationType.INFO:
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 60,
      render: (type: NotificationType) => (
        <Tooltip title={type.charAt(0).toUpperCase() + type.slice(1)}>{renderTypeIcon(type)}</Tooltip>
      )
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Notification) => (
        <div className='notification-item-content' onClick={() => handleNotificationClick(record)}>
          <Space>
            {!record.isRead && <Badge status='processing' />}
            <Text strong={!record.isRead}>{title}</Text>
          </Space>
        </div>
      )
    },
    {
      title: 'Message',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => <Text ellipsis={{ tooltip: description }}>{description}</Text>
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (createdAt: any) => {
        if (!createdAt) return <Text type='secondary'>-</Text>;
        if (createdAt instanceof Timestamp) {
          return <Text type='secondary'>{new Date(createdAt.seconds * 1000).toLocaleString()}</Text>;
        }
        return <Text type='secondary'>{new Date(createdAt).toLocaleString()}</Text>;
      }
    }
  ];

  return (
    <div className='notification-list-page'>
      <Card className='notification-list-card'>
        <div className='notification-list-header'>
          <Title level={4}>
            <Space align='center'>
              <BellOutlined />
              Notifications
              {unreadCount > 0 && <Badge count={unreadCount} overflowCount={99} />}
            </Space>
          </Title>

          {unreadCount > 0 && (
            <Button type='primary' icon={<CheckOutlined />} onClick={() => markAllAsRead()}>
              Mark all as read
            </Button>
          )}
        </div>

        <div className='notification-filters'>
          <Space wrap>
            <Input
              placeholder='Search notifications'
              prefix={<SearchOutlined />}
              allowClear
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              style={{ width: 200 }}
            />

            <Select
              placeholder='Filter by type'
              value={filters.type}
              onChange={value => setFilters({ ...filters, type: value })}
              style={{ width: 150 }}
            >
              <Option value='all'>All Types</Option>
              <Option value={NotificationType.INFO}>Information</Option>
              <Option value={NotificationType.SUCCESS}>Success</Option>
              <Option value={NotificationType.WARNING}>Warning</Option>
              <Option value={NotificationType.ERROR}>Error</Option>
            </Select>

            <Select
              placeholder='Filter by status'
              value={filters.status}
              onChange={value => setFilters({ ...filters, status: value })}
              style={{ width: 150 }}
            >
              <Option value='all'>All Status</Option>
              <Option value='read'>Read</Option>
              <Option value='unread'>Unread</Option>
            </Select>

            <RangePicker
              placeholder={['Start date', 'End date']}
              value={filters.dateRange}
              onChange={dates => setFilters({ ...filters, dateRange: dates as [dayjs.Dayjs, dayjs.Dayjs] | null })}
            />

            <Button onClick={handleClearFilters}>Clear Filters</Button>
          </Space>
        </div>

        <div className='notification-table'>
          <Table
            dataSource={paginatedNotifications}
            columns={columns}
            rowKey={record => record.id || ''}
            loading={isLoading}
            pagination={false}
            locale={{
              emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No notifications found' />
            }}
            className='notification-table'
            rowClassName={record => (record.isRead ? 'read' : 'unread')}
          />

          {filteredNotifications.length > 0 && (
            <div className='notification-pagination'>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredNotifications.length + (hasMore ? pageSize : 0)}
                onChange={handlePageChange}
                showSizeChanger={false}
                showTotal={total => `Total ${total} items`}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NotificationList;
