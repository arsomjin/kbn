import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { createProvince, updateProvince, deleteProvince } from '../../services/provinceService';
import AccessDenied from '../../components/common/AccessDenied';
import { usePermissions } from 'hooks/usePermissions';
import { ROLES } from '../../constants/roles';
import { App as AntdApp } from 'antd';
import PageDoc from '../../components/PageDoc';
import { useSelector, useDispatch } from 'react-redux';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { firestore as db } from '../../services/firebase';
import { setProvinces } from '../../store/slices/dataSlice';
import { processFirestoreDataForForm } from '../../utils/dateHandling';

const regions = [
  { value: 'central', label: 'Central' },
  { value: 'north', label: 'North' },
  { value: 'northeast', label: 'Northeast' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
  { value: 'south', label: 'South' },
];

const ProvincesManagement = () => {
  const { t } = useTranslation(['common', 'provinces']);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProvince, setEditingProvince] = useState(null);
  const [form] = Form.useForm();
  const { hasRole } = usePermissions();
  const { message } = AntdApp.useApp();
  const dispatch = useDispatch();
  const provinces = useSelector((state) => state.data.provinces) || {};

  useEffect(() => {
    // Set up Firestore listener for provinces
    const provincesQuery = query(collection(db, 'data/company/provinces'));
    const unsubscribe = onSnapshot(provincesQuery, (snapshot) => {
      const data = {};
      snapshot.docs.forEach((doc) => {
        if (doc.exists()) {
          data[doc.id] = processFirestoreDataForForm({ ...doc.data(), _key: doc.id });
        }
      });
      dispatch(setProvinces([data, false]));
    });
    return () => unsubscribe();
  }, [dispatch]);

  if (!hasRole([ROLES.SUPER_ADMIN, ROLES.EXECUTIVE, ROLES.DEVELOPER])) {
    return <AccessDenied />;
  }

  const handleSubmit = async (values) => {
    const safeValues = {
      ...values,
      region: values.region ?? '',
      description: values.description ?? '',
    };
    const isEdit = !!editingProvince;
    const confirmTitle = isEdit
      ? t('provinces:modal.editConfirmationTitle')
      : t('provinces:modal.createConfirmationTitle');
    const confirmContent = isEdit
      ? t('provinces:modal.editConfirmation')
      : t('provinces:modal.createConfirmation');

    Modal.confirm({
      title: confirmTitle,
      content: confirmContent,
      okText: t('common:confirm'),
      cancelText: t('common:cancel'),
      onOk: async () => {
        try {
          setLoading(true);
          if (editingProvince) {
            await updateProvince(editingProvince._key, safeValues);
            message.success(t('provinces:messages.updateSuccess'));
          } else {
            await createProvince(safeValues);
            message.success(t('provinces:messages.createSuccess'));
          }
          setModalVisible(false);
          form.resetFields();
        } catch (error) {
          console.error('Error saving province:', error);
          message.error(t('provinces:errors.saveFailed'));
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const _handleDelete = async (id) => {
    Modal.confirm({
      title: t('provinces:modal.deleteTitle'),
      content: t('provinces:modal.deleteConfirmation'),
      okText: t('common:delete'),
      cancelText: t('common:cancel'),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setLoading(true);
          await deleteProvince(id);
          message.success(t('provinces:messages.deleteSuccess'));
        } catch (error) {
          console.error('Error deleting province:', error);
          message.error(t('provinces:errors.deleteFailed'));
        } finally {
          setLoading(false);
        }
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
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t('provinces:fields.nameEn'),
      dataIndex: 'nameEn',
      key: 'nameEn',
      sorter: (a, b) => a.nameEn.localeCompare(b.nameEn),
    },
    {
      title: t('provinces:fields.region'),
      dataIndex: 'region',
      key: 'region',
      render: (region) => (region ? t(`provinces:regions.${region}`) || region : ''),
    },
    {
      title: t('provinces:fields.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={status === 'active' ? 'success' : 'default'}
          text={t(`provinces:status.${status}`)}
        />
      ),
    },
    {
      title: t('common:actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              console.log('record', record);
              setEditingProvince(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
            size="small"
          />
          {/* <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          /> */}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-4 md:p-6 w-full max-w-7xl mx-auto">
      <PageDoc />
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
          dataSource={Object.values(provinces).map((province) => ({
            ...province,
            key: province._key,
          }))}
          loading={loading}
          rowKey="key"
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => t('provinces:pagination.total', { total }),
            pageSizeOptions: [10, 20, 50, 100],
            responsive: true,
          }}
          scroll={{ x: 800 }}
          rowClassName={(record) => (record.status !== 'active' ? 'deleted-row' : '')}
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
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="code"
              label={t('provinces:fields.code')}
              rules={[
                { required: true, message: t('common:validation.required') },
                {
                  pattern: /^[A-Z0-9-]{2,10}$/,
                  message: t('provinces:validation.codeFormat'),
                },
                {
                  validator: (_, value) => {
                    if (value?.includes('_')) {
                      return Promise.reject(t('provinces:validation.noUnderscore'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>

            <Form.Item
              name="name"
              label={t('provinces:fields.name')}
              rules={[
                { required: true, message: t('common:validation.required') },
                { max: 100, message: t('common:validation.maxLength', { max: 100 }) },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="nameEn"
              label={t('provinces:fields.nameEn')}
              rules={[
                { required: true, message: t('common:validation.required') },
                { max: 100, message: t('common:validation.maxLength', { max: 100 }) },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="region" label={t('provinces:fields.region')}>
              <Select allowClear>
                {regions.map((region) => (
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
              rules={[{ max: 500, message: t('common:validation.maxLength', { max: 500 }) }]}
              className="md:col-span-2"
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </div>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
              >
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
