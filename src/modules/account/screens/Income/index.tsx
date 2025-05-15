import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { DateTime } from "luxon";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from '../../../../firebase/config';
import { AccountIncomeRecord } from "../../types";
import { formatCurrency, formatDate } from "utils/format";
import { hasPermission, hasProvinceAccess } from "utils/permissions";
import { PERMISSIONS, PermissionValue } from 'constants/Permissions';

const { Option } = Select;

/**
 * Income screen component
 */
const Income: React.FC = () => {
  const { t } = useTranslation("account", "common");
  const { provinceId } = useParams<{ provinceId: string }>();
  const { user } = useSelector((state: any) => state.auth);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AccountIncomeRecord[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AccountIncomeRecord | null>(null);

  const canEdit = hasPermission(PERMISSIONS.MANAGE_INCOME as PermissionValue);
  const canDelete = hasPermission(PERMISSIONS.MANAGE_INCOME as PermissionValue);
  const canAdd = hasPermission(PERMISSIONS.MANAGE_INCOME as PermissionValue);

  // Fetch income data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "sections/account/incomes"),
        where("provinceId", "==", provinceId)
      );
      const snapshot = await getDocs(q);
      const incomeData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as AccountIncomeRecord[];
      setData(incomeData);
    } catch (error) {
      message.error(t("account.messages.fetchError"));
    } finally {
      setLoading(false);
    }
  }, [provinceId, t]);

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const incomeData: Partial<AccountIncomeRecord> = {
        ...values,
        date: DateTime.fromJSDate(values.date.toDate()).toMillis(),
        provinceId,
        created: DateTime.now().toMillis(),
        createdBy: user.uid,
        status: "pending"
      };

      if (editingRecord) {
        await updateDoc(doc(db, "sections/account/incomes", editingRecord.id), incomeData);
        message.success(t("account.messages.editSuccess"));
      } else {
        await addDoc(collection(db, "sections/account/incomes"), incomeData);
        message.success(t("account.messages.addSuccess"));
      }

      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error(t("account.messages.saveError"));
    } finally {
      setLoading(false);
    }
  };

  // Handle record deletion
  const handleDelete = async (record: AccountIncomeRecord) => {
    try {
      await deleteDoc(doc(db, "sections/account/incomes", record.id));
      message.success(t("account.messages.deleteSuccess"));
      fetchData();
    } catch (error) {
      message.error(t("account.messages.deleteError"));
    }
  };

  const columns = [
    {
      title: t("date"),
      dataIndex: "date",
      key: "date",
      render: (date: number) => formatDate(date)
    },
    {
      title: t("incomeCategories.vehicle"),
      dataIndex: "incomeCategory",
      key: "incomeCategory",
      render: (category: string) => t(`incomeCategories.${category}`)
    },
    {
      title: t("amount"),
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => formatCurrency(amount)
    },
    {
      title: t("status.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "approved" ? "green" : status === "pending" ? "orange" : "red"}>
          {t(`status.${status}`)}
        </Tag>
      )
    },
    {
      title: t("actions.title"),
      key: "actions",
      render: (_: any, record: AccountIncomeRecord) => (
        <Space>
          {canEdit && (
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditingRecord(record);
                form.setFieldsValue({
                  ...record,
                  date: DateTime.fromMillis(record.date).toJSDate()
                });
                setModalVisible(true);
              }}
            />
          )}
          {canDelete && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: t("messages.deleteConfirm"),
                  onOk: () => handleDelete(record)
                });
              }}
            />
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Card
        title={t("title")}
        extra={
          canAdd && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingRecord(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              {t("actions.add")}
            </Button>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => t("common.totalRecords", { total })
          }}
        />
      </Card>

      <Modal
        title={editingRecord ? t("actions.edit") : t("actions.add")}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="date"
            label={t("date")}
            rules={[{ required: true, message: t("validation.required") }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="incomeCategory"
            label={t("incomeCategories.title")}
            rules={[{ required: true, message: t("validation.required") }]}
          >
            <Select>
              <Option value="vehicle">{t("incomeCategories.vehicle")}</Option>
              <Option value="service">{t("incomeCategories.service")}</Option>
              <Option value="parts">{t("incomeCategories.parts")}</Option>
              <Option value="other">{t("incomeCategories.other")}</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label={t("amount")}
            rules={[{ required: true, message: t("validation.required") }]}
          >
            <InputNumber
              className="w-full"
              formatter={(value) => `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value!.replace(/฿\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t("common.save")}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                {t("common.cancel")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Income; 