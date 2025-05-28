import React, { useState, useMemo } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Alert,
} from 'antd';
import { useTranslation } from 'react-i18next';
import {
  SendOutlined,
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  EnvironmentOutlined,
  NotificationOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import './ComposeNotification.css';
import { notificationController } from '../../controllers/notificationController';
import { useNotification } from './ToastNotification';
import { useSelector } from 'react-redux';
import { ROLES } from '../../constants/roles';
import { useAuth } from 'contexts/AuthContext';
import PageDoc from 'components/PageDoc';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

/**
 * ComposeNotification Component
 * Allows administrators to create and send notifications to specific recipients
 */
const ComposeNotification = () => {
  const { t } = useTranslation(['notifications', 'common', 'roles']);
  const [form] = Form.useForm();
  const { showSuccess, showError, showWarning } = useNotification();
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();

  // Memoized selectors to prevent unnecessary re-renders
  const users = useSelector((state) => state.data?.users || {});
  const branches = useSelector((state) => state.data?.branches || {});
  const departments = useSelector((state) => state.data?.departments || {});
  const provinces = useSelector((state) => state.data?.provinces || {});

  // Memoized processed data
  const processedUsers = useMemo(() => {
    return Object.values(users).filter((user) => user && user.uid);
  }, [users]);

  const processedBranches = useMemo(() => {
    return Object.values(branches).filter((branch) => branch && branch.id);
  }, [branches]);

  const processedDepartments = useMemo(() => {
    return Object.values(departments).filter((dept) => dept && dept.id);
  }, [departments]);

  const processedProvinces = useMemo(() => {
    return Object.values(provinces).filter((province) => province && province.id);
  }, [provinces]);

  // Get available roles from constants
  const availableRoles = useMemo(() => {
    return Object.values(ROLES).filter((role) => role !== ROLES.GUEST && role !== ROLES.PENDING);
  }, []);

  // Calculate estimated recipient count
  const [estimatedRecipients, setEstimatedRecipients] = useState(0);

  const calculateRecipientCount = (values) => {
    let count = 0;

    // Count selected users
    if (values.users?.length) {
      count += values.users.length;
    }

    // Estimate users by role
    if (values.roles?.length) {
      const roleUsers = processedUsers.filter(
        (user) =>
          values.roles.includes(user.role) &&
          (!values.province || user.provinceId === values.province) &&
          (!values.branch || user.branch === values.branch) &&
          (!values.department || user.department === values.department),
      );
      count += roleUsers.length;
    }

    // Estimate users by branch
    if (values.branch && !values.roles?.length && !values.users?.length) {
      const branchUsers = processedUsers.filter(
        (user) =>
          user.branch === values.branch &&
          (!values.province || user.provinceId === values.province) &&
          (!values.department || user.department === values.department),
      );
      count += branchUsers.length;
    }

    // Estimate users by department
    if (values.department && !values.roles?.length && !values.users?.length && !values.branch) {
      const deptUsers = processedUsers.filter(
        (user) =>
          user.department === values.department &&
          (!values.province || user.provinceId === values.province),
      );
      count += deptUsers.length;
    }

    // Estimate users by province
    if (
      values.province &&
      !values.roles?.length &&
      !values.users?.length &&
      !values.branch &&
      !values.department
    ) {
      const provinceUsers = processedUsers.filter((user) => user.provinceId === values.province);
      count += provinceUsers.length;
    }

    return count;
  };

  // Watch form changes to update recipient count
  const handleFormValuesChange = (changedValues, allValues) => {
    const count = calculateRecipientCount(allValues);
    setEstimatedRecipients(count);
  };

  const validateRecipients = (values) => {
    // Check if at least one recipient type is selected
    const hasRecipients =
      values.roles?.length ||
      values.users?.length ||
      values.branch ||
      values.department ||
      values.province;

    if (!hasRecipients) {
      throw new Error(t('compose.form.selectRecipientsRequired'));
    }

    // Warn if no estimated recipients
    if (estimatedRecipients === 0) {
      showWarning(t('compose.form.noRecipients'), t('compose.form.noRecipientsDesc'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (values) => {
    try {
      // Validate recipients before sending
      if (!validateRecipients(values)) {
        return;
      }

      setLoading(true);

      // Build notification payload with province context
      const notification = {
        title: values.title,
        description: values.message,
        type: values.type,
        targetRoles: values.roles?.length ? values.roles : undefined,
        targetBranch: values.branch || undefined,
        targetDepartment: values.department || undefined,
        provinceId: values.province || userProfile?.provinceId || undefined,
        targetUserId: values.users?.length ? values.users : undefined,
        link: values.link || undefined,
        priority: values.priority || 'normal',
      };

      const options = {
        sendPush: values.delivery?.includes('push') || false,
        userIds: values.users?.length ? values.users : undefined,
      };

      const result = await notificationController.sendNotification(notification, options);

      if (result.success) {
        showSuccess(
          t('compose.form.sendSuccess'),
          t('compose.form.sendSuccessDesc', { count: estimatedRecipients }),
        );
        form.resetFields();
        setEstimatedRecipients(0);
      } else {
        showError(t('compose.form.sendError'), t('compose.form.sendErrorDesc'));
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      showError(t('compose.form.sendError'), error.message || t('compose.form.sendErrorDesc'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="compose-notification">
      <Card>
        <Title level={3} className="compose-notification-title">
          <NotificationOutlined style={{ marginRight: '0.5rem' }} />
          {t('compose.title')}
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleFormValuesChange}
          initialValues={{
            type: 'info',
            delivery: ['inApp'],
            priority: 'normal',
          }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                name="type"
                label={t('compose.form.type')}
                rules={[{ required: true, message: t('compose.form.typeRequired') }]}
                tooltip={t('compose.form.typeTooltip')}
              >
                <Select aria-label={t('compose.form.type')} data-testid="notification-type-select">
                  <Option value="info">{t('types.info')}</Option>
                  <Option value="success">{t('types.success')}</Option>
                  <Option value="warning">{t('types.warning')}</Option>
                  <Option value="error">{t('types.error')}</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="priority"
                label={t('compose.form.priority')}
                tooltip={t('compose.form.priorityTooltip')}
              >
                <Select
                  aria-label={t('compose.form.priority')}
                  data-testid="notification-priority-select"
                >
                  <Option value="low">{t('priority.low')}</Option>
                  <Option value="normal">{t('priority.normal')}</Option>
                  <Option value="high">{t('priority.high')}</Option>
                  <Option value="urgent">{t('priority.urgent')}</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="delivery"
                label={t('compose.form.deliveryOptions')}
                tooltip={t('compose.form.deliveryOptionsTooltip')}
                rules={[
                  {
                    required: true,
                    message: t('compose.form.deliveryOptionsRequired'),
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  aria-label={t('compose.form.deliveryOptions')}
                  data-testid="delivery-options-select"
                >
                  <Option value="inApp">{t('compose.form.inAppOnly')}</Option>
                  <Option value="push">{t('compose.form.sendPush')}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="title"
            label={t('compose.form.title')}
            rules={[
              { required: true, message: t('compose.form.titleRequired') },
              { max: 100, message: t('compose.form.titleMaxLength') },
            ]}
            tooltip={t('compose.form.titleTooltip')}
          >
            <Input
              aria-label={t('compose.form.title')}
              placeholder={t('compose.form.titlePlaceholder')}
              data-testid="notification-title-input"
              showCount
              maxLength={100}
            />
          </Form.Item>

          <Form.Item
            name="message"
            label={t('compose.form.message')}
            rules={[
              { required: true, message: t('compose.form.messageRequired') },
              { max: 500, message: t('compose.form.messageMaxLength') },
            ]}
            tooltip={t('compose.form.messageTooltip')}
          >
            <TextArea
              rows={4}
              aria-label={t('compose.form.message')}
              placeholder={t('compose.form.messagePlaceholder')}
              data-testid="notification-message-input"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Divider orientation="left">
            <TeamOutlined style={{ marginRight: '0.5rem' }} />
            {t('compose.form.recipients')}
          </Divider>

          {/* Recipient Count Alert */}
          {estimatedRecipients > 0 && (
            <Alert
              message={t('compose.form.estimatedRecipients', { count: estimatedRecipients })}
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              style={{ marginBottom: 16 }}
            />
          )}

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="roles"
                label={
                  <span>
                    <UserOutlined style={{ marginRight: '0.5rem' }} />
                    {t('compose.form.selectRoles')}
                  </span>
                }
                tooltip={t('compose.form.selectRolesTooltip')}
              >
                <Select
                  mode="multiple"
                  allowClear
                  placeholder={t('compose.form.selectRolesPlaceholder')}
                  aria-label={t('compose.form.selectRoles')}
                  data-testid="roles-select"
                >
                  {availableRoles.map((role) => (
                    <Option key={role} value={role}>
                      {t(`${role.toLowerCase()}.label`, { ns: 'roles', defaultValue: role })}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="users"
                label={
                  <span>
                    <TeamOutlined style={{ marginRight: '0.5rem' }} />
                    {t('compose.form.specificUsers')}
                  </span>
                }
                tooltip={t('compose.form.selectUsersTooltip')}
              >
                <Select
                  mode="multiple"
                  allowClear
                  placeholder={t('compose.form.selectUsersPlaceholder')}
                  aria-label={t('compose.form.specificUsers')}
                  data-testid="users-select"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {processedUsers.map((user) => (
                    <Option key={user.uid} value={user.uid}>
                      {user.displayName ||
                        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                        user.email}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                name="branch"
                label={
                  <span>
                    <BankOutlined style={{ marginRight: '0.5rem' }} />
                    {t('compose.form.selectBranch')}
                  </span>
                }
                tooltip={t('compose.form.selectBranchTooltip')}
              >
                <Select
                  allowClear
                  placeholder={t('compose.form.selectBranchPlaceholder')}
                  aria-label={t('compose.form.selectBranch')}
                  data-testid="branch-select"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {processedBranches.map((branch) => (
                    <Option key={branch.id} value={branch.id}>
                      {branch.name || branch.branchName || branch.id}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="department"
                label={
                  <span>
                    <TeamOutlined style={{ marginRight: '0.5rem' }} />
                    {t('compose.form.selectDepartment')}
                  </span>
                }
                tooltip={t('compose.form.selectDepartmentTooltip')}
              >
                <Select
                  allowClear
                  placeholder={t('compose.form.selectDepartmentPlaceholder')}
                  aria-label={t('compose.form.selectDepartment')}
                  data-testid="department-select"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {processedDepartments.map((dept) => (
                    <Option key={dept.id} value={dept.id}>
                      {dept.name || dept.departmentName || dept.id}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="province"
                label={
                  <span>
                    <EnvironmentOutlined style={{ marginRight: '0.5rem' }} />
                    {t('compose.form.selectProvince')}
                  </span>
                }
                tooltip={t('compose.form.selectProvinceTooltip')}
              >
                <Select
                  allowClear
                  placeholder={t('compose.form.selectProvincePlaceholder')}
                  aria-label={t('compose.form.selectProvince')}
                  data-testid="province-select"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {processedProvinces.map((province) => (
                    <Option key={province.id} value={province.id}>
                      {province.name || province.provinceName || province.id}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="link" label={t('compose.form.link')}>
            <Input
              placeholder={t('compose.form.linkPlaceholder')}
              aria-label={t('compose.form.link')}
              data-testid="notification-link-input"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SendOutlined />}
                aria-label={t('compose.form.sendNotification')}
                data-testid="compose-send-btn"
              >
                {t('compose.form.sendNotification')}
              </Button>
              <Button
                onClick={() => form.resetFields()}
                icon={<ReloadOutlined />}
                aria-label={t('reset', { ns: 'common' })}
                data-testid="compose-reset-btn"
              >
                {t('reset', { ns: 'common' })}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
      <PageDoc />
    </div>
  );
};

export default ComposeNotification;
