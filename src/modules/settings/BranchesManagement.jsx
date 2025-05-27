import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Modal, Form, Input, Select, Badge } from 'antd';
import { useLoading } from 'hooks/useLoading';
import AccessDenied from '../../components/common/AccessDenied';
import { usePermissions } from 'hooks/usePermissions';
import { ROLES } from '../../constants/roles';
import { App as AntdApp } from 'antd';
import PageDoc from '../../components/PageDoc';
import { useSelector, useDispatch } from 'react-redux';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { firestore as db } from '../../services/firebase';
import { setBranches, setProvinces } from '../../store/slices/dataSlice';
import { createBranch, updateBranch, deleteBranch } from '../../services/branchService';
import { processFirestoreDataForForm } from '../../utils/dateHandling';
import ProvinceSelector from '../../components/common/ProvinceSelector';

const BranchesManagement = () => {
  const { t } = useTranslation(['branches', 'common']);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [form] = Form.useForm();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(null);
  const { withLoading } = useLoading();
  const { provinces, branches } = useSelector((state) => ({
    provinces: state.data.provinces || {},
    branches: state.data.branches || {},
  }));
  const dispatch = useDispatch();
  const { hasRole } = usePermissions();
  const { message } = AntdApp.useApp();

  useEffect(() => {
    // Set up Firestore listeners for branches and provinces
    const branchesQuery = query(collection(db, 'data/company/branches'));
    const provincesQuery = query(collection(db, 'data/company/provinces'));

    const unsubscribeBranches = onSnapshot(branchesQuery, (snapshot) => {
      const branchData = {};
      snapshot.docs.forEach((doc) => {
        if (doc.exists()) {
          branchData[doc.id] = processFirestoreDataForForm(
            { ...doc.data(), _key: doc.id },
            {
              outputFormat: 'iso',
            },
          );
        }
      });
      dispatch(setBranches([branchData, false]));
    });

    const unsubscribeProvinces = onSnapshot(provincesQuery, (snapshot) => {
      const data = {};
      snapshot.docs.forEach((doc) => {
        if (doc.exists()) {
          data[doc.id] = processFirestoreDataForForm(
            { ...doc.data(), _key: doc.id },
            {
              outputFormat: 'iso',
            },
          );
        }
      });
      dispatch(setProvinces([data, false]));
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeBranches();
      unsubscribeProvinces();
    };
  }, [dispatch]);

  if (!hasRole([ROLES.SUPER_ADMIN, ROLES.EXECUTIVE, ROLES.DEVELOPER])) {
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
      description: '',
    });
    setEditingBranch(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingBranch(record);
    setModalVisible(true);
    setTimeout(() => {
      form.setFieldsValue(record);
    }, 0);
  };

  const _handleDelete = async (id) => {
    Modal.confirm({
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

  const handleSubmit = async (values) => {
    const safeValues = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === undefined ? null : v]),
    );
    const isEdit = !!editingBranch;
    const confirmTitle = isEdit
      ? t('branches:modal.editConfirmationTitle', 'ยืนยันการแก้ไขข้อมูลสาขา')
      : t('branches:modal.createConfirmationTitle', 'ยืนยันการเพิ่มข้อมูลสาขา');
    const confirmContent = isEdit
      ? t('branches:modal.editConfirmation', 'คุณต้องการแก้ไขข้อมูลสาขานี้ใช่หรือไม่?')
      : t('branches:modal.createConfirmation', 'คุณต้องการเพิ่มข้อมูลสาขานี้ใช่หรือไม่?');

    Modal.confirm({
      title: confirmTitle,
      content: confirmContent,
      okText: t('common:confirm', 'ยืนยัน'),
      cancelText: t('common:cancel', 'ยกเลิก'),
      onOk: async () => {
        try {
          if (editingBranch) {
            await withLoading(updateBranch(editingBranch._key, safeValues));
            message.success(t('branches:messages.updateSuccess'));
          } else {
            await withLoading(createBranch(safeValues));
            message.success(t('branches:messages.createSuccess'));
          }
          setModalVisible(false);
          form.resetFields();
        } catch (error) {
          console.error('Error saving branch:', error);
          message.error(t('branches:errors.saveFailed'));
        }
      },
    });
  };

  const showConfirm = (onOk) => {
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
      render: (provinceId) => {
        const province = provinces[provinceId];
        return province ? province.name : provinceId;
      },
    },
    {
      title: t('branches:fields.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={status === 'active' ? 'success' : 'default'}
          text={t(`branches:status.${status}`)}
        />
      ),
    },
    {
      title: t('common:actions'),
      key: 'actions',
      render: (_, record) => (
        <>
          <Button
            className="mr-2"
            type="link"
            onClick={() => {
              form.resetFields();
              handleEdit(record);
            }}
            size="small"
          >
            {t('branches:actions.edit')}
          </Button>
          {/* <Button type="link" danger onClick={() => handleDelete(record.id)}>
            {t('branches:actions.delete')}
          </Button> */}
        </>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-4 md:p-6 w-full max-w-7xl mx-auto">
      <PageDoc />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold break-words">{t('branches:title')}</h1>
        <div className="sm:ml-auto flex justify-end">
          <Button
            type="primary"
            icon={
              <span className="anticon anticon-plus">
                <svg width="1em" height="1em" fill="currentColor" viewBox="64 64 896 896">
                  <path d="M482 152m36 0q36 0 36 36v272h272q36 0 36 36t-36 36H554v272q0 36-36 36t-36-36V532H210q-36 0-36-36t36-36h272V188q0-36 36-36z"></path>
                </svg>
              </span>
            }
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
          dataSource={Object.values(branches)
            .map((branch) => ({
              ...branch,
              key: branch._key,
            }))
            .sort((a, b) => a.branchCode.localeCompare(b.branchCode))}
          rowKey="key"
          pagination={{
            showTotal: (total) => t('branches:pagination.total', { total }),
            showSizeChanger: true,
            pageSize: 12,
            pageSizeOptions: [12, 20, 50, 100],
            responsive: true,
          }}
          scroll={{ x: 800 }}
          rowClassName={(record) => (record.status !== 'active' ? 'deleted-row' : '')}
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
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
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
              name="provinceId"
              label={t('branches:fields.provinceId')}
              rules={[{ required: true, message: t('branches:validation.required') }]}
            >
              <ProvinceSelector />
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
              name="status"
              label={t('branches:fields.status')}
              rules={[{ required: true, message: t('branches:validation.required') }]}
            >
              <Select>
                <Select.Option value="active">{t('branches:status.active')}</Select.Option>
                <Select.Option value="inactive">{t('branches:status.inactive')}</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="address"
              label={t('branches:fields.address')}
              className="md:col-span-2"
            >
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

            <Form.Item
              name="description"
              label={t('branches:fields.description')}
              className="md:col-span-2"
            >
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
        {t(
          editingBranch ? 'branches:modal.editConfirmation' : 'branches:modal.addConfirmation',
          'Are you sure you want to save this branch?',
        )}
      </Modal>
    </div>
  );
};

export default BranchesManagement;
