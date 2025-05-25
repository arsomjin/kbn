import React, { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from 'services/firebase';
import { showWarn } from 'utils/functions';
import { createNewId } from 'utils/functions';
import ExpenseSubCategoryDetails from './ExpenseSubCategoryDetails';
import type { ExpenseSubCategoryFormValues } from './ExpenseSubCategoryDetails';
import { message } from 'hooks/useAntdUi';

const { Option } = Select;

interface ExpenseSubCategory {
  expenseSubCategoryId: string;
  expenseSubCategory: string;
  created?: number;
  updated?: number;
  inputBy?: string;
  updateBy?: string;
  [key: string]: any;
}

interface ExpenseSubCategorySelectorProps extends Omit<SelectProps, 'ref'> {
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  noAddable?: boolean;
  allowNotInList?: boolean;
}

export interface ExpenseSubCategorySelectorRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (nativeProps: any) => void;
}

const ExpenseSubCategorySelector = forwardRef<ExpenseSubCategorySelectorRef, ExpenseSubCategorySelectorProps>(
  ({ onChange, placeholder, noAddable, allowNotInList, ...props }, ref) => {
    const { expenseSubCategories } = useSelector((state: any) => state.data);
    const { user } = useSelector((state: any) => state.auth);
    const [showAddNew, setShowAddNew] = useState(false);
    const [mValue, setValue] = useState<string | string[] | null>(null);
    const [searchTxt, setSearchTxt] = useState('');

    const dispatch = useDispatch();
    const selectRef = useRef<any>(null);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          selectRef.current?.focus();
        },
        blur: () => {
          selectRef.current?.blur();
        },
        clear: () => {
          selectRef.current?.clear();
        },
        isFocused: () => {
          return selectRef.current?.isFocused() ?? false;
        },
        setNativeProps: (nativeProps: any) => {
          selectRef.current?.setNativeProps?.(nativeProps);
        }
      }),
      []
    );

    const handleChange = (value: string | string[]) => {
      if (value === 'addNew') {
        return showModal();
      }
      setValue(value);
      onChange?.(value);
    };

    const handleSearch = (txt: string) => {
      setSearchTxt(txt);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' && allowNotInList) {
        if (['multiple', 'tags'].includes(props.mode || '')) {
          handleChange(Array.isArray(mValue) ? [...mValue, searchTxt] : [searchTxt]);
          setValue([]);
        } else {
          handleChange(searchTxt);
        }
      }
    };

    const showModal = () => {
      setShowAddNew(true);
    };

    const handleOk = async (values: ExpenseSubCategoryFormValues, type: 'add' | 'edit' | 'delete') => {
      try {
        let mExpenseSubCategories = JSON.parse(JSON.stringify(expenseSubCategories));
        const expenseSubCategoriesRef = collection(firestore, 'data/company/expenseSubCategories');
        let expenseSubCategoryId: string;

        if (type === 'add') {
          expenseSubCategoryId = createNewId('EXPS');
          await setDoc(doc(expenseSubCategoriesRef, expenseSubCategoryId), {
            ...values,
            expenseSubCategoryId,
            created: Date.now(),
            inputBy: user.uid
          });
          mExpenseSubCategories[expenseSubCategoryId] = {
            ...values,
            expenseSubCategoryId,
            created: Date.now(),
            inputBy: user.uid
          };
        } else if (type === 'edit') {
          expenseSubCategoryId = values.expenseSubCategoryId || '';
          await updateDoc(doc(expenseSubCategoriesRef, expenseSubCategoryId), {
            ...values,
            expenseSubCategoryId,
            updated: Date.now(),
            updateBy: user.uid
          });
          mExpenseSubCategories[expenseSubCategoryId] = {
            ...values,
            expenseSubCategoryId,
            updated: Date.now(),
            updateBy: user.uid
          };
        } else {
          expenseSubCategoryId = values.expenseSubCategoryId || '';
          await deleteDoc(doc(expenseSubCategoriesRef, expenseSubCategoryId));
          mExpenseSubCategories = Object.fromEntries(
            Object.entries(mExpenseSubCategories).filter(
              ([_, l]: [string, any]) => l.expenseSubCategoryId !== expenseSubCategoryId
            )
          );
        }

        dispatch({ type: 'SET_EXPENSE_SUB_CATEGORIES', payload: mExpenseSubCategories });
        message.success('บันทึกข้อมูลสำเร็จ');
        setShowAddNew(false);
      } catch (e) {
        showWarn((e as Error).message);
      }
    };

    const handleCancel = () => {
      setShowAddNew(false);
    };

    const Options = Object.keys(expenseSubCategories).map(it => (
      <Option key={it} value={it}>
        {expenseSubCategories[it].expenseSubCategory}
      </Option>
    ));

    return (
      <>
        <Select
          ref={selectRef}
          showSearch
          placeholder={placeholder || 'พิมพ์ชื่อหมวดหมู่ย่อยรายจ่าย'}
          optionFilterProp='children'
          filterOption={(input, option) => {
            if (!option || !option.children) return false;
            return option.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0;
          }}
          onChange={handleChange}
          onSearch={handleSearch}
          onKeyDown={handleKeyDown}
          dropdownStyle={{ minWidth: 340 }}
          {...props}
        >
          {Options}
          {!noAddable && (
            <Option key='addNew' value='addNew' className='text-light'>
              เพิ่ม/แก้ไข รายชื่อ...
            </Option>
          )}
        </Select>
        {showAddNew && <ExpenseSubCategoryDetails onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />}
      </>
    );
  }
);

ExpenseSubCategorySelector.displayName = 'ExpenseSubCategorySelector';

export default ExpenseSubCategorySelector;
