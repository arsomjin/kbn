import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getProvinces, createProvince, updateProvince, deleteProvince } from '../../services/provinceService';
import { Province } from '../../types/province';
import AccessDenied from "../../components/common/AccessDenied";
import { usePermissions } from "../../hooks/usePermissions";
import { ROLES } from "../../constants/roles";
import { App as AntdApp } from 'antd';
import { useAntdModal } from '../../hooks/useAntModal';

const regions = [
  { value: 'central', label: 'Central' },
  { value: 'north', label: 'North' },
  { value: 'northeast', label: 'Northeast' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
  { value: 'south', label: 'South' }
];

const ProvincesManagement: React.FC = () => {
  // All hooks at the top
  const { t } = useTranslation(['common', 'provinces']);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProvince, setEditingProvince] = useState<Province | null>(null);
  const [form] = Form.useForm();
  const { hasRole } = usePermissions();
  const { message } = AntdApp.useApp();
  const { modal } = useAntdModal();

  // Utility to wrap async actions with loading state
  const withLoading = async (fn: () => Promise<void>) => {
    setLoading(true);
    try {
      await fn();
    } finally {
      setLoading(false);
    }
  };

  // useEffect must be called before any return
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Early return after all hooks
  if (!hasRole([ROLES.SUPER_ADMIN, ROLES.PRIVILEGE])) {
    return <AccessDenied />;
  }

  const fetchProvinces = async () => {
    await withLoading(async () => {
      try {
        const data = await getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
        message.error(t('provinces:errors.fetchFailed'));
      }
    });
  };

  const handleSubmit = async (values: any) => {
    const safeValues = {
      ...values,
      region: values.region ?? '',
      description: values.description ?? ''
    };

    const isEdit = !!editingProvince;
    const confirmTitle = isEdit
      ? t('provinces:modal.editConfirmationTitle')
      : t('provinces:modal.createConfirmationTitle');
    const confirmContent = isEdit
      ? t('provinces:modal.editConfirmation')
      : t('provinces:modal.createConfirmation');

    modal.confirm({
      title: confirmTitle,
      content: confirmContent,
      okText: t('common:confirm'),
      cancelText: t('common:cancel'),
      onOk: async () => {
        await withLoading(async () => {
          try {
            if (editingProvince) {
              await updateProvince(editingProvince.id, safeValues);
              message.success(t('provinces:messages.updateSuccess'));
            } else {
              await createProvince(safeValues);
              message.success(t('provinces:messages.createSuccess'));
            }
            setModalVisible(false);
            form.resetFields();
            fetchProvinces();
          } catch (error) {
            console.error('Error saving province:', error);
            message.error(t('provinces:errors.saveFailed'));
          }
        });
      },
    });
  };

  const handleDelete = async (id: string) => {
    modal.confirm({
      title: t('provinces:modal.deleteTitle'),
      content: t('provinces:modal.deleteConfirmation'),
      okText: t('common:delete'),
      cancelText: t('common:cancel'),
      okButtonProps: { danger: true },
      onOk: async () => {
        await withLoading(async () => {
          try {
            await deleteProvince(id);
            message.success(t('provinces:messages.deleteSuccess'));
            fetchProvinces();
          } catch (error) {
            console.error('Error deleting province:', error);
            message.error(t('provinces:errors.deleteFailed'));
          }
        });
      },
    });
  };

  const columns = [
    {
      title: t('provinces:fields.code'),
      dataIndex: 'code',
      key: 'code',
      width: 100,
    },
    {
      title: t('provinces:fields.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Province, b: Province) => a.name.localeCompare(b.name),
    },
    {
      title: t('provinces:fields.nameEn'),
      dataIndex: 'nameEn',
      key: 'nameEn',
      sorter: (a: Province, b: Province) => a.nameEn.localeCompare(b.nameEn),
    },
    {
      title: t('provinces:fields.region'),
      dataIndex: 'region',
      key: 'region',
      render: (region: string) => region ? t(`provinces:regions.${region}`) || region : '',
    },
    {
      title: t('provinces:fields.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'active' ? 'success' : 'default'} 
          text={t(`provinces:status.${status}`)}
        />
      ),
    },
    {
      title: t('common:actions'),
      key: 'actions',
      render: (_: unknown, record: Province) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingProvince(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-4 md:p-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold break-words">{t('provinces:title')}</h1>
        <div className="sm:ml-auto flex justify-end">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="sm:w-auto"
            onClick={() => {
              setEditingProvince(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            {t('provinces:actions.add')}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-800">
        <Table
          columns={columns}
          dataSource={provinces}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => t('provinces:pagination.total', { total }),
            pageSizeOptions: [10, 20, 50, 100],
            responsive: true
          }}
          scroll={{ x: 800 }}
        />
      </div>

      <Modal
        title={editingProvince ? t('provinces:modal.editTitle') : t('provinces:modal.addTitle')}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        className="max-w-full"
        style={{ top: 24 }}
        styles={{ body: { padding: 16 } }}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="code"
              label={t('provinces:fields.code')}
              rules={[
                { required: true, message: t('common:validation.required') },
                { 
                  pattern: /^[A-Z0-9-]{2,10}$/,
                  message: t('provinces:validation.codeFormat')
                },
                {
                  validator: (_, value) => {
                    if (value?.includes('_')) {
                      return Promise.reject(t('provinces:validation.noUnderscore'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>

            <Form.Item
              name="name"
              label={t('provinces:fields.name')}
              rules={[
                { required: true, message: t('common:validation.required') },
                { max: 100, message: t('common:validation.maxLength', { max: 100 }) }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="nameEn"
              label={t('provinces:fields.nameEn')}
              rules={[
                { required: true, message: t('common:validation.required') },
                { max: 100, message: t('common:validation.maxLength', { max: 100 }) }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="region"
              label={t('provinces:fields.region')}
            >
              <Select allowClear>
                {regions.map(region => (
                  <Select.Option key={region.value} value={region.value}>
                    {t(`provinces:regions.${region.value}`)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {editingProvince && (
              <Form.Item
                name="status"
                label={t('provinces:fields.status')}
                rules={[{ required: true, message: t('common:validation.required') }]}
              >
                <Select>
                  <Select.Option value="active">{t('provinces:status.active')}</Select.Option>
                  <Select.Option value="inactive">{t('provinces:status.inactive')}</Select.Option>
                </Select>
              </Form.Item>
            )}

            <Form.Item
              name="description"
              label={t('provinces:fields.description')}
              rules={[
                { max: 500, message: t('common:validation.maxLength', { max: 500 }) }
              ]}
              className="md:col-span-2"
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </div>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                {t('common:cancel')}
              </Button>
              <Button type="primary" htmlType="submit">
                {t('common:save')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProvincesManagement;