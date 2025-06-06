import React, { useContext, useEffect } from 'react';
import { Modal, Form, Input, Select, Popconfirm } from 'antd';
import { showLog, showConfirm } from 'functions';
import { showWarn } from 'functions';
import { checkDoc } from 'firebase/api';
import { showAlert } from 'functions';
import { load } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import { FirebaseContext } from '../../../firebase';
import { getChanges } from 'functions';
import { useSelector } from 'react-redux';
import { showSuccess } from 'functions';
import { createKeywords } from 'utils';
import { ServiceNameKeywords } from 'data/Constant';
import { Button } from 'elements';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';
const { Option } = Select;

export default ({ initDoc, onCancel, onDelete, visible, ...props }) => {
  const { api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);

  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      serviceCode: null,
      name: null,
      unit: null,
      discount: null,
      unitPrice: null,
      creditTerm: null,
      description: null,
      remark: null,
      ...initDoc
    });
  }, [form, initDoc]);

  const onConfirm = async mValues => {
    try {
      //  showLog('values', values);
      load(true);
      let keywords = createKeywords(mValues.serviceCode);
      ServiceNameKeywords.map(kw => {
        if (mValues.name.toString().toLowerCase().indexOf(kw) > -1) {
          keywords = [...keywords, ...createKeywords(kw)];
        }
        return kw;
      });

      keywords = [...keywords, ...createKeywords(mValues.name)];

      let values = cleanValuesBeforeSave({
        ...mValues,
        keywords,
        deleted: false
      });

      let isDocExists = await checkDoc('data', `services/serviceList/${values.serviceCode}`);
      if (isDocExists) {
        await api.updateItem(values, 'data/services/serviceList', values.serviceCode);
      } else {
        let _key = values.serviceCode;
        await api.setItem(
          {
            ...values,
            inputBy: user.uid,
            _key
          },
          'data/services/serviceList',
          _key
        );
      }

      const oldValues = initDoc;
      const newValues = values;
      const changes = getChanges(oldValues, newValues);
      await api.addLog(
        {
          time: Date.now(),
          type: 'edited',
          by: user.uid,
          docId: values.serviceCode,
          changes
        },
        'serviceList',
        values.serviceCode
      );
      load(false);
      showSuccess(() => onCancel && onCancel(true), `บันทึกข้อมูล บริการ ${values.name} สำเร็จ`);
      // alert('Done!');
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const onPreConfirm = async values => {
    try {
      let mValues = JSON.parse(JSON.stringify(values));
      if (!initDoc.serviceCode) {
        // Check before add.
        let isDocExists = await checkDoc('data', `services/serviceList/${values.serviceCode}`);
        if (isDocExists) {
          return showAlert(
            'บันทึกแล้ว',
            `รหัสบริการ ${values.serviceCode} ได้บันทึกข้อมูลแล้วในชื่อ "${isDocExists.data().name}"`,
            'warning'
          );
        }
      }
      showConfirm(() => onConfirm(mValues), `${!!initDoc.serviceCode ? 'แก้ไข' : 'เพิ่ม'}บริการ ${mValues.name}`);
    } catch (e) {
      showWarn(e);
    }
  };

  const _onDelete = async () => {
    let values = form.getFieldsValue();
    load(true);
    let isDocExists = await checkDoc('data', `services/serviceList/${values.serviceCode}`);
    if (isDocExists) {
      await api.updateItem({ deleted: true }, 'data/services/serviceList', values.serviceCode);
      load(false);
      showSuccess(() => onCancel && onCancel(true), `ลบข้อมูล บริการ ${values.name} สำเร็จ`);
    } else {
      load(false);
      showAlert('ไม่สำเร็จ', `ไม่พบรหัสบริการ ${values.serviceCode}`);
    }
  };

  let buttons = [
    <Button key="close" onClick={() => onCancel()}>
      ยกเลิก
    </Button>,
    <Button
      key="ok"
      icon={<CheckOutlined />}
      onClick={() => {
        form
          .validateFields()
          .then(values => {
            onPreConfirm(values);
          })
          .catch(info => {
            console.log('Validate Failed:', info);
          });
      }}
      type="primary"
    >
      ยืนยัน
    </Button>
  ];

  if (!!initDoc?.serviceCode) {
    buttons = [
      buttons[0],
      <Popconfirm
        title="ลบรายการ ?"
        onConfirm={() => _onDelete()}
        onCancel={() => showLog('cancel')}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
        key="delete"
      >
        <Button type="danger" icon={<DeleteOutlined />}>
          ลบ
        </Button>
      </Popconfirm>,
      buttons[1]
    ];
  }

  const nameRule = [{ required: true, message: 'กรุณาป้อนข้อมูล' }];

  return (
    <Modal
      title={!!initDoc?.serviceCode ? 'แก้ไขบริการ' : 'เพิ่มบริการ'}
      visible={visible}
      footer={buttons}
      onCancel={onCancel}
    >
      <Form
        form={form}
        layout="horizontal"
        className="mt-2"
        onFinish={onPreConfirm}
        initialValues={{
          serviceCode: null,
          name: null,
          unit: null,
          discount: null,
          unitPrice: null,
          creditTerm: null,
          description: null,
          remark: null
        }}
        labelCol={{
          span: 6
        }}
        wrapperCol={{
          span: 14
        }}
      >
        <Form.Item name="serviceCode" label="รหัสบริการ" rules={nameRule}>
          <Input placeholder="SUBLT-07FIX" />
        </Form.Item>
        <Form.Item name="name" label="ชื่อบริการ" rules={nameRule}>
          <Input placeholder="ชื่อบริการ" />
        </Form.Item>
        <Form.Item name="unit" label="หน่วย" rules={nameRule}>
          <Input placeholder="หน่วย" />
        </Form.Item>
        <Form.Item name="unitPrice" label="ราคาต่อหน่วย" rules={nameRule}>
          <Input placeholder="บาท" />
        </Form.Item>
        <Form.Item name="creditTerm" label="เครดิต">
          <Input placeholder="วัน" />
        </Form.Item>
        <Form.Item name="description" label="รายละเอียด">
          <Input placeholder="ข้อความ" />
        </Form.Item>
        <Form.Item name="remark" label="หมายเหตุ">
          <Input placeholder="หมายเหตุ" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
