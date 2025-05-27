/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle, useState, useEffect } from 'react';
import { Select } from 'antd';
import { useSelector } from 'react-redux';
import { firestore, collection, doc, setDoc } from 'services/firebase';
import ExpenseSubCategoryDetails from './ExpenseSubCategoryDetails';
import { getCollection } from 'services/firebase';
import { createKeywords } from 'utils';
import { AccountNameKeywords } from 'data/Constant';
import { cleanValuesBeforeSave } from 'utils/functions';
import { useModal } from 'contexts/ModalContext';

const { Option } = Select;

const ExpenseSubCategorySelector = forwardRef(({ record, onChange, noAddable, ...props }, ref) => {
  const { user } = useSelector((state) => state.auth);
  const [showAddNew, setShowAddNew] = useState(false);
  const [data, setData] = useState([]);
  const { showWarn, showSuccess } = useModal();
  const selectRef = useRef();

  const _getData = async (category) => {
    try {
      let doc = await getCollection('data/account/expenseSubCategory', [
        ['expenseCategoryId', '==', category],
      ]);
      setData(doc);
    } catch (e) {
      showWarn(e.message || e);
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
      },
    }),
    [],
  );

  const handleChange = (value) => {
    //  showLog('select', value);
    if (value === 'addNew') {
      return showModal();
    }
    onChange && onChange(value);
  };

  const showModal = () => {
    setShowAddNew(true);
  };

  const handleOk = async (values) => {
    try {
      // Add expenseSubCategory.
      let mExpenseCategories = JSON.parse(JSON.stringify(data));
      let keywords = createKeywords(values.expenseSubCategoryId.toLowerCase());
      AccountNameKeywords.map((kw) => {
        if (values.expenseSubCategoryName.toString().indexOf(kw) > -1) {
          keywords = [...keywords, ...createKeywords(kw)];
        }
        return kw;
      });

      keywords = [...keywords, ...createKeywords(values.expenseSubCategoryName.toLowerCase())];

      let mValues = cleanValuesBeforeSave({
        ...values,
        keywords,
        deleted: false,
      });

      const expenseCategoriesRef = collection(firestore, 'data', 'account', 'expenseSubCategory');
      let expenseSubCategoryId = mValues.expenseSubCategoryId;
      await setDoc(doc(expenseCategoriesRef, expenseSubCategoryId), {
        ...mValues,
        created: Date.now(),
        inputBy: user.uid,
        expenseSubCategoryId,
      });
      mExpenseCategories[expenseSubCategoryId] = {
        ...mValues,
        expenseSubCategoryId,
        created: Date.now(),
        inputBy: user.uid,
      };
      !!record.expenseCategoryId && _getData(record.expenseCategoryId);
      // dispatch(setExpenseCategories(mExpenseCategories));
      // await api.updateData('expenseCategories', expenseSubCategoryId);
      showSuccess('บันทึกข้อมูลสำเร็จ', 3, () => setShowAddNew(false));
      setShowAddNew(false);
    } catch (e) {
      showWarn(e.message || e);
    }
  };

  const handleCancel = () => {
    setShowAddNew(false);
  };

  const Options = Object.keys(data)
    .map((k) => ({ ...data[k], _key: k }))
    .filter((l) => !l.deleted)
    .map((it) => (
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

export default ExpenseSubCategorySelector;
