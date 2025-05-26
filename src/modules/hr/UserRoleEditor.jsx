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

const UserRoleEditor = ({ visible, user, onCancel, onSave }) => {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const [form] = Form.useForm();
  const [selectedRole, setSelectedRole] = useState(user?.role || ROLES.USER);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        role: user.role,
        permissions: user.permissions || [],
      });
      setSelectedRole(user.role);
      setSelectedPermissions(user.permissions || []);
    }
  }, [user, form]);

  useEffect(() => {
    // Update available permissions based on selected role
    const rolePermissions = PERMISSIONS.filter(
      (permission) => getPrivilegeLevel(selectedRole) >= getPrivilegeLevel(permission.requiredRole),
    );
    setAvailablePermissions(rolePermissions);
  }, [selectedRole]);

  const handleRoleChange = (value) => {
    setSelectedRole(value);
    form.setFieldsValue({ permissions: [] });
    setSelectedPermissions([]);
  };

  const handlePermissionChange = (targetKeys) => {
    setSelectedPermissions(targetKeys);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const updatedUser = {
        ...user,
        role: values.role,
        permissions: values.permissions,
        updatedAt: new Date().toISOString(),
      };

      await onSave(updatedUser);
      onCancel();
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const permissionDataSource = availablePermissions.map((permission) => ({
    key: permission.id,
    title: t(`permissions.${permission.id}.label`),
    description: t(`permissions.${permission.id}.description`),
    disabled: false,
  }));

  return (
    <Modal
      title={t('users.roles.editTitle')}
      open={visible}
      onCancel={onCancel}
      width={isMobile ? '100%' : 800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {t('common.cancel')}
        </Button>,
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          loading={loading}
          onClick={handleSubmit}
        >
          {t('common.save')}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          role: user?.role || ROLES.USER,
          permissions: user?.permissions || [],
        }}
      >
        <Tabs defaultActiveKey="role">
          <TabPane tab={t('users.roles.tabs.role')} key="role">
            <Form.Item
              name="role"
              label={t('users.roles.roleLabel')}
              rules={[{ required: true, message: t('validation.required') }]}
            >
              <Select onChange={handleRoleChange}>
                {Object.entries(ROLES).map(([key, value]) => (
                  <Option key={key} value={value}>
                    {t(`roles.${value}.label`)}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Alert
              message={t('users.roles.warning')}
              description={t('users.roles.warningDescription')}
              type="warning"
              showIcon
              className={styles.alert}
            />
          </TabPane>

          <TabPane tab={t('users.roles.tabs.permissions')} key="permissions">
            <Form.Item
              name="permissions"
              label={t('users.roles.permissionsLabel')}
              rules={[{ required: true, message: t('validation.required') }]}
            >
              <Transfer
                dataSource={permissionDataSource}
                titles={[t('common.available'), t('common.selected')]}
                targetKeys={selectedPermissions}
                onChange={handlePermissionChange}
                render={(item) => (
                  <div className={styles.permissionItem}>
                    <Text strong>{item.title}</Text>
                    <Text type="secondary">{item.description}</Text>
                  </div>
                )}
                listStyle={{
                  width: isMobile ? '100%' : 300,
                  height: 400,
                }}
              />
            </Form.Item>
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

export default UserRoleEditor;
