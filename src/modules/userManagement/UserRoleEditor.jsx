import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Button,
  Tabs,
  Form,
  Select,
  Transfer,
  Alert,
  Tag,
  Typography,
  Collapse,
  Checkbox,
  Row,
  Col,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { ROLES, ROLE_PERMISSIONS } from '../../constants/roles';
import { PERMISSIONS, PERMISSION_CATEGORIES } from '../../constants/Permissions';
import { getPrivilegeLevel } from '../../utils/roleUtils';
import { useResponsive } from 'hooks/useResponsive';
import styles from './UserRoleEditor.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_HIERARCHY } from '../../constants/roles';

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
  onCancel,
  onSave,
  isSaving = false,
  modalTitle = 'userRoleManager.editModal.title',
  namespace = 'userRoleManager',
}) => {
  const { t } = useTranslation([namespace, 'common', 'roles', 'provinces', 'permissions']);
  const { isMobile, isTablet } = useResponsive();
  const { userProfile } = useAuth();
  const [editingUser, setEditingUser] = useState(null);
  const [activeTabKey, setActiveTabKey] = useState('role');

  // Filter available roles based on current user's role level
  const filteredRoles = useMemo(() => {
    if (!userProfile?.role || !availableRoles) return [];

    const currentUserLevel = ROLE_HIERARCHY[userProfile.role];
    return availableRoles.filter((role) => ROLE_HIERARCHY[role.value] >= currentUserLevel);
  }, [userProfile?.role, availableRoles]);

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

    // Always use canonical ROLE_PERMISSIONS for default permissions
    let defaultPermissions = [...(ROLE_PERMISSIONS[role] || [])];

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

    const defaultPermissions = [...(ROLE_PERMISSIONS[editingUser.selectedRole] || [])];
    setEditingUser({
      ...editingUser,
      selectedPermissions: defaultPermissions,
    });
  };

  console.log('filteredRoles', filteredRoles);

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
                // label={t(`editModal.roleLabel`, t(`${namespace}.editModal.roleLabel`, 'Role'))}
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
                  {filteredRoles.map((role) => (
                    <Option key={role.value} value={role.value}>
                      {t(`${role.value}.label`, { ns: 'roles' })}
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
                <Collapse accordion bordered={false}>
                  {Object.entries(PERMISSION_CATEGORIES).map(([catKey, permKeys]) => {
                    // Only count selected permissions that are in this category
                    const selectedCount = permKeys.filter((p) =>
                      editingUser.selectedPermissions.includes(p),
                    ).length;
                    const totalCount = permKeys.length;
                    const sectionLabel = (
                      <>
                        {t(catKey.toLowerCase(), {
                          ns: 'permissions',
                          defaultValue: catKey
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (c) => c.toUpperCase()),
                        })}
                        <span className="text-muted" style={{ marginLeft: 8, fontSize: 11 }}>
                          {t(`editModal.tabs.selectedCount`, {
                            selected: selectedCount,
                            total: totalCount,
                            ns: namespace,
                            defaultValue: `(เลือก ${selectedCount} จาก ${totalCount})`,
                          })}
                        </span>
                      </>
                    );
                    return (
                      <Collapse.Panel header={sectionLabel} key={catKey}>
                        <Checkbox.Group
                          style={{ width: '100%' }}
                          value={editingUser.selectedPermissions.filter((p) =>
                            permKeys.includes(p),
                          )}
                          onChange={(checkedList) => {
                            // Merge with other selected permissions from other groups
                            const otherPerms = editingUser.selectedPermissions.filter(
                              (p) => !permKeys.includes(p),
                            );
                            setEditingUser({
                              ...editingUser,
                              selectedPermissions: [...otherPerms, ...checkedList],
                            });
                          }}
                        >
                          <Row gutter={[8, 8]}>
                            {permKeys.map((permission) => (
                              <Col xs={24} sm={12} md={8} lg={8} key={permission}>
                                <Checkbox value={permission}>
                                  {translatePermission(permission)}
                                </Checkbox>
                              </Col>
                            ))}
                          </Row>
                        </Checkbox.Group>
                      </Collapse.Panel>
                    );
                  })}
                </Collapse>
              </Form.Item>
              <Button type="link" onClick={resetPermissionsToDefault} className="mt-2">
                {t('editModal.resetPermissions', 'Reset to Role Defaults')}
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
      okText={t('save', { ns: 'common' })}
      cancelText={t('cancel', { ns: 'common' })}
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
