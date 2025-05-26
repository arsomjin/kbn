import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  Button,
  Select,
  Tag,
  Card,
  Input,
  Space,
  Spin,
  Typography,
  Form,
  Alert,
  Tooltip,
  Empty,
  Avatar,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  EditOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  MailOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../services/firebase';
import { usePermissions } from 'hooks/usePermissions';
import { PERMISSIONS } from '../../constants/Permissions';
import { ROLES, ROLE_PERMISSIONS, ROLE_HIERARCHY } from '../../constants/roles';
import { notificationController } from '../../controllers/notificationController';
import { NotificationType } from '../../services/notificationService';
import UserRoleEditor from '../../components/auth/UserRoleEditor';
import styles from './UserRoleManager.module.css';
import PageDoc from '../../components/PageDoc';
import { useAuth } from 'contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const UserRoleManager = () => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleEditor, setShowRoleEditor] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('deleted', '==', false));
      const snapshot = await getDocs(q);

      const userList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(userList);
      setFilteredUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
      notificationController.error({
        message: t('notifications.error'),
        description: t('notifications.fetchFailed'),
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (value) => {
    setSearchText(value);
    filterUsers(value, roleFilter);
  };

  const handleRoleFilter = (value) => {
    setRoleFilter(value);
    filterUsers(searchText, value);
  };

  const filterUsers = (search, role) => {
    let filtered = [...users];

    if (search) {
      filtered = filtered.filter(
        (user) =>
          user.displayName?.toLowerCase().includes(search.toLowerCase()) ||
          user.email?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (role !== 'all') {
      filtered = filtered.filter((user) => user.role === role);
    }

    setFilteredUsers(filtered);
  };

  const handleRoleEdit = (user) => {
    setSelectedUser(user);
    setShowRoleEditor(true);
  };

  const handleRoleUpdate = async (updatedUser) => {
    try {
      const userRef = doc(firestore, 'users', updatedUser.id);
      await updateDoc(userRef, {
        role: updatedUser.role,
        updatedAt: new Date().toISOString(),
        updatedBy: userProfile.uid,
      });

      notificationController.success({
        message: t('notifications.success'),
        description: t('notifications.roleUpdated'),
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      notificationController.error({
        message: t('notifications.error'),
        description: t('notifications.roleUpdateFailed'),
      });
    }
  };

  const columns = [
    {
      title: t('users.columns.name'),
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary">{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: t('users.columns.role'),
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={ROLE_HIERARCHY[role]?.color || 'default'}>{t(`roles.${role}.label`)}</Tag>
      ),
    },
    {
      title: t('users.columns.permissions'),
      dataIndex: 'role',
      key: 'permissions',
      render: (role) => (
        <Space wrap>
          {ROLE_PERMISSIONS[role]?.map((permission) => (
            <Tag key={permission} color="blue">
              {t(`permissions.${permission}.label`)}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: t('users.columns.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title={t('users.actions.editRole')}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleRoleEdit(record)}
              disabled={!hasPermission(PERMISSIONS.MANAGE_ROLES)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <Title level={4}>{t('users.roles.title')}</Title>
          <Paragraph type="secondary">{t('users.roles.description')}</Paragraph>
        </div>

        <div className={styles.filters}>
          <Space>
            <Input
              placeholder={t('common.search')}
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 200 }}
            />
            <Select defaultValue="all" style={{ width: 200 }} onChange={handleRoleFilter}>
              <Option value="all">{t('common.allRoles')}</Option>
              {Object.entries(ROLES).map(([key, value]) => (
                <Option key={key} value={value}>
                  {t(`roles.${value}.label`)}
                </Option>
              ))}
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
              {t('common.refresh')}
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => t('common.totalItems', { total }),
          }}
          locale={{
            emptyText: <Empty description={t('common.noData')} />,
          }}
        />
      </Card>

      {showRoleEditor && selectedUser && (
        <UserRoleEditor
          visible={showRoleEditor}
          user={selectedUser}
          onCancel={() => setShowRoleEditor(false)}
          onSave={handleRoleUpdate}
        />
      )}
    </div>
  );
};

export default UserRoleManager;
