/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle, useContext, useState, useEffect } from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { FirebaseContext } from '../../firebase';
import { showSuccess } from 'functions';
import { showWarn } from 'functions';
import ExpenseNameDetails from './ExpenseNameDetails';
import { createNewId } from 'utils';
import { getCollection } from 'firebase/api';
import { createKeywords } from 'utils';
import { AccountNameKeywords } from 'data/Constant';
import { cleanValuesBeforeSave } from 'functions';
import { Input } from 'elements';
import { checkDoc } from 'firebase/api';

const { Option } = Select;

export default forwardRef(({ record, onChange, placeholder, ...props }, ref) => {
  const { api, firestore } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const [showAddNew, setShowAddNew] = useState(false);
  const [data, setData] = useState(null);
  const [initDoc, setInitDoc] = useState(null);

  const dispatch = useDispatch();
  const selectRef = useRef();

  const _getData = async category => {
    try {
      let doc = await getCollection('data/account/expenseName', [['expenseCategoryId', '==', category]]);
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
    setInitDoc({
      expenseNameId: createNewId('ACC-NAME'),
      expenseCategoryId: record.expenseCategoryId,
      expenseSubCategoryId: record.expenseSubCategoryId
    });
    setShowAddNew(true);
  };

  const handleOk = async values => {
    try {
      // Add expenseName.
      let mExpenseCategories = JSON.parse(JSON.stringify(data));
      let keywords = [];
      AccountNameKeywords.map(kw => {
        if (values.expenseName.toString().indexOf(kw) > -1) {
          keywords = [...keywords, ...createKeywords(kw)];
        }
        return kw;
      });

      keywords = [...keywords, ...createKeywords(values.expenseName.toLowerCase())];

      let expenseCategoryName = values.expenseCategoryName;
      let expenseSubCategoryName = values.expenseSubCategoryName;
      if (!expenseCategoryName && !!values.expenseCategoryId) {
        let catDoc = await checkDoc('data', `account/expenseCategory/${values.expenseCategoryId}`);
        if (!!catDoc) {
          expenseCategoryName = catDoc.data().expenseCategoryName;
          keywords = [...keywords, ...catDoc.data().keywords];
        }
      }

      if (!expenseSubCategoryName && !!values.expenseSubCategoryId) {
        let subCatDoc = await checkDoc('data', `account/expenseSubCategory/${values.expenseSubCategoryId}`);
        if (!!subCatDoc) {
          expenseSubCategoryName = subCatDoc.data().expenseSubCategoryName;
          keywords = [...keywords, ...subCatDoc.data().keywords];
        }
      }

      let mValues = cleanValuesBeforeSave({
        ...values,
        expenseCategoryName,
        expenseSubCategoryName,
        keywords,
        deleted: false
      });

      const expenseCategoriesRef = firestore.collection('data').doc('account').collection('expenseName');
      let expenseNameId = mValues.expenseNameId;
      await expenseCategoriesRef.doc(expenseNameId).set({
        ...mValues,
        created: Date.now(),
        inputBy: user.uid,
        expenseNameId
      });
      mExpenseCategories[expenseNameId] = {
        ...mValues,
        expenseNameId,
        created: Date.now(),
        inputBy: user.uid
      };
      !!record.expenseCategoryId && _getData(record.expenseCategoryId);
      // dispatch(setExpenseCategories(mExpenseCategories));
      // await api.updateData('expenseCategories', expenseNameId);
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
    return <Input readOnly placeholder="เลือกหมวดรายจ่าย" />;
  }

  const Options = Object.keys(data)
    .map(k => ({ ...data[k], _key: k }))
    .filter(l => !l.deleted)
    .map(it => (
      <Option key={it._key} value={it._key}>
        {`${it.expenseName}${!!it.expenseSubCategoryName ? ` (${it.expenseSubCategoryName})` : ''}`}
      </Option>
    ));

  return (
    <>
      <Select
        ref={selectRef}
        placeholder="ชื่อบัญชี"
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) => {
          return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
        onChange={handleChange}
        dropdownStyle={{ minWidth: 280 }}
        {...props}
      >
        {Options}
        <Option key="addNew" value="addNew" className="text-light">
          เพิ่มชื่อบัญชี...
        </Option>
      </Select>
      <ExpenseNameDetails initDoc={initDoc} onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />
    </>
  );
});
