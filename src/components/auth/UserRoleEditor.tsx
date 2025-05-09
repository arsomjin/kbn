import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button, Tabs, Form, Select, Transfer, Alert, Tag } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { RoleType, ROLES, ROLE_PERMISSIONS } from '../../constants/roles';
import { PERMISSIONS } from '../../constants/Permissions';

const { Option } = Select;
const { TabPane } = Tabs;

export interface Province {
  id: string;
  name: string;
  code?: string;
  isActive?: boolean;
}

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
  showAllTabs = true
}) => {
  const { t } = useTranslation();
  const [editingUser, setEditingUser] = useState<EditableUser | null>(null);
  const [activeTabKey, setActiveTabKey] = useState<string>('role');

  // Derive translation key prefix from modalTitle prop
  const getKeyPrefix = () => {
    // Extract prefix from modalTitle (e.g., "userReview.editModal.title" -> "userReview.editModal")
    const parts = modalTitle.split('.');
    if (parts.length >= 2) {
      return `${parts[0]}.${parts[1]}`; // Get the first two parts as prefix
    }
    return 'userRoleManager.editModal'; // Default prefix
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

    // When role changes, reset permissions to the role's default permissions
    const defaultPermissions = rolePermissions[role] || [];

    setEditingUser({
      ...editingUser,
      selectedRole: role,
      selectedPermissions: defaultPermissions
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
      // Handle the case where permission might not be a string
      if (typeof permission !== 'string') {
        console.error('Invalid permission format:', permission);
        return 'Unknown Permission';
      }

      // Strip any "PERMISSIONS." prefix and convert to lowercase
      const permKey = permission.toLowerCase().replace(/^permissions\./, '');

      // First try using direct translation key
      const translationKey = `permissions.${permKey}`;
      const translated = t(translationKey);

      // Ensure we're returning a string (not an object)
      if (typeof translated === 'string') {
        return translated;
      } else {
        console.warn(`Translation for '${translationKey}' returned non-string: `, translated);
        // Fall back to permission key itself (formatted for display)
        return permKey.replace(/_/g, ' ');
      }
    } catch (error) {
      console.error('Error translating permission:', permission, error);
      return String(permission); // Ensure we return a string
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
        label: t(`${keyPrefix}.tabs.role`, t('userRoleManager.editModal.tabs.role')),
        children: (
          <div className='p-4'>
            <h3 className='text-lg mb-4'>{t(`${keyPrefix}.roleTitle`, t('userRoleManager.editModal.roleTitle'))}</h3>
            <Form layout='vertical'>
              <Form.Item
                label={t(`${keyPrefix}.roleLabel`, t('userRoleManager.editModal.roleLabel'))}
                extra={t(`${keyPrefix}.roleDescription`, t('userRoleManager.editModal.roleDescription'))}
              >
                <Select
                  value={editingUser.selectedRole}
                  onChange={value => handleRoleChange(value as RoleType)}
                  style={{ width: '100%' }}
                >
                  {availableRoles.map(role => (
                    <Option key={role.value} value={role.value}>
                      {t(role.label)} - {t(role.description)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
            <Alert
              message={t(`${keyPrefix}.roleInfo`, t('userRoleManager.editModal.roleInfo'))}
              description={t(
                `${keyPrefix}.roleInfoDescription`,
                t('userRoleManager.editModal.roleInfoDescription', {
                  role: t(`roles.${editingUser.selectedRole.toLowerCase()}`)
                })
              )}
              type='info'
              showIcon
              className='mb-4'
            />
          </div>
        )
      },
      {
        key: 'permissions',
        label: t(`${keyPrefix}.tabs.permissions`, t('userRoleManager.editModal.tabs.permissions')),
        children: (
          <div className='p-4'>
            <h3 className='text-lg mb-4'>
              {t(`${keyPrefix}.permissionsTitle`, t('userRoleManager.editModal.permissionsTitle'))}
            </h3>
            <p className='mb-4'>
              {t(`${keyPrefix}.permissionsDescription`, t('userRoleManager.editModal.permissionsDescription'))}
            </p>

            <Transfer
              dataSource={allPermissions
                .filter(l => l.key !== 'USER_INVITE')
                .map(item => ({
                  ...item,
                  // Translate the permission title for display
                  title: translatePermission(item.key)
                }))}
              titles={[
                t(`${keyPrefix}.availablePermissions`, t('userRoleManager.editModal.availablePermissions')),
                t(`${keyPrefix}.assignedPermissions`, t('userRoleManager.editModal.assignedPermissions'))
              ]}
              targetKeys={editingUser.selectedPermissions}
              onChange={handlePermissionChange}
              render={item => item.title}
              listStyle={{
                width: '100%',
                height: 300
              }}
              showSearch
              filterOption={(inputValue, option) => option.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1}
            />

            <div className='mt-4'>
              <Button onClick={resetPermissionsToDefault}>
                {t(`${keyPrefix}.resetPermissions`, t('userRoleManager.editModal.resetPermissions'))}
              </Button>
            </div>
          </div>
        )
      },
      {
        key: 'provinces',
        label: t(`${keyPrefix}.tabs.provinces`, t('userRoleManager.editModal.tabs.provinces')),
        children: (
          <div className='p-4'>
            <h3 className='text-lg mb-4'>
              {t(`${keyPrefix}.provincesTitle`, t('userRoleManager.editModal.provincesTitle'))}
            </h3>
            <p className='mb-4'>
              {t(`${keyPrefix}.provincesDescription`, t('userRoleManager.editModal.provincesDescription'))}
            </p>

            <Form layout='vertical'>
              <Form.Item
                label={t(`${keyPrefix}.selectProvinces`, t('userRoleManager.editModal.selectProvinces'))}
                extra={t(`${keyPrefix}.provincesExtra`, t('userRoleManager.editModal.provincesExtra'))}
              >
                <Select
                  mode='multiple'
                  placeholder={t(
                    `${keyPrefix}.selectProvincesPlaceholder`,
                    t('userRoleManager.editModal.selectProvincesPlaceholder')
                  )}
                  value={editingUser.selectedProvinceIds}
                  onChange={handleProvinceChange}
                  style={{ width: '100%' }}
                >
                  {availableProvinces.map(province => (
                    <Option key={province.id} value={province.id}>
                      {province.name} {province.code ? `(${province.code})` : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>

            {editingUser.selectedProvinceIds.length === 0 && (
              <Alert
                message={t(`${keyPrefix}.noProvincesWarning`, t('userRoleManager.editModal.noProvincesWarning'))}
                type='warning'
                showIcon
                className='mb-4'
              />
            )}

            {/* Auto province access for high-level roles */}
            {(editingUser.selectedRole === ROLES.PROVINCE_ADMIN ||
              editingUser.selectedRole === ROLES.SUPER_ADMIN ||
              editingUser.selectedRole === ROLES.PRIVILEGE) && (
              <Alert
                message={t(`${keyPrefix}.autoProvinceAccess`, t('userRoleManager.editModal.autoProvinceAccess'))}
                description={t(
                  `${keyPrefix}.autoProvinceAccessDescription`,
                  t('userRoleManager.editModal.autoProvinceAccessDescription')
                )}
                type='success'
                showIcon
              />
            )}

            {editingUser.type === 'Employee' && editingUser.provinceId && (
              <div className='mt-4 bg-blue-50 p-3 rounded border border-blue-200'>
                <p className='text-blue-700'>
                  {t(
                    `${keyPrefix}.employeeProvinceNote`,
                    t('userRoleManager.editModal.employeeProvinceNote', {
                      province:
                        availableProvinces.find(p => p.id === editingUser.provinceId)?.name || editingUser.provinceId
                    })
                  )}
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
        label: t(`${keyPrefix}.tabs.summary`, t('userRoleManager.editModal.tabs.summary')),
        children: (
          <div className='p-4'>
            <h3 className='text-lg mb-4'>
              {t(`${keyPrefix}.summaryTitle`, t('userRoleManager.editModal.summaryTitle'))}
            </h3>

            <div className='mb-4'>
              <h4 className='font-bold mb-2'>{t(`${keyPrefix}.columns.name`, t('userRoleManager.columns.name'))}:</h4>
              <p>
                {editingUser.displayName ||
                  editingUser.email ||
                  t(`${keyPrefix}.unnamed`, t('userRoleManager.unnamed'))}
              </p>
            </div>

            <div className='mb-4'>
              <h4 className='font-bold mb-2'>{t(`${keyPrefix}.columns.email`, t('userRoleManager.columns.email'))}:</h4>
              <p>{editingUser.email}</p>
            </div>

            <div className='mb-4'>
              <h4 className='font-bold mb-2'>{t('userRoleManager.columns.provinces', 'จังหวัด')}:</h4>
              {editingUser.selectedProvinceIds.length > 0 ? (
                <div className='flex flex-wrap gap-1'>
                  {editingUser.selectedProvinceIds.map(provinceId => {
                    const province = availableProvinces.find(p => p.id === provinceId);
                    return (
                      <Tag key={provinceId} color='blue'>
                        {province?.name || provinceId}
                      </Tag>
                    );
                  })}
                </div>
              ) : (
                <p className='text-red-500'>{t('userRoleManager.noProvince', 'ไม่มีจังหวัด')}</p>
              )}
            </div>

            <div className='mb-4'>
              <h4 className='font-bold mb-2'>
                {t(`${keyPrefix}.columns.permissions`, t('userRoleManager.columns.permissions'))}:
              </h4>
              <p>
                {editingUser.selectedPermissions.length} {t('userRoleManager.columns.permissions', 'สิทธิ์')}
              </p>
              <div className='bg-light p-2 mt-2 rounded border max-h-40 overflow-y-auto'>
                {editingUser.selectedPermissions.length > 0 ? (
                  editingUser.selectedPermissions.map(permission => (
                    <Tag key={permission} className='my-1 mr-1'>
                      {translatePermission(permission)}
                    </Tag>
                  ))
                ) : (
                  <span>{t(`${keyPrefix}.noPermissions`, t('userRoleManager.noPermissions'))}</span>
                )}
              </div>
            </div>

            {editingUser.type && (
              <div className='mt-4 bg-gray-50 p-3 rounded border'>
                <p>
                  <strong>{t(`${keyPrefix}.userType`, t('userRoleManager.editModal.userType'))}:</strong>{' '}
                  {editingUser.type}
                </p>
                {editingUser.branchId && (
                  <p>
                    <strong>{t(`${keyPrefix}.branch`, t('userRoleManager.editModal.branch'))}:</strong>{' '}
                    {editingUser.branchId}
                  </p>
                )}
                {editingUser.departmentId && (
                  <p>
                    <strong>{t(`${keyPrefix}.department`, t('userRoleManager.editModal.department'))}:</strong>{' '}
                    {editingUser.departmentId}
                  </p>
                )}
              </div>
            )}

            <Alert
              message={t(`${keyPrefix}.confirmChanges`, t('userRoleManager.editModal.confirmChanges'))}
              type='warning'
              showIcon
              className='mt-4'
            />
          </div>
        )
      });
    }

    return items;
  };

  // Render the component
  return (
    <Modal
      title={t(modalTitle, {
        user: editingUser?.displayName || editingUser?.email || ''
      })}
      open={visible && !!editingUser}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key='cancel' onClick={onCancel}>
          {t('common.cancel')}
        </Button>,
        <Button key='save' type='primary' icon={<SaveOutlined />} onClick={handleSave} loading={isSaving}>
          {t('common.save')}
        </Button>
      ]}
    >
      {editingUser && <Tabs activeKey={activeTabKey} onChange={setActiveTabKey} items={getTabItems()} />}
    </Modal>
  );
};

export default UserRoleEditor;
