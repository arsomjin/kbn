import React from 'react';
import { Form, Collapse } from 'antd';
import { getRules } from 'api/Table';
import { parser } from 'functions';
import { CardBody, Row } from 'shards-react';
import BookViewer from '../Booking/BookViewer';
import { showLog } from 'functions';
import { useForm } from 'antd/lib/form/Form';
import { Input } from 'elements';
import { DatePicker } from 'elements';
import Footer from 'components/Footer';
import { CheckOutlined } from '@ant-design/icons';
import { getEditArr } from 'utils';
import { useSelector } from 'react-redux';
import { NotificationIcon } from 'elements';
import HiddenItem from 'components/HiddenItem';

const layout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 18
  }
};

export const CancelModal = ({ record, onConfirm }) => {
  const { users } = useSelector(state => state.data);
  const { user } = useSelector(state => state.auth);
  const [form] = useForm();
  const onPreConfirm = values => {
    //  showLog({ values });
    onConfirm && onConfirm(values.canceled);
  };
  const canceled = record?.canceled || {
    date: undefined,
    details: null,
    by: user?.employeeCode || user?.uid
  };
  showLog({ record, canceled });
  return (
    <>
      <Collapse className="mb-3">
        <Collapse.Panel header={`ใบจองเลขที่ ${record.bookNo}`} key="1">
          <BookViewer {...{ sale: record, readOnly: true }} />
        </Collapse.Panel>
      </Collapse>
      <Form
        form={form}
        layout="horizontal"
        className="mt-2"
        onFinish={onPreConfirm}
        initialValues={{
          canceled
        }}
        {...layout}
      >
        {values => {
          //  showLog({ values });
          let editData = [];
          if (values.canceled.editedBy) {
            editData = getEditArr(values.canceled.editedBy, users);
          }
          return (
            <>
              <CardBody className="bg-white border p-3">
                {values.canceled.editedBy && (
                  <Row form className="mb-3 ml-2" style={{ alignItems: 'center' }}>
                    <NotificationIcon
                      icon="edit"
                      data={editData}
                      badgeNumber={values.canceled.editedBy.length}
                      theme="warning"
                    />
                    <span className="ml-2 text-light">ประวัติการแก้ไขเอกสาร</span>
                  </Row>
                )}
                <HiddenItem name="by" />
                <Form.Item label="วันที่ยกเลิก" name={['canceled', 'date']} rules={getRules(['required'])}>
                  <DatePicker />
                </Form.Item>
                <Form.Item label="เหตุผล" name={['canceled', '​details']} rules={getRules(['required'])}>
                  <Input />
                </Form.Item>
              </CardBody>
              <Footer
                onConfirm={() => form.submit()}
                onCancel={() => form.resetFields()}
                okText="บันทึกการยกเลิก"
                cancelText="ล้างข้อมูล"
                cancelPopConfirmText="ล้าง?"
                okPopConfirmText="ยืนยัน?"
                okIcon={<CheckOutlined />}
                buttonWidth={160}
              />
            </>
          );
        }}
      </Form>
    </>
  );
};

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'วันที่เอกสาร',
    dataIndex: 'date',
    align: 'center',
    defaultSortOrder: 'descend',
    sorter: (a, b) => parser(a.date) - parser(b.date)
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    align: 'center'
  },
  {
    title: 'ประเภทการขาย',
    dataIndex: 'saleType',
    align: 'center'
  },
  {
    title: 'เลขที่ใบจอง',
    dataIndex: 'bookNo',
    align: 'center'
  },
  {
    title: '#',
    dataIndex: 'prefix',
    align: 'center'
  },
  {
    title: 'ชื่อ',
    dataIndex: 'firstName'
  },
  {
    title: 'นามสกุล',
    dataIndex: 'lastName'
  },
  {
    title: 'จำนวนเงินจอง',
    dataIndex: 'amtReceived'
  },
  {
    title: 'ยอดเต็ม',
    dataIndex: 'amtFull'
  }
];
