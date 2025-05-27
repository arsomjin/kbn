import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button, Tabs, Form, Select, Transfer, Alert, Tag, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { ROLES } from '../../constants/roles';
import { PERMISSIONS } from '../../constants/Permissions';
import { getPrivilegeLevel } from '../../utils/roleUtils';
import { useResponsive } from 'hooks/useResponsive';
import styles from './UserRoleEditor.module.css';

const { Option } = Select;
const { TabPane } = Tabs;
const { Text } = Typography;

/**
 * A reusable component for editing user roles and provinces
 */
const UserRoleEditor = ({
  visible,
  user,
  availableRoles,
  availableProvinces,
  rolePermissions,
  onCancel,
  onSave,
  isSaving = false,
  modalTitle = 'userRoleManager.editModal.title',
  namespace = 'userRoleManager',
}) => {
  const { t } = useTranslation([namespace, 'common', 'roles', 'provinces']);
  const { isMobile, isTablet } = useResponsive();
  const [editingUser, setEditingUser] = useState(null);
  const [activeTabKey, setActiveTabKey] = useState('role');

  // Derive translation key prefix from modalTitle prop
  const getKeyPrefix = () => {
    // Extract prefix from modalTitle (e.g., "userReview.editModal.title" -> "userReview.editModal")
    const parts = modalTitle.split('.');
    if (parts.length >= 2) {
      return `${parts[0]}.${parts[1]}`; // Get the first two parts as prefix
    }
    return `${namespace}.editModal`; // Default prefix
  };

  const keyPrefix = getKeyPrefix();

  // Update editingUser when user prop changes
  useEffect(() => {
    if (user) {
      setEditingUser({ ...user });
    } else {
      setEditingUser(null);
    }
  }, [user]);

  // Reset activeTabKey when modal opens
  useEffect(() => {
    if (visible) {
      setActiveTabKey('role');
    }
  }, [visible]);

  // Handle role change
  const handleRoleChange = (role) => {
    if (!editingUser) return;

    // Get default permissions for the selected role
    let defaultPermissions = rolePermissions[role] || [];

    // Add VIEW_ACCOUNTS permission for account department
    if (['dep0005', 'dep0012'].includes(editingUser.departmentId || '')) {
      if (!defaultPermissions.includes(PERMISSIONS.VIEW_ACCOUNTS)) {
        defaultPermissions = [...defaultPermissions, PERMISSIONS.VIEW_ACCOUNTS];
      }
    }

    // Set default selectedProvinceIds based on role executive level
    const defaultProvinceIds =
      getPrivilegeLevel(role) >= getPrivilegeLevel(ROLES.GENERAL_MANAGER)
        ? availableProvinces
            .filter((province) => province.isActive !== false)
            .map((province) => province.id)
        : editingUser.provinceId
          ? [editingUser.provinceId]
          : [];

    setEditingUser({
      ...editingUser,
      selectedRole: role,
      selectedPermissions: defaultPermissions,
      selectedProvinceIds: defaultProvinceIds,
    });
  };

  // Handle permission change in the Transfer component
  const handlePermissionChange = (targetKeys) => {
    if (!editingUser) return;

    // Get role-based permissions for the current role
    const roleBasedPermissions = rolePermissions[editingUser.selectedRole] || [];

    // Filter out role-based permissions from the selected permissions
    const customPermissions = targetKeys.filter(
      (permission) => !roleBasedPermissions.includes(permission),
    );

    setEditingUser({
      ...editingUser,
      selectedPermissions: [...roleBasedPermissions, ...customPermissions],
    });
  };

  // Translate a permission key to its display name
  const translatePermission = (permission) => {
    try {
      if (typeof permission !== 'string') {
        console.error('Invalid permission format:', permission);
        return 'Unknown Permission';
      }
      // Convert from DATA_VIEW format to data_view format
      const permKey = permission.replace(/^PERMISSIONS\./, '').toLowerCase();
      // Try using the key with explicit permissions namespace and empty defaultValue
      const translated = t(permKey, { ns: 'permissions', defaultValue: '' });
      if (translated) return translated;
      // Fallback: humanize the permission key (e.g., DATA_VIEW -> Data View)
      return permKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    } catch (error) {
      console.error('Error translating permission:', permission, error);
      return String(permission);
    }
  };

  // Handle province selection
  const handleProvinceChange = (provinceIds) => {
    if (!editingUser) return;

    setEditingUser({
      ...editingUser,
      selectedProvinceIds: provinceIds,
    });
  };

  // Handle save
  const handleSave = () => {
    console.log('[UserRoleEditor] editingUser', editingUser);
    if (editingUser) {
      onSave(editingUser);
    }
  };

  // Reset permissions to default for the current role
  const resetPermissionsToDefault = () => {
    if (!editingUser) return;

    const defaultPermissions = rolePermissions[editingUser.selectedRole] || [];
    setEditingUser({
      ...editingUser,
      selectedPermissions: [...defaultPermissions],
    });
  };

  // Generate tab items
  const getTabItems = () => {
    if (!editingUser) return [];

    const items = [
      {
        key: 'role',
        label: t(`${keyPrefix}.tabs.role`, t(`editModal.tabs.role`, 'Role')),
        children: (
          <div className="p-4 w-full overflow-x-hidden">
            <h3 className="text-lg mb-4">
              {t(`editModal.roleTitle`, t(`${namespace}.editModal.roleTitle`, 'Select User Role'))}
            </h3>
            <Form layout="vertical">
              <Form.Item
                label={t(`editModal.roleLabel`, t(`${namespace}.editModal.roleLabel`, 'Role'))}
                extra={t(
                  `editModal.roleDescription`,
                  t(
                    `${namespace}.editModal.roleDescription`,
                    'Assign a role to control user access',
                  ),
                )}
              >
                <Select
                  value={editingUser.selectedRole}
                  onChange={(value) => handleRoleChange(value)}
                  style={{ width: '100%' }}
                >
                  {availableRoles.map((role) => (
                    <Option key={role.value} value={role.value}>
                      {t(`${role.value.toLowerCase()}.label`, { ns: 'roles' })}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
            <Alert
              message={t(
                `editModal.roleInfo`,
                t(`${namespace}.editModal.roleInfo`, 'Role Information'),
              )}
              description={t(`${editingUser.selectedRole.toLowerCase()}.description`, {
                ns: 'roles',
              })}
              type="info"
              showIcon
              className="mb-4"
            />
          </div>
        ),
      },
      {
        key: 'permissions',
        label: t(`${keyPrefix}.tabs.permissions`, t(`editModal.tabs.permissions`, 'Permissions')),
        children: (
          <div className="p-4 w-full overflow-x-hidden">
            <h3 className="text-lg mb-4">
              {t(
                `editModal.permissionsTitle`,
                t(`${namespace}.editModal.permissionsTitle`, 'Manage Permissions'),
              )}
            </h3>
            <Form layout="vertical">
              <Form.Item
                label={t(
                  `editModal.permissionsLabel`,
                  t(`${namespace}.editModal.permissionsLabel`, 'Custom Permissions'),
                )}
                extra={t(
                  `editModal.permissionsDescription`,
                  t(
                    `${namespace}.editModal.permissionsDescription`,
                    'Select additional permissions beyond the role defaults',
                  ),
                )}
              >
                <Transfer
                  dataSource={Object.values(PERMISSIONS).map((permission) => ({
                    key: permission,
                    title: translatePermission(permission),
                  }))}
                  titles={[
                    t('editModal.availablePermissions', 'Available'),
                    t('editModal.selectedPermissions', 'Selected'),
                  ]}
                  targetKeys={editingUser.selectedPermissions}
                  onChange={handlePermissionChange}
                  render={(item) => item.title}
                  listStyle={{
                    width: isMobile ? '100%' : 250,
                    height: 300,
                  }}
                  operations={[
                    t('editModal.addPermissions', 'Add'),
                    t('editModal.removePermissions', 'Remove'),
                  ]}
                  className={styles.permissionsTransfer}
                />
              </Form.Item>
              <Button type="link" onClick={resetPermissionsToDefault} className="mt-2">
                {t('editModal.resetToDefault', 'Reset to Role Defaults')}
              </Button>
            </Form>
          </div>
        ),
      },
      {
        key: 'provinces',
        label: t(`${keyPrefix}.tabs.provinces`, t(`editModal.tabs.provinces`, 'Provinces')),
        children: (
          <div className="p-4 w-full overflow-x-hidden">
            <h3 className="text-lg mb-4">
              {t(
                `editModal.provincesTitle`,
                t(`${namespace}.editModal.provincesTitle`, 'Manage Province Access'),
              )}
            </h3>
            <Form layout="vertical">
              <Form.Item
                label={t(
                  `editModal.provincesLabel`,
                  t(`${namespace}.editModal.provincesLabel`, 'Accessible Provinces'),
                )}
                extra={t(
                  `editModal.provincesDescription`,
                  t(
                    `${namespace}.editModal.provincesDescription`,
                    'Select provinces this user can access',
                  ),
                )}
              >
                <Select
                  mode="multiple"
                  value={editingUser.selectedProvinceIds}
                  onChange={handleProvinceChange}
                  style={{ width: '100%' }}
                  disabled={
                    getPrivilegeLevel(editingUser.selectedRole) >=
                    getPrivilegeLevel(ROLES.GENERAL_MANAGER)
                  }
                >
                  {availableProvinces.map((province) => (
                    <Option key={province.id} value={province.id}>
                      {province.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </div>
        ),
      },
      {
        key: 'summary',
        label: t(`${keyPrefix}.tabs.summary`, t(`editModal.tabs.summary`, 'Summary')),
        children: (
          <div className="p-4 w-full overflow-x-hidden">
            <h3 className="text-lg mb-4">
              {t(
                `editModal.summaryTitle`,
                t(`${namespace}.editModal.summaryTitle`, 'User Summary'),
              )}
            </h3>
            <div className="space-y-4">
              <div>
                <Text strong>{t('editModal.currentRole', 'Current Role')}:</Text>
                <div className="mt-1">
                  <Tag color="blue">
                    {t(`${editingUser.selectedRole.toLowerCase()}.label`, { ns: 'roles' })}
                  </Tag>
                </div>
              </div>
              <div>
                <Text strong>{t('editModal.permissions', 'Permissions')}:</Text>
                <div className="mt-1 flex flex-wrap gap-1">
                  {editingUser.selectedPermissions.map((permission) => (
                    <Tag key={permission} color="green">
                      {translatePermission(permission)}
                    </Tag>
                  ))}
                </div>
              </div>
              <div>
                <Text strong>{t('editModal.provinces', 'Provinces')}:</Text>
                <div className="mt-1 flex flex-wrap gap-1">
                  {editingUser.selectedProvinceIds.map((provinceId) => {
                    const province = availableProvinces.find((p) => p.id === provinceId);
                    return (
                      <Tag key={provinceId} color="blue">
                        {province?.name || provinceId}
                      </Tag>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ),
      },
    ];

    return items;
  };

  return (
    <Modal
      title={t(modalTitle)}
      open={visible}
      onCancel={onCancel}
      onOk={handleSave}
      confirmLoading={isSaving}
      width={isMobile ? '100%' : isTablet ? '80%' : '60%'}
      className={styles.userRoleEditorModal}
    >
      <Tabs
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        items={getTabItems()}
        className={styles.userRoleEditorTabs}
      />
    </Modal>
  );
};

export default UserRoleEditor;
