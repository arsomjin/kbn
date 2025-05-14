import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Modal, Form, Input, Select, Badge } from 'antd';
import { Branch, BranchFormData } from '../../types/branch';
import { useLoading } from '../../hooks/useLoading';
import { useProvinces } from '../../hooks/useProvinces';
import { useBranchContext } from '../../hooks/useBranchContext';
import AccessDenied from "../../components/common/AccessDenied";
import { usePermissions } from "../../hooks/usePermissions";
import { ROLES } from "../../constants/roles";
import { App as AntdApp } from 'antd';
import { useAntdModal } from '../../hooks/useAntModal';

const BranchesManagement: React.FC = () => {
  const { t } = useTranslation(['branches', 'common']);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<null | (() => void)>(null);
  const { withLoading } = useLoading();
  const { provinces } = useProvinces();
  const { refreshBranches, branches, createBranch, updateBranch, deleteBranch } = useBranchContext();
  const { hasRole } = usePermissions();
  const { message } = AntdApp.useApp();
  const { modal } = useAntdModal();

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        await refreshBranches({ includeAll: true });
      } catch (error) {
        console.error("Error fetching branches:", error);
        message.error(t("branches:errors.loadFailed"));
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  if (!hasRole([ROLES.SUPER_ADMIN, ROLES.PRIVILEGE])) {
    return <AccessDenied />;
  }

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({
      branchCode: '',
      branchName: '',
      nameEn: '',
      provinceId: undefined,
      status: 'active',
      address: '',
      phone: '',
      email: '',
      taxId: '',
      description: ''
    });
    setEditingBranch(null);
    setModalVisible(true);
  };

  const handleEdit = (record: Branch) => {
    setEditingBranch(record);
    setModalVisible(true);
    setTimeout(() => {
      form.setFieldsValue(record);
    }, 0);
  };

  const handleDelete = async (id: string) => {
    modal.confirm({
      title: t('branches:modal.deleteTitle'),
      content: t('branches:modal.deleteConfirmation'),
      okText: t('common.delete', 'ลบ'),
      cancelText: t('common:cancel', 'ยกเลิก'),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await withLoading(deleteBranch(id));
          message.success(t('branches:messages.deleteSuccess'));
        } catch (error) {
          console.error('Error deleting branch:', error);
          message.error(t('branches:errors.deleteFailed'));
        }
      },
    });
  };

  const handleSubmit = async (values: BranchFormData) => {
    // Sanitize values: remove undefined fields (Firestore does not allow undefined)
    const sanitizedValues = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === undefined ? null : v])
    ) as BranchFormData;
    try {
      if (editingBranch) {
        await withLoading(updateBranch(editingBranch.id, sanitizedValues));
        message.success(t('branches:messages.updateSuccess'));
      } else {
        await withLoading(createBranch(sanitizedValues));
        message.success(t('branches:messages.createSuccess'));
      }
      setModalVisible(false);
      form.resetFields();
      refreshBranches();
    } catch (error) {
      console.error('Error saving branch:', error);
      message.error(t('branches:errors.saveFailed'));
    }
  };

  const showConfirm = (onOk: () => void) => {
    setPendingSubmit(() => onOk);
    setConfirmVisible(true);
  };

  const columns = [
    {
      title: t('branches:fields.code'),
      dataIndex: 'branchCode',
      key: 'branchCode',
    },
    {
      title: t('branches:fields.name'),
      dataIndex: 'branchName',
      key: 'branchName',
    },
    {
      title: t('branches:fields.nameEn'),
      dataIndex: 'nameEn',
      key: 'nameEn',
    },
    {
      title: t('branches:fields.provinceId'),
      dataIndex: 'provinceId',
      key: 'provinceId',
      render: (provinceId: string) => {
        const province = provinces.find(p => p.id === provinceId);
        return province ? province.name : provinceId;
      },
    },
    {
      title: t('branches:fields.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'active' ? 'success' : 'default'} 
          text={t(`branches:status.${status}`)}
        />
      ),
    },
    {
      title: t('common:actions'),
      key: 'actions',
      render: (_: any, record: Branch) => (
        <>
          <Button className='mr-2' type="link" onClick={() => {
                form.resetFields();
                handleEdit(record);
            }}>
            {t('branches:actions.edit')}
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            {t('branches:actions.delete')}
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-4 md:p-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold break-words">{t('branches:title')}</h1>
        <div className="sm:ml-auto flex justify-end">
          <Button
            type="primary"
            icon={<span className="anticon anticon-plus"><svg width="1em" height="1em" fill="currentColor" viewBox="64 64 896 896"><path d="M482 152m36 0q36 0 36 36v272h272q36 0 36 36t-36 36H554v272q0 36-36 36t-36-36V532H210q-36 0-36-36t36-36h272V188q0-36 36-36z"></path></svg></span>}
            className="sm:w-auto"
            onClick={handleAdd}
          >
            {t('branches:actions.add')}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-800">
        <Table
          columns={columns}
          dataSource={branches}
          rowKey="id"
          loading={loading}
          pagination={{
            showTotal: (total) => t('branches:pagination.total', { total }),
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            responsive: true
          }}
          scroll={{ x: 800 }}
        />
      </div>

      <Modal
        title={editingBranch ? t('branches:modal.editTitle') : t('branches:modal.addTitle')}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
        okText={t('common.save', 'บันทึก')}
        cancelText={t('common:cancel', 'ยกเลิก')}
        className="max-w-full"
        style={{ top: 24 }}
        styles={{ body: { padding: 16 } }}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values: BranchFormData) => {
                showConfirm(() => handleSubmit(values));
            }}
          initialValues={{ status: 'active' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="branchCode"
              label={t('branches:fields.code')}
              rules={[
                { required: true, message: t('branches:validation.required') },
                {
                  pattern: /^[A-Z0-9-]{2,10}$/,
                  message: t('branches:validation.codeFormat'),
                },
                {
                  pattern: /^[^_]*$/,
                  message: t('branches:validation.noUnderscore'),
                },
              ]}
            >
              <Input disabled={!!editingBranch} />
            </Form.Item>

            <Form.Item
              name="branchName"
              label={t('branches:fields.name')}
              rules={[
                { required: true, message: t('branches:validation.required') },
                { max: 100, message: t('branches:validation.maxLength', { max: 100 }) },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="nameEn"
              label={t('branches:fields.nameEn')}
              rules={[
                { required: true, message: t('branches:validation.required') },
                { max: 100, message: t('branches:validation.maxLength', { max: 100 }) },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="provinceId"
              label={t('branches:fields.provinceId')}
              rules={[{ required: true, message: t('branches:validation.required') }]}
            >
              <Select showSearch optionFilterProp="children">
                {provinces.map(province => (
                  <Select.Option key={province.id} value={province.id}>
                    {province.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label={t('branches:fields.status')}
              rules={[{ required: true, message: t('branches:validation.required') }]}
            >
              <Select>
                <Select.Option value="active">{t('branches:status.active')}</Select.Option>
                <Select.Option value="inactive">{t('branches:status.inactive')}</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="address" label={t('branches:fields.address')} className="md:col-span-2">
              <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
            </Form.Item>

            <Form.Item
              name="phone"
              label={t('branches:fields.phone')}
              rules={[
                {
                  pattern: /^[0-9-+() ]*$/,
                  message: t('branches:validation.invalidPhone'),
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label={t('branches:fields.email')}
              rules={[
                {
                  type: 'email',
                  message: t('branches:validation.invalidEmail'),
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="taxId"
              label={t('branches:fields.taxId')}
              rules={[
                {
                  pattern: /^[0-9-]*$/,
                  message: t('branches:validation.invalidTaxId'),
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="description" label={t('branches:fields.description')} className="md:col-span-2">
              <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
      <Modal
        open={confirmVisible}
        onCancel={() => setConfirmVisible(false)}
        onOk={() => {
          setConfirmVisible(false);
          if (pendingSubmit) pendingSubmit();
        }}
        title={t(editingBranch ? 'branches:modal.editTitle' : 'branches:modal.addTitle')}
        okText={t('common.save', 'บันทึก')}
        cancelText={t('common:cancel', 'ยกเลิก')}
      >
        {t(editingBranch ? 'branches:modal.editConfirmation' : 'branches:modal.addConfirmation', 'Are you sure you want to save this branch?')}
      </Modal>
    </div>
  );
};

export default BranchesManagement;
