import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { Select } from 'antd';
import { useSelector } from 'react-redux';
import { useModal } from '../../contexts/ModalContext';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import ExpenseNameDetails from './ExpenseNameDetails';
import { createNewId } from 'utils';
import { createKeywords } from 'utils';
import { AccountNameKeywords } from 'data/Constant';
import { cleanValuesBeforeSave } from 'utils/functions';
import { Input } from 'elements';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

export default forwardRef(({ record, onChange, placeholder, ...props }, ref) => {
  const { t } = useTranslation('components');
  const { showSuccess, showWarning } = useModal();
  const { user } = useSelector((state) => state.auth);
  const [showAddNew, setShowAddNew] = useState(false);
  const [data, setData] = useState(null);
  const [initDoc, setInitDoc] = useState(null);
  const firestore = getFirestore();
  const selectRef = useRef();

  const _getData = useCallback(
    async (category) => {
      try {
        const q = query(
          collection(firestore, 'data', 'account', 'expenseName'),
          where('expenseCategoryId', '==', category),
        );
        const snap = await getDocs(q);
        const docData = {};
        snap.forEach((docSnap) => {
          docData[docSnap.id] = docSnap.data();
        });
        setData(docData);
      } catch (e) {
        showWarning(e.message || t('common.error'));
      }
    },
    [firestore, showWarning, t],
  );

  useEffect(() => {
    if (record.expenseCategoryId) _getData(record.expenseCategoryId);
  }, [record.expenseCategoryId, _getData]);

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
    if (value === 'addNew') {
      return showModal();
    }
    onChange && onChange(value);
  };

  const showModal = () => {
    setInitDoc({
      expenseNameId: createNewId('ACC-NAME'),
      expenseCategoryId: record.expenseCategoryId,
      expenseSubCategoryId: record.expenseSubCategoryId,
    });
    setShowAddNew(true);
  };

  const handleOk = async (values) => {
    try {
      let mExpenseCategories = data ? JSON.parse(JSON.stringify(data)) : {};
      let keywords = [];
      AccountNameKeywords.map((kw) => {
        if (values.expenseName.toString().indexOf(kw) > -1) {
          keywords = [...keywords, ...createKeywords(kw)];
        }
        return kw;
      });
      keywords = [...keywords, ...createKeywords(values.expenseName.toLowerCase())];
      let expenseCategoryName = values.expenseCategoryName;
      let expenseSubCategoryName = values.expenseSubCategoryName;
      if (!expenseCategoryName && !!values.expenseCategoryId) {
        const catDocRef = doc(
          firestore,
          'data',
          'account',
          'expenseCategory',
          values.expenseCategoryId,
        );
        const catDoc = await getDoc(catDocRef);
        if (catDoc.exists()) {
          expenseCategoryName = catDoc.data().expenseCategoryName;
          keywords = [...keywords, ...(catDoc.data().keywords || [])];
        }
      }
      if (!expenseSubCategoryName && !!values.expenseSubCategoryId) {
        const subCatDocRef = doc(
          firestore,
          'data',
          'account',
          'expenseSubCategory',
          values.expenseSubCategoryId,
        );
        const subCatDoc = await getDoc(subCatDocRef);
        if (subCatDoc.exists()) {
          expenseSubCategoryName = subCatDoc.data().expenseSubCategoryName;
          keywords = [...keywords, ...(subCatDoc.data().keywords || [])];
        }
      }
      let mValues = cleanValuesBeforeSave({
        ...values,
        expenseCategoryName,
        expenseSubCategoryName,
        keywords,
        deleted: false,
      });
      const expenseCategoriesRef = doc(
        firestore,
        'data',
        'account',
        'expenseName',
        mValues.expenseNameId,
      );
      await setDoc(expenseCategoriesRef, {
        ...mValues,
        created: Date.now(),
        inputBy: user.uid,
        expenseNameId: mValues.expenseNameId,
      });
      mExpenseCategories[mValues.expenseNameId] = {
        ...mValues,
        expenseNameId: mValues.expenseNameId,
        created: Date.now(),
        inputBy: user.uid,
      };
      if (record.expenseCategoryId) _getData(record.expenseCategoryId);
      showSuccess(t('expenseNameSelector.saveSuccess', 'บันทึกข้อมูลสำเร็จ'));
      setShowAddNew(false);
    } catch (e) {
      showWarning(e.message || t('common.error'));
    }
  };

  const handleCancel = () => {
    setShowAddNew(false);
  };

  if (!data) {
    return (
      <Input readOnly placeholder={t('expenseNameSelector.selectCategory', 'เลือกหมวดรายจ่าย')} />
    );
  }

  const Options = Object.keys(data)
    .map((k) => ({ ...data[k], _key: k }))
    .filter((l) => !l.deleted)
    .map((it) => (
      <Option key={it._key} value={it._key}>
        {`${it.expenseName}${it.expenseSubCategoryName ? ` (${it.expenseSubCategoryName})` : ''}`}
      </Option>
    ));

  return (
    <>
      <Select
        ref={selectRef}
        placeholder={placeholder || t('expenseNameSelector.placeholder', 'ชื่อบัญชี')}
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
          {t('expenseNameSelector.addNew', 'เพิ่มชื่อบัญชี...')}
        </Option>
      </Select>
      <ExpenseNameDetails
        initDoc={initDoc}
        onOk={handleOk}
        onCancel={handleCancel}
        visible={showAddNew}
      />
    </>
  );
});
