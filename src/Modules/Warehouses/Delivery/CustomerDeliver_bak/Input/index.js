import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { Form } from 'antd';
import { showLog, showWarn } from 'functions';
import { initSearchValue, initValues, renderHeader, renderInput } from './api';
import { getSearchData } from 'firebase/api';
import Footer from 'components/Footer';
import { PlusOutlined } from '@ant-design/icons';
import { load } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import { useSelector } from 'react-redux';
import { FirebaseContext } from '../../../../../firebase';
import { showSuccess } from 'functions';
import HiddenItem from 'components/HiddenItem';
import { checkDoc } from 'firebase/api';
import { createNewId } from 'utils';

const CustomerDeliverInput = () => {
  const { api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const searchValuesRef = useRef(initSearchValue);
  const [form] = Form.useForm();

  const _getData = useCallback(
    async sValues => {
      try {
        load(true);
        let mData = [];
        if (sValues?.searchCustomerId && sValues.searchCustomerId !== 'all') {
          mData = await getSearchData('sections/sales/vehicles', { customerId: sValues.searchCustomerId }, [
            'saleNo',
            'date'
          ]);
        } else if (sValues?.searchSaleNo && sValues.searchSaleNo !== 'all') {
          mData = await getSearchData('sections/sales/vehicles', { saleNo: sValues.searchSaleNo }, ['saleNo', 'date']);
        }
        searchValuesRef.current = sValues;
        mData = mData
          .filter(l => !['reservation', 'other'].includes(l.saleType))
          .map((item, id) => {
            return {
              ...item,
              id
            };
          });
        //  showLog({ mData, sValues });
        let mValues = {};
        if (mData.length > 0) {
          const { saleId, saleNo, customerId, branchCode, items } = mData[0];
          const doc = await checkDoc('data', `sales/customers/${customerId}`);
          let customer = {};
          if (doc) {
            customer = doc.data();
          }
          const { prefix, firstName, lastName, phoneNumber } = customer;
          const productCode = items ? items[0].productCode : '';
          const vehicleNo = items ? items[0].vehicleNo : '';
          const engineNo = items ? items[0].engineNo : '';
          const peripheralNo = items ? items[0].peripheralNo : '';
          mValues = {
            ...mValues,
            saleId,
            saleNo,
            productCode,
            customerId,
            prefix,
            firstName,
            lastName,
            phoneNumber,
            branchCode,
            engineNo,
            vehicleNo,
            peripheralNo
          };
          if (customer?.address) {
            const { address, moo, village, tambol, amphoe, province, postcode } = customer.address;
            mValues.address = {
              address,
              moo,
              village,
              tambol,
              amphoe,
              province,
              postcode
            };
          }
          //  showLog({ customer: customers[customerId] });
          form.setFieldsValue(mValues);
        }
        load(false);
      } catch (e) {
        showWarn(e);
        load(false);
      }
    },
    [form]
  );

  useEffect(() => {
    _getData(initSearchValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = searchValues => {
    if (!(searchValues?.searchCustomerId || searchValues?.searchSaleNo)) {
      return;
    }
    let sValues = { ...initSearchValue, ...searchValues };
    form.setFieldsValue(sValues);
    _getData(sValues);
  };

  const _onConfirm = async values => {
    try {
      load(true);
      let mValues = await form.validateFields();
      //  showLog({ values, mValues });
      let sValues = cleanValuesBeforeSave(mValues);
      delete sValues.id;
      delete sValues.searchCustomerId;
      delete sValues.searchSaleNo;
      let _key = createNewId('DLV-CUS');
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
      showSuccess(
        () => showLog('Success'),
        `บันทึกแผนการส่งรถ ${sValues.prefix}${sValues.firstName} ${sValues.lastName} สำเร็จ`
      );
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  return (
    <Form form={form} initialValues={initValues} onValuesChange={onSearch} layout="vertical" size="small">
      {values => {
        //  showLog({ values });
        return (
          <>
            <HiddenItem name="saleNo" />
            <HiddenItem name="customerId" />
            <HiddenItem name="deliverType" />
            <div className="bg-white">
              {renderHeader()}
              {renderInput(values)}
            </div>
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

export default CustomerDeliverInput;
