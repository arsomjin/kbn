/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle, useContext, useState, useEffect } from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { FirebaseContext } from '../../firebase';
import { showSuccess } from 'functions';
import { showWarn } from 'functions';
import ExpenseSubCategoryDetails from './ExpenseSubCategoryDetails';
import { getCollection } from 'firebase/api';
import { createKeywords } from 'utils';
import { AccountNameKeywords } from 'data/Constant';
import { cleanValuesBeforeSave } from 'functions';

const { Option } = Select;

export default forwardRef(({ record, onChange, noAddable, placeholder, ...props }, ref) => {
  const { api, firestore } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const [showAddNew, setShowAddNew] = useState(false);
  const [data, setData] = useState([]);

  const dispatch = useDispatch();
  const selectRef = useRef();

  const _getData = async category => {
    try {
      let doc = await getCollection('data/account/expenseSubCategory', [['expenseCategoryId', '==', category]]);
      setData(doc);
    } catch (e) {
      showWarn(e);
    }
  };

  useEffect(() => {
    !!record.expenseCategoryId && _getData(record.expenseCategoryId);
  }, [record.expenseCategoryId]);

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
      // Add expenseSubCategory.
      let mExpenseCategories = JSON.parse(JSON.stringify(data));
      let keywords = createKeywords(values.expenseSubCategoryId.toLowerCase());
      AccountNameKeywords.map(kw => {
        if (values.expenseSubCategoryName.toString().indexOf(kw) > -1) {
          keywords = [...keywords, ...createKeywords(kw)];
        }
        return kw;
      });

      keywords = [...keywords, ...createKeywords(values.expenseSubCategoryName.toLowerCase())];

      let mValues = cleanValuesBeforeSave({
        ...values,
        keywords,
        deleted: false
      });

      const expenseCategoriesRef = firestore.collection('data').doc('account').collection('expenseSubCategory');
      let expenseSubCategoryId = mValues.expenseSubCategoryId;
      await expenseCategoriesRef.doc(expenseSubCategoryId).set({
        ...mValues,
        created: Date.now(),
        inputBy: user.uid,
        expenseSubCategoryId
      });
      mExpenseCategories[expenseSubCategoryId] = {
        ...mValues,
        expenseSubCategoryId,
        created: Date.now(),
        inputBy: user.uid
      };
      !!record.expenseCategoryId && _getData(record.expenseCategoryId);
      // dispatch(setExpenseCategories(mExpenseCategories));
      // await api.updateData('expenseCategories', expenseSubCategoryId);
      showSuccess(() => setShowAddNew(false), 'บันทึกข้อมูลสำเร็จ');
      setShowAddNew(false);
    } catch (e) {
      showWarn(e);
    }
  };

  const handleCancel = () => {
    setShowAddNew(false);
  };

  const Options = Object.keys(data)
    .map(k => ({ ...data[k], _key: k }))
    .filter(l => !l.deleted)
    .map(it => (
      <Option key={it._key} value={it._key}>
        {it.expenseSubCategoryName}
      </Option>
    ));

  return (
    <>
      <Select
        ref={selectRef}
        placeholder="หมวดย่อยรายจ่าย"
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
            เพิ่มหมวดย่อย...
          </Option>
        )}
      </Select>
      <ExpenseSubCategoryDetails
        initDoc={{ expenseCategoryId: record.expenseCategoryId }}
        onOk={handleOk}
        onCancel={handleCancel}
        visible={showAddNew}
      />
    </>
  );
});
