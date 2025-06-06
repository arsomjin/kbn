/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle, useContext, useState, useEffect } from 'react';
import { Select } from 'antd';
import { useSelector } from 'react-redux';
import { FirebaseContext } from '../../firebase';
import { showSuccess } from 'functions';
import { showWarn } from 'functions';
import ExpenseCategoryDetails from './ExpenseCategoryDetails';
import { getCollection } from 'firebase/api';
import { createKeywords } from 'utils';
import { AccountNameKeywords } from 'data/Constant';
import { cleanValuesBeforeSave } from 'functions';

const { Option } = Select;

export default forwardRef(({ onChange, placeholder, noAddable, ...props }, ref) => {
  const { api, firestore } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const [showAddNew, setShowAddNew] = useState(false);
  const [data, setData] = useState(null);

  const selectRef = useRef();

  const _getData = async () => {
    try {
      let doc = await getCollection('data/account/expenseCategory', [['deleted', '==', false]]);
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
      // Add expenseCategory.
      let mExpenseCategories = JSON.parse(JSON.stringify(data));
      let keywords = createKeywords(values.expenseCategoryId);
      AccountNameKeywords.map(kw => {
        if (values.expenseCategoryName.toString().indexOf(kw) > -1) {
          keywords = [...keywords, ...createKeywords(kw)];
        }
        return kw;
      });

      keywords = [...keywords, ...createKeywords(values.expenseCategoryName)];

      let mValues = cleanValuesBeforeSave({ ...values, keywords });

      const expenseCategoriesRef = firestore.collection('data').doc('account').collection('expenseCategory');
      let expenseCategoryId = mValues.expenseCategoryId;
      await expenseCategoriesRef.doc(expenseCategoryId).set({
        ...mValues,
        created: Date.now(),
        inputBy: user.uid,
        expenseCategoryId
      });
      mExpenseCategories[expenseCategoryId] = {
        ...mValues,
        expenseCategoryId,
        created: Date.now(),
        inputBy: user.uid
      };
      _getData();
      // dispatch(setExpenseCategories(mExpenseCategories));
      // await api.updateData('expenseCategories', expenseCategoryId);
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
        {it.expenseCategoryName}
      </Option>
    ));

  return (
    <>
      <Select
        ref={selectRef}
        placeholder="หมวดรายจ่าย"
        optionFilterProp="children"
        filterOption={(input, option) => {
          return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
        onChange={handleChange}
        dropdownStyle={{ minWidth: 280 }}
        showSearch
        {...props}
      >
        {Options}
        {!noAddable && (
          <Option key="addNew" value="addNew" className="text-light">
            เพิ่มหมวดรายจ่าย...
          </Option>
        )}
      </Select>
      <ExpenseCategoryDetails onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />
    </>
  );
});
