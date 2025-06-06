/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle, useContext, useState, useEffect } from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { FirebaseContext } from '../../firebase';
import { showSuccess } from 'functions';
import { showWarn } from 'functions';
import ServiceDetails from './ServiceDetails';
import { getCollection } from 'firebase/api';
import { createKeywords } from 'utils';
import { ServiceNameKeywords } from 'data/Constant';
import { cleanValuesBeforeSave } from 'functions';

const { Option } = Select;

export default forwardRef(({ onChange, placeholder, noAddable, ...props }, ref) => {
  const { api, firestore } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const [showAddNew, setShowAddNew] = useState(false);
  const [data, setData] = useState(null);

  const dispatch = useDispatch();
  const selectRef = useRef();

  const _getData = async () => {
    try {
      let doc = await getCollection('data/services/serviceList');
      setData(doc);
    } catch (e) {
      showWarn(e);
    }
  };

  useEffect(() => {
    _getData();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        selectRef.current.focus();
      },

      blur: () => {
        selectRef.current.blur();
      },

      clear: () => {
        selectRef.current.clear();
      },

      isFocused: () => {
        return selectRef.current.isFocused();
      },

      setNativeProps(nativeProps) {
        selectRef.current.setNativeProps(nativeProps);
      }
    }),
    []
  );

  const handleChange = value => {
    //  showLog('select', value);
    if (value === 'addNew') {
      return showModal();
    }
    onChange && onChange(value);
  };

  const showModal = () => {
    setShowAddNew(true);
  };

  const handleOk = async values => {
    try {
      // Add service.
      let mServices = JSON.parse(JSON.stringify(data));
      let keywords = createKeywords(values.serviceCode);
      ServiceNameKeywords.map(kw => {
        if (values.name.toString().toLowerCase().indexOf(kw) > -1) {
          keywords = [...keywords, ...createKeywords(kw)];
        }
        return kw;
      });

      keywords = [...keywords, ...createKeywords(values.name)];

      let mValues = cleanValuesBeforeSave({ ...values, keywords });

      const expenseCategoriesRef = firestore.collection('data').doc('services').collection('serviceList');
      let serviceCode = mValues.serviceCode;
      await expenseCategoriesRef.doc(serviceCode).set({
        ...mValues,
        created: Date.now(),
        inputBy: user.uid,
        serviceCode
      });
      mServices[serviceCode] = {
        ...mValues,
        serviceCode,
        created: Date.now(),
        inputBy: user.uid
      };
      _getData();
      // dispatch(setServices(mServices));
      // await api.updateData('expenseCategories', serviceCode);
      showSuccess(() => setShowAddNew(false), 'บันทึกข้อมูลสำเร็จ');
      setShowAddNew(false);
    } catch (e) {
      showWarn(e);
    }
  };

  const handleCancel = () => {
    setShowAddNew(false);
  };

  if (!data) {
    return null;
  }

  const Options = Object.keys(data)
    .map(k => ({ ...data[k], _key: k }))
    .filter(l => !l.deleted)
    .map(it => (
      <Option key={it._key} value={it._key}>
        {it.name}
      </Option>
    ));

  return (
    <>
      <Select
        ref={selectRef}
        placeholder="รายการ"
        optionFilterProp="children"
        filterOption={(input, option) => {
          return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
        onChange={handleChange}
        dropdownStyle={{ minWidth: 280 }}
        {...props}
      >
        {Options}
        {!noAddable && (
          <Option key="addNew" value="addNew" className="text-light">
            เพิ่มรายการ...
          </Option>
        )}
      </Select>
      <ServiceDetails onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />
    </>
  );
});
