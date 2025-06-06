import React, { useContext } from 'react';
import { Form } from 'antd';
import { showLog, showWarn } from 'functions';
import { initValues, renderInput } from './api';
import Footer from 'components/Footer';
import { PlusOutlined } from '@ant-design/icons';
import { load } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import { useSelector } from 'react-redux';
import { FirebaseContext } from '../../../../../firebase';
import { showSuccess } from 'functions';
import HiddenItem from 'components/HiddenItem';
import { createNewId } from 'utils';

const BranchDeliverInput = () => {
  const { api, firestore } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const [form] = Form.useForm();

  const _onConfirm = async values => {
    try {
      load(true);
      let mValues = await form.validateFields();
      //  showLog({ values, mValues });
      let sValues = cleanValuesBeforeSave(mValues);
      let _key = createNewId('DLV-PLAN');
      await api.setItem(
        {
          ...sValues,
          deleted: false,
          created: Date.now(),
          inputBy: user.uid,
          _key
        },
        'sections/stocks/deliver',
        _key
      );
      load(false);
      form.resetFields();
      showSuccess(() => showLog('Success'), `บันทึกแผนการส่งรถ ${sValues.productCode} สำเร็จ`);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  return (
    <Form form={form} initialValues={initValues} layout="vertical" size="small">
      {values => {
        //  showLog({ values });
        return (
          <>
            <HiddenItem name="deliverType" />
            <div className="bg-white">{renderInput(values)}</div>
            <Footer
              onConfirm={() => _onConfirm(values)}
              onCancel={() => form.resetFields()}
              cancelText="ล้างข้อมูล"
              cancelPopConfirmText="ล้าง?"
              okPopConfirmText="ยืนยัน?"
              okIcon={<PlusOutlined />}
            />
          </>
        );
      }}
    </Form>
  );
};

export default BranchDeliverInput;
