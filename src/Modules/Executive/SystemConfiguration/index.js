/**
 * 🏛️ EXECUTIVE SYSTEM CONFIGURATION
 * Strategic system management for provinces, branches, and enterprise settings
 * For C-level executives and system administrators
 */

import React, { useState, useEffect } from 'react';
import { useNamespacedTranslation } from 'translations/i18n-fixed';
import LanguageSwitcher from 'components/LanguageSwitcher';
import {
  getProvinceName,
  getBranchName,
  PROVINCE_MAPPINGS,
  BRANCH_MAPPINGS,
} from 'utils/mappings';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Select,
  Switch,
  Table,
  Modal,
  message,
  Space,
  Typography,
  Divider,
  Alert,
  Tag,
  Tabs,
  Statistic,
  Progress,
} from 'antd';
import {
  GlobalOutlined,
  BankOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ShieldOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import LayoutWithRBAC from 'components/layout/LayoutWithRBAC';
import ScreenWithManual from 'components/ScreenWithManual';
import { usePermissions } from 'hooks/usePermissions';
import { useResponsive } from 'hooks/useResponsive';
import { app } from '../../../firebase';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const SystemConfiguration = () => {
  const { t } = useNamespacedTranslation('executive');
  const { isMobile } = useResponsive();
  const { hasPermission } = usePermissions();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [branches, setBranches] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('provinces');

  // Sample data - replace with actual Firebase data
  const [systemMetrics] = useState({
    totalProvinces: 2,
    totalBranches: 6,
    activeUsers: 45,
    systemHealth: 98,
  });

  useEffect(() => {
    fetchProvinces();
    fetchBranches();
  }, []);

  const fetchProvinces = async () => {
    try {
      setLoading(true);
      // Replace with actual Firebase query - using mappings for consistent names
      const sampleProvinces = [
        {
          id: 'nakhon-ratchasima',
          name: getProvinceName('nakhon-ratchasima'),
          nameEn: 'Nakhon Ratchasima',
          code: 'NMA',
          region: 'Northeast',
          isActive: true,
          branchCount: 3,
          createdAt: '2024-01-01',
        },
        {
          id: 'nakhon-sawan',
          name: getProvinceName('nakhon-sawan'),
          nameEn: 'Nakhon Sawan',
          code: 'NSN',
          region: 'Central',
          isActive: true,
          branchCount: 3,
          createdAt: '2024-06-01',
        },
      ];
      setProvinces(sampleProvinces);
    } catch (error) {
      message.error(t('systemConfiguration.messages.fetchProvincesError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      // Replace with actual Firebase query - using mappings for consistent names
      const sampleBranches = [
        {
          id: '0450',
          name: getBranchName('0450'),
          nameEn: 'Main Branch Nakhon Ratchasima',
          code: '0450',
          provinceId: 'nakhon-ratchasima',
          address: '123 ถนนมิตรภาพ นครราชสีมา',
          phone: '044-123-456',
          isActive: true,
          userCount: 15,
        },
        {
          id: 'NMA002',
          name: getBranchName('NMA002'),
          nameEn: 'Pak Chong Branch',
          code: 'NMA002',
          provinceId: 'nakhon-ratchasima',
          address: '456 ถนนเทศบาล ปากช่อง',
          phone: '044-789-012',
          isActive: true,
          userCount: 8,
        },
        {
          id: 'NSN001',
          name: getBranchName('NSN001'),
          nameEn: 'Takli Branch',
          code: 'NSN001',
          provinceId: 'nakhon-sawan',
          address: '789 ถนนเอเชีย นครสวรรค์',
          phone: '056-123-456',
          isActive: true,
          userCount: 12,
        },
      ];
      setBranches(sampleBranches);
    } catch (error) {
      message.error(t('systemConfiguration.messages.fetchBranchesError'));
    }
  };

  const handleSaveProvince = async (values) => {
    try {
      setLoading(true);
      // Replace with actual Firebase save
      console.log('Saving province:', values);
      message.success(t('systemConfiguration.messages.provinceSaved'));
      setModalVisible(false);
      fetchProvinces();
    } catch (error) {
      message.error(t('systemConfiguration.messages.saveProvinceError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBranch = async (values) => {
    try {
      setLoading(true);
      // Replace with actual Firebase save
      console.log('Saving branch:', values);
      message.success(t('systemConfiguration.messages.branchSaved'));
      setModalVisible(false);
      fetchBranches();
    } catch (error) {
      message.error(t('systemConfiguration.messages.saveBranchError'));
    } finally {
      setLoading(false);
    }
  };

  const provinceColumns = [
    {
      title: t('systemConfiguration.provinces.columns.provinceName'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction='vertical' size='small'>
          <Text strong>{text}</Text>
          <Text type='secondary' style={{ fontSize: '12px' }}>
            {record.nameEn} ({record.code})
          </Text>
        </Space>
      ),
    },
    {
      title: t('systemConfiguration.provinces.columns.region'),
      dataIndex: 'region',
      key: 'region',
      render: (text) => (
        <Tag color='blue'>
          {t(`systemConfiguration.provinces.regions.${text.toLowerCase()}`)}
        </Tag>
      ),
    },
    {
      title: t('systemConfiguration.provinces.columns.branches'),
      dataIndex: 'branchCount',
      key: 'branchCount',
      render: (count) => (
        <Space>
          <BankOutlined />
          <Text>
            {count} {t('systemConfiguration.stats.branchesCount')}
          </Text>
        </Space>
      ),
    },
    {
      title: t('systemConfiguration.provinces.columns.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive
            ? t('systemConfiguration.status.active')
            : t('systemConfiguration.status.inactive')}
        </Tag>
      ),
    },
    {
      title: t('systemConfiguration.provinces.columns.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size='small'
            onClick={() => {
              setEditingItem(record);
              setModalVisible(true);
            }}
          >
            {t('systemConfiguration.provinces.editButton')}
          </Button>
        </Space>
      ),
    },
  ];

  const branchColumns = [
    {
      title: t('systemConfiguration.branches.columns.branchName'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction='vertical' size='small'>
          <Text strong>{text}</Text>
          <Text type='secondary' style={{ fontSize: '12px' }}>
            {record.nameEn} ({record.code})
          </Text>
        </Space>
      ),
    },
    {
      title: t('systemConfiguration.branches.columns.province'),
      dataIndex: 'provinceId',
      key: 'provinceId',
      render: (provinceId) => {
        const province = provinces.find((p) => p.id === provinceId);
        return province ? (
          <Tag color='blue'>{province.name}</Tag>
        ) : (
          getProvinceName(provinceId)
        );
      },
    },
    {
      title: t('systemConfiguration.branches.columns.contact'),
      dataIndex: 'phone',
      key: 'phone',
      render: (phone, record) => (
        <Space direction='vertical' size='small'>
          <Text>{phone}</Text>
          <Text type='secondary' style={{ fontSize: '11px' }}>
            {record.address}
          </Text>
        </Space>
      ),
    },
    {
      title: t('systemConfiguration.branches.columns.users'),
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count) => (
        <Space>
          <TeamOutlined />
          <Text>
            {count} {t('systemConfiguration.stats.usersCount')}
          </Text>
        </Space>
      ),
    },
    {
      title: t('systemConfiguration.branches.columns.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive
            ? t('systemConfiguration.status.active')
            : t('systemConfiguration.status.inactive')}
        </Tag>
      ),
    },
    {
      title: t('systemConfiguration.branches.columns.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size='small'
            onClick={() => {
              setEditingItem(record);
              setModalVisible(true);
            }}
          >
            {t('systemConfiguration.branches.editButton')}
          </Button>
        </Space>
      ),
    },
  ];

  const renderSystemOverview = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title={t('systemConfiguration.systemOverview.totalProvinces')}
            value={systemMetrics.totalProvinces}
            prefix={<GlobalOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title={t('systemConfiguration.systemOverview.totalBranches')}
            value={systemMetrics.totalBranches}
            prefix={<BankOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title={t('systemConfiguration.systemOverview.activeUsers')}
            value={systemMetrics.activeUsers}
            prefix={<TeamOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title={t('systemConfiguration.systemOverview.systemHealth')}
            value={systemMetrics.systemHealth}
            suffix='%'
            prefix={<ThunderboltOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
          <Progress
            percent={systemMetrics.systemHealth}
            showInfo={false}
            strokeColor='#52c41a'
            size='small'
          />
        </Card>
      </Col>
    </Row>
  );

  const renderProvincesTab = () => (
    <div>
      <Card
        title={
          <Space>
            <GlobalOutlined />
            <span>{t('systemConfiguration.provinces.title')}</span>
          </Space>
        }
        extra={
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingItem(null);
              setModalVisible(true);
            }}
          >
            {t('systemConfiguration.provinces.addButton')}
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Alert
          message={t('systemConfiguration.provinces.alert.title')}
          description={t('systemConfiguration.provinces.alert.description')}
          type='info'
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Table
          columns={provinceColumns}
          dataSource={provinces}
          rowKey='id'
          loading={loading}
          pagination={false}
          size={isMobile ? 'small' : 'default'}
        />
      </Card>
    </div>
  );

  const renderBranchesTab = () => (
    <div>
      <Card
        title={
          <Space>
            <BankOutlined />
            <span>{t('systemConfiguration.branches.title')}</span>
          </Space>
        }
        extra={
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingItem(null);
              setModalVisible(true);
            }}
          >
            {t('systemConfiguration.branches.addButton')}
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Alert
          message={t('systemConfiguration.branches.alert.title')}
          description={t('systemConfiguration.branches.alert.description')}
          type='info'
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Table
          columns={branchColumns}
          dataSource={branches}
          rowKey='id'
          loading={loading}
          pagination={{ pageSize: 10 }}
          size={isMobile ? 'small' : 'default'}
        />
      </Card>
    </div>
  );

  return (
    <ScreenWithManual
      screenType='system-configuration'
      showManualOnFirstVisit={false}
    >
      <LayoutWithRBAC
        permission='admin.system'
        title={t('systemConfiguration.title')}
        requireBranchSelection={false}
        showAuditTrail={true}
        showStepper={false}
      >
        <div style={{ padding: isMobile ? '16px' : '24px' }}>
          <Card
            title={
              <Space>
                <SettingOutlined
                  style={{ color: '#1890ff', fontSize: '24px' }}
                />
                <Title level={2} style={{ margin: 0 }}>
                  {t('systemConfiguration.title')}
                </Title>
                <LanguageSwitcher />
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <Text style={{ fontSize: '16px' }}>
              {t('systemConfiguration.executiveDescription')}
            </Text>
          </Card>

          {/* System Overview */}
          <Card
            title={t('systemConfiguration.systemOverview.title')}
            style={{ marginBottom: 24 }}
            size='small'
          >
            {renderSystemOverview()}
          </Card>

          {/* Configuration Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size={isMobile ? 'small' : 'default'}
          >
            <TabPane
              tab={
                <Space>
                  <GlobalOutlined />
                  <span>{t('systemConfiguration.provinces.tabTitle')}</span>
                </Space>
              }
              key='provinces'
            >
              {renderProvincesTab()}
            </TabPane>

            <TabPane
              tab={
                <Space>
                  <BankOutlined />
                  <span>{t('systemConfiguration.branches.tabTitle')}</span>
                </Space>
              }
              key='branches'
            >
              {renderBranchesTab()}
            </TabPane>
          </Tabs>

          {/* Add/Edit Modal */}
          <Modal
            title={`${editingItem ? t('systemConfiguration.modal.editProvince') : t('systemConfiguration.modal.addProvince')} ${activeTab === 'provinces' ? '' : t('systemConfiguration.modal.addBranch')}`}
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
            width={600}
          >
            <Form
              form={form}
              layout='vertical'
              onFinish={
                activeTab === 'provinces'
                  ? handleSaveProvince
                  : handleSaveBranch
              }
              initialValues={editingItem}
            >
              {activeTab === 'provinces' ? (
                <>
                  <Form.Item
                    name='name'
                    label={t('systemConfiguration.provinces.form.nameLabel')}
                    rules={[{ required: true }]}
                  >
                    <Input
                      placeholder={t(
                        'systemConfiguration.provinces.form.namePlaceholder'
                      )}
                    />
                  </Form.Item>
                  <Form.Item
                    name='nameEn'
                    label={t('systemConfiguration.provinces.form.nameEnLabel')}
                    rules={[{ required: true }]}
                  >
                    <Input
                      placeholder={t(
                        'systemConfiguration.provinces.form.nameEnPlaceholder'
                      )}
                    />
                  </Form.Item>
                  <Form.Item
                    name='code'
                    label={t('systemConfiguration.provinces.form.codeLabel')}
                    rules={[{ required: true }]}
                  >
                    <Input
                      placeholder={t(
                        'systemConfiguration.provinces.form.codePlaceholder'
                      )}
                    />
                  </Form.Item>
                  <Form.Item
                    name='region'
                    label={t('systemConfiguration.provinces.form.regionLabel')}
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder={t(
                        'systemConfiguration.provinces.form.regionPlaceholder'
                      )}
                    >
                      <Option value='Central'>
                        {t('systemConfiguration.provinces.regions.central')}
                      </Option>
                      <Option value='Northeast'>
                        {t('systemConfiguration.provinces.regions.northeast')}
                      </Option>
                      <Option value='North'>
                        {t('systemConfiguration.provinces.regions.north')}
                      </Option>
                      <Option value='South'>
                        {t('systemConfiguration.provinces.regions.south')}
                      </Option>
                    </Select>
                  </Form.Item>
                </>
              ) : (
                <>
                  <Form.Item
                    name='name'
                    label={t('systemConfiguration.branches.form.nameLabel')}
                    rules={[{ required: true }]}
                  >
                    <Input
                      placeholder={t(
                        'systemConfiguration.branches.form.namePlaceholder'
                      )}
                    />
                  </Form.Item>
                  <Form.Item
                    name='nameEn'
                    label={t('systemConfiguration.branches.form.nameEnLabel')}
                    rules={[{ required: true }]}
                  >
                    <Input
                      placeholder={t(
                        'systemConfiguration.branches.form.nameEnPlaceholder'
                      )}
                    />
                  </Form.Item>
                  <Form.Item
                    name='code'
                    label={t('systemConfiguration.branches.form.codeLabel')}
                    rules={[{ required: true }]}
                  >
                    <Input
                      placeholder={t(
                        'systemConfiguration.branches.form.codePlaceholder'
                      )}
                    />
                  </Form.Item>
                  <Form.Item
                    name='provinceId'
                    label={t('systemConfiguration.branches.form.provinceLabel')}
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder={t(
                        'systemConfiguration.branches.form.provincePlaceholder'
                      )}
                    >
                      {provinces.map((province) => (
                        <Option key={province.id} value={province.id}>
                          {province.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name='address'
                    label={t('systemConfiguration.branches.form.addressLabel')}
                  >
                    <Input.TextArea
                      placeholder={t(
                        'systemConfiguration.branches.form.addressPlaceholder'
                      )}
                    />
                  </Form.Item>
                  <Form.Item
                    name='phone'
                    label={t('systemConfiguration.branches.form.phoneLabel')}
                  >
                    <Input
                      placeholder={t(
                        'systemConfiguration.branches.form.phonePlaceholder'
                      )}
                    />
                  </Form.Item>
                </>
              )}

              <Form.Item
                name='isActive'
                label={t('systemConfiguration.provinces.form.statusLabel')}
                valuePropName='checked'
              >
                <Switch
                  checkedChildren={t('systemConfiguration.status.active')}
                  unCheckedChildren={t('systemConfiguration.status.inactive')}
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type='primary'
                    htmlType='submit'
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    {t('systemConfiguration.modal.saveButton')}
                  </Button>
                  <Button onClick={() => setModalVisible(false)}>
                    {t('systemConfiguration.modal.cancelButton')}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </LayoutWithRBAC>
    </ScreenWithManual>
  );
};

export default SystemConfiguration;
