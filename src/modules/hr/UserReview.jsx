import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Select,
  Spin,
  Empty,
  Tooltip,
  Modal,
  Checkbox,
  Tag,
  Card,
  Typography,
  Avatar,
  Space,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  EditOutlined,
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { collection, onSnapshot, query, doc, updateDoc, where } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { firestore } from '../../services/firebase';
import { ROLES, ROLE_PERMISSIONS } from '../../constants/roles';
import { PERMISSIONS } from '../../constants/Permissions';
import { notificationController } from '../../controllers/notificationController';
import { NotificationType } from '../../services/notificationService';
import { usePermissions } from 'hooks/usePermissions';
import UserRoleEditor from '../../components/auth/UserRoleEditor';
import styles from './UserReview.module.css';
import { getPrivilegeLevel } from '../../utils/roleUtils';
import { useAuth } from 'contexts/AuthContext';
import PageDoc from '../../components/PageDoc';

const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

// Fallback roles in case Firestore access fails - ordered by privilege level
const DEFAULT_ROLES = [
  {
    value: ROLES.USER,
    label: 'roles.user.label',
    description: 'roles.user.description',
  },
  {
    value: ROLES.LEAD,
    label: 'roles.lead.label',
    description: 'roles.lead.description',
  },
  {
    value: ROLES.BRANCH_MANAGER,
    label: 'roles.branch_manager.label',
    description: 'roles.branch_manager.description',
  },
  {
    value: ROLES.PROVINCE_MANAGER,
    label: 'roles.province_manager.label',
    description: 'roles.province_manager.description',
  },
  {
    value: ROLES.PROVINCE_ADMIN,
    label: 'roles.province_admin.label',
    description: 'roles.province_admin.description',
  },
  {
    value: ROLES.GENERAL_MANAGER,
    label: 'roles.general_manager.label',
    description: 'roles.general_manager.description',
  },
  {
    value: ROLES.SUPER_ADMIN,
    label: 'roles.super_admin.label',
    description: 'roles.super_admin.description',
  },
  {
    value: ROLES.EXECUTIVE,
    label: 'roles.executive.label',
    description: 'roles.executive.description',
  },
];

const UserReview = () => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleEditor, setShowRoleEditor] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('deleted', '==', false));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const userList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUsers(userList);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
        <Tag color={getPrivilegeLevel(role) > 0 ? 'blue' : 'default'}>
          {t(`roles.${role}.label`)}
        </Tag>
      ),
    },
    {
      title: t('users.columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'error'}>
          {status === 'active' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          {t(`users.status.${status}`)}
        </Tag>
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
          <Title level={4}>{t('users.review.title')}</Title>
          <Paragraph type="secondary">{t('users.review.description')}</Paragraph>
        </div>

        <Table
          columns={columns}
          dataSource={users}
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

export default UserReview;
