import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button, Tabs, Form, Select, Transfer, Alert, Tag } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { RoleType, ROLES, ROLE_PERMISSIONS, isInRoleCategory, RoleCategory } from '../../constants/roles';
import { PERMISSIONS } from '../../constants/permissions';
import { Province } from '../../types/province';
import { getPrivilegeLevel } from '../../utils/roleUtils';

const { Option } = Select;
const { TabPane } = Tabs;

export interface EditableUser {
  uid: string;
  displayName?: string;
  email?: string;
  role: RoleType;
  selectedRole: RoleType;
  selectedPermissions: string[];
  selectedProvinceIds: string[];
  type?: 'Employee' | 'Visitor';
  branchId?: string;
  departmentId?: string;
  provinceId?: string;
}

interface UserRoleEditorProps {
  visible: boolean;
  user: EditableUser | null;
  availableRoles: Array<{ value: string; label: string; description: string }>;
  availableProvinces: Province[];
  rolePermissions: Record<string, string[]>;
  onCancel: () => void;
  onSave: (user: EditableUser) => void;
  isSaving?: boolean;
  allPermissions: Array<{ key: string; title: string }>;
  modalTitle?: string;
  showAllTabs?: boolean;
  namespace?: string;
}

/**
 * A reusable component for editing user roles, permissions, and provinces
 */
const UserRoleEditor: React.FC<UserRoleEditorProps> = ({
  visible,
  user,
  availableRoles,
  availableProvinces,
  rolePermissions,
  onCancel,
  onSave,
  isSaving = false,
  allPermissions,
  modalTitle = 'userRoleManager.editModal.title',
  showAllTabs = true,
  namespace = 'userRoleManager'
}) => {
  const { t } = useTranslation([
    namespace,
    'common',
    'roles',
    'provinces',
    'permissions',
  ]);
  const [editingUser, setEditingUser] = useState<EditableUser | null>(null);
  const [activeTabKey, setActiveTabKey] = useState<string>('role');

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
  const handleRoleChange = (role: RoleType) => {
    if (!editingUser) return;
    console.log('role', role);
    console.log('editingUser', editingUser);
    // When role changes, reset permissions to the role's default permissions
    const defaultPermissions = rolePermissions[role] || [];

    // Set default selectedProvinceIds based on role privilege level
    const defaultProvinceIds = getPrivilegeLevel(role) >= getPrivilegeLevel(ROLES.GENERAL_MANAGER)
      ? availableProvinces.filter(province => province.isActive !== false).map(province => province.id)
      : editingUser.provinceId ? [editingUser.provinceId] : [];

    setEditingUser({
      ...editingUser,
      selectedRole: role,
      selectedPermissions: defaultPermissions,
      selectedProvinceIds: defaultProvinceIds
    });
  };

  // Handle permission change in the Transfer component
  const handlePermissionChange = (targetKeys: React.Key[]) => {
    if (!editingUser) return;

    setEditingUser({
      ...editingUser,
      selectedPermissions: targetKeys as string[]
    });
  };

  // Translate a permission key to its display name
  const translatePermission = (permission: string): string => {
    try {
      if (typeof permission !== "string") {
        console.error("Invalid permission format:", permission);
        return "Unknown Permission";
      }
      // Convert from DATA_VIEW format to data_view format
      const permKey = permission.replace(/^PERMISSIONS\./, "").toLowerCase();
      // Try using the key with explicit permissions namespace and empty defaultValue
      const translated = t(permKey, { ns: "permissions", defaultValue: "" });
      if (translated) return translated;
      // Fallback: humanize the permission key (e.g., DATA_VIEW -> Data View)
      return permKey.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    } catch (error) {
      console.error("Error translating permission:", permission, error);
      return String(permission);
    }
  };

  // Handle province selection
  const handleProvinceChange = (provinceIds: string[]) => {
    if (!editingUser) return;

    setEditingUser({
      ...editingUser,
      selectedProvinceIds: provinceIds
    });
  };

  // Handle save
  const handleSave = () => {
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
      selectedPermissions: [...defaultPermissions]
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
          <div className='p-4 w-full overflow-x-hidden'>
            <h3 className='text-lg mb-4'>{t(`editModal.roleTitle`, t(`${namespace}.editModal.roleTitle`, 'Select User Role'))}</h3>
            <Form layout='vertical'>
              <Form.Item
                label={t(`editModal.roleLabel`, t(`${namespace}.editModal.roleLabel`, 'Role'))}
                extra={t(`editModal.roleDescription`, t(`${namespace}.editModal.roleDescription`, 'Assign a role to control user access'))}
              >
                <Select
                  value={editingUser.selectedRole}
                  onChange={value => handleRoleChange(value as RoleType)}
                  style={{ width: '100%' }}
                >
                  {availableRoles.map(role => (
                    <Option key={role.value} value={role.value}>
                      {t(`${role.value.toLowerCase()}.label`, { ns: 'roles' })}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
            <Alert
              message={t(`editModal.roleInfo`, t(`${namespace}.editModal.roleInfo`, 'Role Information'))}
              description={t(`${editingUser.selectedRole.toLowerCase()}.description`, { ns: 'roles' })}
              type='info'
              showIcon
              className='mb-4'
            />
          </div>
        )
      },
      {
        key: 'permissions',
        label: t(`editModal.tabs.permissions`),
        // label: t(`editModal.tabs.permissions`),
        children: (
          <div className='p-4 w-full overflow-x-hidden'>
            <h3 className='text-lg mb-4'>
              {t(`editModal.permissionsTitle`)}
            </h3>
            <p className='mb-4'>
              {t(`editModal.permissionsDescription`)}
            </p>
            <Transfer
              dataSource={allPermissions
                .filter(l => l.key !== 'USER_INVITE')
                .map(item => ({
                  ...item,
                  title: translatePermission(item.key)
                }))}
              titles={[
                t(`editModal.availablePermissions`),
                t(`editModal.assignedPermissions`)
              ]}
              operations={[
                t(`editModal.moveButtons.toRight`),
                t(`editModal.moveButtons.toLeft`)
              ]}
              targetKeys={editingUser.selectedPermissions}
              onChange={handlePermissionChange}
              render={item => item.title}
              listStyle={{
                width: '100%',
                height: 300
              }}
              showSearch
              filterOption={(inputValue, option) => 
                option.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1}
              className='bg-white dark:bg-gray-800'
              locale={{
                itemUnit: t('item', { ns: 'common', defaultValue: 'รายการ' }),
                itemsUnit: t('items', { ns: 'common', defaultValue: 'รายการ' }),
                searchPlaceholder: t('searchPlaceholder', { ns: 'common', defaultValue: 'ค้นหาที่นี่' }),
                notFoundContent: t('notFoundContent', { ns: 'common', defaultValue: 'ไม่พบข้อมูล' })
              }}
            />

            <div className='mt-4'>
              <Button onClick={resetPermissionsToDefault} type='default'>
                {t(`editModal.resetPermissions`)}
              </Button>
            </div>
          </div>
        )
      },
      {
        key: 'provinces',
        label: t(`editModal.tabs.provinces`),
        children: (
          <div className='p-4 w-full overflow-x-hidden'>
            <h3 className='text-lg mb-4'>
              {t(`editModal.provincesTitle`)}
            </h3>
            <p className='mb-4'>
              {t(`editModal.provincesDescription`)}
            </p>

            <Form layout='vertical'>
              <Form.Item
                label={t(`editModal.selectProvinces`)}
                extra={t(`editModal.provincesExtra`)}
              >
                <Select
                  mode="multiple"
                  value={editingUser.selectedProvinceIds}
                  onChange={handleProvinceChange}
                  style={{ width: '100%' }}
                  placeholder={t(`editModal.selectProvincesPlaceholder`)}
                  disabled={(user?.role && getPrivilegeLevel(user?.role) <= getPrivilegeLevel(ROLES.GENERAL_MANAGER))}
                  className="province-select"
                  optionFilterProp="children"
                  showSearch
                >
                  {availableProvinces
                    .filter(province => province.isActive !== false)
                    .map(province => (
                      <Option key={province.id} value={province.id}>
                        {province.name} {province.code ? `(${province.code})` : ''}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Form>

            {editingUser.selectedProvinceIds.length === 0 && (
              <Alert
                message={t(`editModal.noProvincesWarning`)}
                type='warning'
                showIcon
                className='mb-4'
              />
            )}

            {isInRoleCategory(editingUser.selectedRole, RoleCategory.GENERAL_MANAGER) && (
              <Alert
                message={t(`editModal.autoProvinceAccess`)}
                description={t(`editModal.autoProvinceAccessDescription`)}
                type='success'
                showIcon
                className='mt-4'
              />
            )}

            {editingUser.type === 'Employee' && editingUser.provinceId && (
              <div className='mt-4 bg-blue-50 p-3 rounded border border-blue-200 dark:bg-blue-900 dark:border-blue-800'>
                <p className='text-blue-700 dark:text-blue-200'>
                  {t(`${keyPrefix}.employeeProvinceWarning`, {
                    provinceName: availableProvinces.find(p => p.id === editingUser.provinceId)?.name || editingUser.provinceId
                  })}
                </p>
              </div>
            )}
          </div>
        )
      }
    ];

    if (showAllTabs) {
      items.push({
        key: 'summary',
        label: t(`editModal.tabs.summary`, t(`${namespace}.editModal.tabs.summary`, 'Summary')),
        children: (
          <div className='p-4 w-full overflow-x-hidden'>
            <h3 className='text-lg mb-4'>
              {t(`editModal.summaryTitle`, t(`${namespace}.editModal.summaryTitle`, 'User Access Summary'))}
            </h3>

            <div className='mb-4'>
              <h4 className='font-medium mb-2'>{t(`editModal.selectedRole`, t(`${namespace}.editModal.selectedRole`, 'Selected Role'))}:</h4>
              <Tag>{t(`${editingUser.selectedRole.toLowerCase()}.label`, { ns: 'roles' })}</Tag>
            </div>
            <div className='mb-4'>
              <h4 className='font-medium mb-2'>{t(`editModal.selectedPermissions`, t(`${namespace}.editModal.selectedPermissions`, 'Selected Permissions'))}:</h4>
              <div>
                {editingUser.selectedPermissions.map(permission => (
                  <Tag key={permission}>{translatePermission(permission)}</Tag>
                ))}
              </div>
            </div>
            <div className='mb-4'>
              <h4 className='font-medium mb-2'>{t(`editModal.selectedProvinces`, t(`${namespace}.editModal.selectedProvinces`, 'Selected Provinces'))}:</h4>
              <div>
                {editingUser.selectedProvinceIds.map(provinceId => (
                  <Tag key={provinceId}>{availableProvinces.find(p => p.id === provinceId)?.name || provinceId}</Tag>
                ))}
              </div>
            </div>
          </div>
        )
      });
    }

    return items;
  };

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      onOk={handleSave}
      title={t(modalTitle)}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {t(`${namespace}.editModal.cancelButton`, 'Cancel')}
        </Button>,
        <Button key="save" type="primary" loading={isSaving} onClick={handleSave}>
          {t(`${namespace}.editModal.saveButton`, 'Save')}
        </Button>
      ]}
      style={{minWidth: '600px'}}
    >
      <Tabs
        activeKey={activeTabKey}
        onChange={(key) => setActiveTabKey(key)}
        items={getTabItems()}
        className="w-full"
        style={{ maxWidth: '100%' }}
      />
    </Modal>
  );
};

export default UserRoleEditor;