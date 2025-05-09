import React, { useState, useEffect, JSX } from 'react';
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
  notification,
  Avatar
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
  CalendarOutlined
} from '@ant-design/icons';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../services/firebase';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../constants/Permissions';
import { ROLES, RoleType, ROLE_PERMISSIONS, ROLE_HIERARCHY } from '../../constants/roles';
import { notificationController } from '../../controllers/notificationController';
import { NotificationType } from '../../services/notificationService';
import type { ColumnsType } from 'antd/es/table';
import UserRoleEditor, { EditableUser, Province } from '../../components/auth/UserRoleEditor';
import styles from './UserRoleManager.module.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface UserTableItem {
  uid: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  role: RoleType;
  customPermissions: string[];
  accessibleProvinceIds?: string[];
  province?: string;
  department?: string;
  branch?: string;
  lastLogin?: Date | string;
  status?: 'active' | 'inactive' | 'pending';
  isEmailVerified?: boolean;
}

/**
 * UserRoleManager component for administrators to manage user roles and permissions
 * This component allows viewing, filtering, and editing user roles and permissions
 */
const UserRoleManager: React.FC = () => {
  const { t } = useTranslation();
  const { hasPermission, hasProvinceAccess } = usePermissions();

  // State for users data
  const [users, setUsers] = useState<UserTableItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [filterProvince, setFilterProvince] = useState<string | null>(null);

  // State for provinces data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState<boolean>(true);

  // Edit modal states
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<EditableUser | null>(null);
  const [editingInProgress, setEditingInProgress] = useState<boolean>(false);

  // Allpermissions for transfer component
  const [allPermissions, setAllPermissions] = useState<{ key: string; title: string }[]>([]);

  // Available roles for selection
  const [availableRoles, setAvailableRoles] = useState<Array<{ value: string; label: string; description: string }>>(
    []
  );

  // Window width for responsive design
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 992;

  // Effect for window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize available roles
  useEffect(() => {
    // Create available roles array based on ROLES object
    const roles = Object.values(ROLES).map(role => ({
      value: role,
      label: `roles.${role.toLowerCase()}`,
      description: `roles.${role.toLowerCase()}Description`
    }));

    setAvailableRoles(roles);
  }, []);

  // Effect to fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      if (!hasPermission(PERMISSIONS.USER_VIEW)) {
        notification.error({
          message: t('common.error'),
          description: t('permissions.insufficientPermissions')
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const usersRef = collection(firestore, 'users');
        const usersQuery = query(usersRef, where('deleted', '!=', true));
        const querySnapshot = await getDocs(usersQuery);

        const usersList: UserTableItem[] = [];
        querySnapshot.forEach(doc => {
          const userData = doc.data();

          // Check if current user has access to this user's province
          if (userData.provinceId && !hasProvinceAccess(userData.provinceId)) {
            return; // Skip users from provinces the current user cannot access
          }

          usersList.push({
            uid: doc.id,
            email: userData.email || '',
            displayName: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || '',
            firstName: userData.firstName,
            lastName: userData.lastName,
            photoURL: userData.photoURL,
            role: userData.role as RoleType,
            customPermissions: userData.customPermissions || [],
            accessibleProvinceIds: userData.accessibleProvinceIds || [],
            province: userData.province || '',
            department: userData.department || '',
            branch: userData.branch || '',
            lastLogin: userData.lastLogin,
            status: userData.status || 'active',
            isEmailVerified: userData.isEmailVerified
          });
        });

        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
        notification.error({
          message: t('userRoleManager.errors.fetchUsers'),
          description: error instanceof Error ? error.message : t('common.unexpectedError')
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [hasPermission, hasProvinceAccess, t]);

  // Effect to fetch provinces data
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const provincesRef = collection(firestore, 'provinces');
        const provincesQuery = query(provincesRef, where('isActive', '==', true));
        const querySnapshot = await getDocs(provincesQuery);

        const provincesList: Province[] = [];
        querySnapshot.forEach(doc => {
          const provinceData = doc.data() as Province;
          provincesList.push({
            id: doc.id,
            name: provinceData.name,
            code: provinceData.code || '',
            isActive: provinceData.isActive
          });
        });

        setProvinces(provincesList);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      } finally {
        setLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []);

  // Effect to create permissions list for transfer component
  useEffect(() => {
    const permissionsList = Object.entries(PERMISSIONS).map(([key, value]) => ({
      key: value,
      title: t(`permissions.${key.toLowerCase()}`, value)
    }));

    setAllPermissions(permissionsList);
  }, [t]);

  // Filter users based on search text, role, and province
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      searchText === '' ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      (user.displayName && user.displayName.toLowerCase().includes(searchText.toLowerCase()));

    const matchesRole = !filterRole || user.role === filterRole;
    const matchesProvince =
      !filterProvince ||
      user.province === filterProvince ||
      (user.accessibleProvinceIds && user.accessibleProvinceIds.includes(filterProvince));

    return matchesSearch && matchesRole && matchesProvince;
  });

  // Handle edit user button click
  const handleEditUser = (user: UserTableItem) => {
    if (!hasPermission(PERMISSIONS.USER_ROLE_EDIT)) {
      notification.error({
        message: t('common.error'),
        description: t('permissions.insufficientPermissions')
      });
      return;
    }

    // Create editing user object with current values as defaults
    const editingUser: EditableUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      selectedRole: user.role,
      selectedPermissions: [...user.customPermissions],
      selectedProvinceIds: user.accessibleProvinceIds || ([user.province].filter(Boolean) as string[]),
      branchId: user.branch,
      departmentId: user.department,
      provinceId: user.province
    };

    setCurrentUser(editingUser);
    setIsEditModalVisible(true);
  };

  // Handle save changes in edit modal
  const handleSaveChanges = async (editedUser: EditableUser) => {
    setEditingInProgress(true);
    try {
      const userRef = doc(firestore, 'users', editedUser.uid);

      // Prepare update data
      const updateData = {
        role: editedUser.selectedRole,
        customPermissions: editedUser.selectedPermissions,
        accessibleProvinceIds: editedUser.selectedProvinceIds,
        updatedAt: new Date()
      };

      // Update user in Firestore
      await updateDoc(userRef, updateData);

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.uid === editedUser.uid
            ? {
                ...user,
                role: editedUser.selectedRole,
                customPermissions: editedUser.selectedPermissions,
                accessibleProvinceIds: editedUser.selectedProvinceIds
              }
            : user
        )
      );

      // Send notification to the user
      await notificationController.sendNotification(
        {
          title: t('userRoleManager.notifications.roleUpdatedTitle'),
          description: t('userRoleManager.notifications.roleUpdatedDescription', {
            role: editedUser.selectedRole
          }),
          type: NotificationType.INFO,
          link: '/profile'
        },
        { userIds: [editedUser.uid], sendPush: true }
      );

      notification.success({
        message: t('userRoleManager.success.updateUser'),
        description: t('userRoleManager.success.updateUserDescription', {
          user: editedUser.displayName || editedUser.email
        })
      });

      // Close modal
      setIsEditModalVisible(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      notification.error({
        message: t('userRoleManager.errors.updateUser'),
        description: error instanceof Error ? error.message : t('common.unexpectedError')
      });
    } finally {
      setEditingInProgress(false);
    }
  };

  // Reset search and filters
  const resetFilters = () => {
    setSearchText('');
    setFilterRole(null);
    setFilterProvince(null);
  };

  // Render permission summary for display
  const renderPermissionSummary = (permissions: string[]): JSX.Element => {
    if (!permissions || permissions.length === 0) {
      return (
        <Text type='secondary' italic>
          {t('userRoleManager.noPermissions', 'No permissions')}
        </Text>
      );
    }

    return (
      <div className='flex items-center'>
        <Tag color='green' className={`rounded-full ${styles.permissionsTag}`}>
          {t('userRoleManager.permissionCount', { count: permissions.length })}
        </Tag>
      </div>
    );
  };

  // Render province tags for display
  const renderProvinceTags = (provinceIds?: string[]) => {
    if (!provinceIds || provinceIds.length === 0) {
      return (
        <Text type='secondary' italic>
          {t('userRoleManager.noProvinces', 'No provinces assigned')}
        </Text>
      );
    }

    return (
      <div className='flex flex-wrap gap-1'>
        {provinceIds.map(provinceId => {
          const province = provinces.find(p => p.id === provinceId);
          return (
            <Tag key={provinceId} color='blue' className='flex items-center rounded-full px-3 py-1'>
              {province?.name || provinceId}
            </Tag>
          );
        })}
      </div>
    );
  };

  // Define table columns
  const getColumns = (): ColumnsType<UserTableItem> => {
    const baseColumns: ColumnsType<UserTableItem> = [
      {
        title: t('userRoleManager.columns.name'),
        dataIndex: 'displayName',
        key: 'displayName',
        width: 220,
        className: styles.nameColumn,
        render: (text, record) => {
          const userName = text
            ? text
            : record.firstName || record.lastName
              ? `${record.firstName || ''} ${record.lastName || ''}`.trim()
              : record.email || t('userRoleManager.unnamed');

          return (
            <div className='flex items-center space-x-3'>
              <Avatar icon={<UserOutlined />} src={record.photoURL} />
              <div>
                <Text strong className='block leading-tight'>
                  {userName}
                </Text>
                <Text type='secondary' className='text-sm'>
                  {record.email}
                </Text>
              </div>
            </div>
          );
        }
      },
      {
        title: t('userRoleManager.columns.role'),
        dataIndex: 'role',
        key: 'role',
        width: 160,
        className: styles.roleColumn,
        render: (role: RoleType) => (
          <Tag color={getRoleColor(role)} className='px-2 py-1'>
            {t(`roles.${role.toLowerCase()}`)}
          </Tag>
        ),
        filters: Object.values(ROLES).map(role => ({
          text: t(`roles.${role.toLowerCase()}`),
          value: role
        })),
        onFilter: (value, record) => record.role === value
      },
      {
        title: t('userRoleManager.columns.province'),
        dataIndex: 'province',
        key: 'province',
        width: 180,
        responsive: ['md'],
        className: styles.provincesColumn,
        render: (text, record) => (
          <div className={styles.permissionsContainer}>
            {renderProvinceTags(record.accessibleProvinceIds || (record.province ? [record.province] : []))}
          </div>
        )
      },
      {
        title: t('userRoleManager.columns.permissions'),
        dataIndex: 'customPermissions',
        key: 'permissions',
        width: 180,
        responsive: ['lg'],
        className: styles.permissionsColumn,
        render: (permissions: string[], record) => (
          <div className={styles.permissionsContainer}>
            {permissions.length > 0 ? (
              renderPermissionSummary(permissions)
            ) : (
              <Tooltip title={t('userRoleManager.roleDefaultPermissions')}>
                <Tag color='blue' className={`rounded-full ${styles.permissionsTag}`}>
                  {ROLE_PERMISSIONS[record.role]?.length || 0} {t('userRoleManager.defaultPermissions')}
                </Tag>
              </Tooltip>
            )}
            <div className={styles.actionButtonContainer}>
              <Button
                type='text'
                icon={<SettingOutlined />}
                size='small'
                onClick={() => handleEditUser(record)}
                title={t('userRoleManager.buttons.configure')}
                className={styles.actionButton}
              />
            </div>
          </div>
        )
      },
      {
        title: t('userRoleManager.columns.status'),
        dataIndex: 'status',
        key: 'status',
        width: 120,
        responsive: ['md'],
        className: styles.statusColumn,
        render: (status: string) => {
          const statusColors = {
            active: 'green',
            inactive: 'red',
            pending: 'orange'
          };
          const color = statusColors[status as keyof typeof statusColors] || 'default';

          return (
            <Tag color={color} className='rounded-full px-2 py-0'>
              {t(`userRoleManager.status.${status}`)}
            </Tag>
          );
        },
        filters: [
          { text: t('userRoleManager.status.active'), value: 'active' },
          { text: t('userRoleManager.status.inactive'), value: 'inactive' },
          { text: t('userRoleManager.status.pending'), value: 'pending' }
        ],
        onFilter: (value, record) => record.status === value
      },
      {
        title: t('userRoleManager.columns.actions'),
        key: 'actions',
        ...(!isMobile ? { fixed: 'right' } : {}),
        width: 130,
        className: styles.actionsColumn,
        render: (_, record) => (
          <Button
            type='primary'
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
            disabled={!hasPermission(PERMISSIONS.USER_ROLE_EDIT)}
            size={isMobile ? 'small' : 'middle'}
            className='shadow-sm hover:shadow transition-all'
          >
            {!isMobile && t('userRoleManager.actions.edit')}
          </Button>
        )
      }
    ];

    // For mobile views, adjust columns for better display
    if (isMobile) {
      return baseColumns.map(col => {
        if (col.key === 'status') {
          return {
            ...col,
            responsive: undefined // Remove responsive property
          };
        }
        return col;
      });
    }

    return baseColumns;
  };

  // Expandable row configuration for mobile view
  const expandableConfig = isMobile
    ? {
        expandedRowRender: (record: UserTableItem) => (
          <Card size='small' bordered={false} className='bg-gray-50 dark:bg-gray-800 mb-2'>
            <div className='space-y-3 py-1'>
              <div className='flex items-start'>
                <MailOutlined className='text-gray-400 mt-1 mr-2' />
                <div>
                  <Text type='secondary' className='block text-xs'>
                    {t('userRoleManager.columns.email')}
                  </Text>
                  <Text>{record.email}</Text>
                </div>
              </div>

              {record.province && (
                <div className='flex items-start'>
                  <div className='text-gray-400 mt-1 mr-2'>🏢</div>
                  <div>
                    <Text type='secondary' className='block text-xs'>
                      {t('userRoleManager.columns.province')}
                    </Text>
                    <Text>{provinces.find(p => p.id === record.province)?.name || record.province}</Text>
                  </div>
                </div>
              )}

              <div className='flex items-start'>
                <LockOutlined className='text-gray-400 mt-1 mr-2' />
                <div>
                  <Text type='secondary' className='block text-xs'>
                    {t('userRoleManager.columns.permissions')}
                  </Text>
                  <Text>
                    {record.customPermissions.length > 0
                      ? `${record.customPermissions.length} ${t('userRoleManager.customPermissions')}`
                      : `${ROLE_PERMISSIONS[record.role]?.length || 0} ${t('userRoleManager.defaultPermissions')}`}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        ),
        expandIcon: ({
          expanded,
          onExpand,
          record
        }: {
          expanded: boolean;
          onExpand: (record: UserTableItem, e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
          record: UserTableItem;
        }) =>
          expanded ? (
            <Button
              type='text'
              onClick={e => onExpand(record, e)}
              icon={
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M18 15l-6-6-6 6' />
                </svg>
              }
              size='small'
            />
          ) : (
            <Button
              type='text'
              onClick={e => onExpand(record, e)}
              icon={
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M6 9l6 6 6-6' />
                </svg>
              }
              size='small'
            />
          )
      }
    : undefined;

  // Get color for role tag
  const getRoleColor = (role: RoleType): string => {
    const roleColors: Record<string, string> = {
      [ROLES.SUPER_ADMIN]: 'magenta',
      [ROLES.PROVINCE_ADMIN]: 'red',
      [ROLES.PRIVILEGE]: 'volcano',
      [ROLES.GENERAL_MANAGER]: 'orange',
      [ROLES.PROVINCE_MANAGER]: 'gold',
      [ROLES.BRANCH_MANAGER]: 'lime',
      [ROLES.LEAD]: 'green',
      [ROLES.USER]: 'cyan',
      [ROLES.BRANCH]: 'blue',
      [ROLES.PENDING]: 'purple',
      [ROLES.GUEST]: 'default',
      [ROLES.DEVELOPER]: 'geekblue'
    };

    return roleColors[role] || 'default';
  };

  return (
    <div className={styles.userRoleManagerContainer}>
      <Card className={styles.headerCard}>
        <div
          className={`flex ${isMobile ? 'flex-col' : 'flex-row justify-between'} items-${isMobile ? 'start' : 'center'}`}
        >
          <div>
            <Title level={isMobile ? 3 : 2} className='mb-1'>
              {t('userRoleManager.title')}
            </Title>
            <Paragraph>{t('userRoleManager.subtitle', 'Manage user roles and permissions')}</Paragraph>
          </div>
          <Tooltip title={t('userRoleManager.tooltip', 'Manage user roles and permissions for your organization')}>
            <Button type='text' icon={<QuestionCircleOutlined className='text-xl' />} />
          </Tooltip>
        </div>
      </Card>

      <Card className={styles.tableCard} style={{ marginBottom: '16px' }}>
        <div className={styles.filterControls}>
          <Input
            placeholder={t('userRoleManager.searchPlaceholder')}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: isMobile ? '100%' : 240 }}
            allowClear
          />

          <Select
            placeholder={t('userRoleManager.filterByRole')}
            allowClear
            value={filterRole}
            onChange={setFilterRole}
            style={{ width: isMobile ? '100%' : 180 }}
          >
            {Object.values(ROLES).map(role => (
              <Option key={role} value={role}>
                {t(`roles.${role.toLowerCase()}`)}
              </Option>
            ))}
          </Select>

          <Select
            placeholder={t('userRoleManager.filterByProvince')}
            allowClear
            value={filterProvince}
            onChange={setFilterProvince}
            style={{ width: isMobile ? '100%' : 180 }}
            loading={loadingProvinces}
          >
            {provinces.map(province => (
              <Option key={province.id} value={province.id}>
                {province.name}
              </Option>
            ))}
          </Select>

          <Button icon={<ReloadOutlined />} onClick={resetFilters} type='default'>
            {!isMobile && t('userRoleManager.resetFilters')}
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <Spin size={isMobile ? 'default' : 'large'} tip={t('userRoleManager.loading', 'Loading users...')} />
        </div>
      ) : filteredUsers.length > 0 ? (
        <Card className={styles.tableCard}>
          <Table
            dataSource={filteredUsers}
            columns={getColumns()}
            rowKey='uid'
            expandable={expandableConfig}
            pagination={{
              pageSize: isMobile ? 5 : 10,
              showSizeChanger: !isMobile,
              pageSizeOptions: isMobile ? ['5', '10'] : ['10', '20', '50', '100'],
              size: isMobile ? 'small' : 'default',
              position: ['bottomCenter'],
              className: 'mt-4'
            }}
            size={isMobile ? 'small' : 'middle'}
            scroll={{ x: isMobile ? 800 : 1200 }}
            rowClassName='hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
            className={styles.userTable}
          />
        </Card>
      ) : (
        <Card className={`${styles.tableCard} ${styles.emptyState}`}>
          <Empty
            description={
              <Text className='text-gray-500'>
                {searchText || filterRole || filterProvince
                  ? t('userRoleManager.noMatchingUsers', 'No users match your search criteria')
                  : t('userRoleManager.noUsers', 'No users found')}
              </Text>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}

      {/* Use the shared UserRoleEditor component */}
      <UserRoleEditor
        visible={isEditModalVisible}
        user={currentUser}
        availableRoles={availableRoles}
        availableProvinces={provinces}
        rolePermissions={ROLE_PERMISSIONS}
        onCancel={() => setIsEditModalVisible(false)}
        onSave={handleSaveChanges}
        isSaving={editingInProgress}
        allPermissions={allPermissions}
        modalTitle='userRoleManager.editModal.title'
        showAllTabs={true}
      />
    </div>
  );
};

export default UserRoleManager;
