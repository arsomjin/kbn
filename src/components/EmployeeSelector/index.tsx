import React, { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from 'services/firebase';
import { useAntdUi } from 'hooks/useAntdUi';
import { createNewId } from 'utils/functions';
import EmployeeDetails from './EmployeeDetails';
import type { EmployeeFormValues } from './types';

const { Option } = Select;

interface Employee {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  created?: number;
  updated?: number;
  inputBy?: string;
  updateBy?: string;
  [key: string]: any;
}

interface EmployeeSelectorProps extends Omit<SelectProps, 'ref'> {
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  noAddable?: boolean;
  allowNotInList?: boolean;
}

export interface EmployeeSelectorRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (nativeProps: any) => void;
}

const EmployeeSelector = forwardRef<EmployeeSelectorRef, EmployeeSelectorProps>(
  ({ onChange, placeholder, noAddable = true, allowNotInList, ...props }, ref) => {
    const employees = useSelector((state: any) => state.employees?.employees || {});
    const { user } = useSelector((state: any) => state.auth);
    const [showAddNew, setShowAddNew] = useState(false);
    const [mValue, setValue] = useState<string | string[] | null>(null);
    const [searchTxt, setSearchTxt] = useState('');
    const { message } = useAntdUi();

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

    const handleOk = async (values: EmployeeFormValues, type: 'add' | 'edit' | 'delete') => {
      try {
        let mEmployees = JSON.parse(JSON.stringify(employees));
        const employeesRef = collection(firestore, 'data/company/employees');
        let employeeId: string;

        if (type === 'add') {
          employeeId = createNewId('EMP');
          await setDoc(doc(employeesRef, employeeId), {
            ...values,
            employeeId,
            created: Date.now(),
            inputBy: user.uid
          });
          mEmployees[employeeId] = {
            ...values,
            employeeId,
            created: Date.now(),
            inputBy: user.uid
          };
        } else if (type === 'edit') {
          employeeId = values.employeeId || '';
          await updateDoc(doc(employeesRef, employeeId), {
            ...values,
            employeeId,
            updated: Date.now(),
            updateBy: user.uid
          });
          mEmployees[employeeId] = {
            ...values,
            employeeId,
            updated: Date.now(),
            updateBy: user.uid
          };
        } else {
          employeeId = values.employeeId || '';
          await deleteDoc(doc(employeesRef, employeeId));
          mEmployees = Object.fromEntries(
            Object.entries(mEmployees).filter(([_, l]: [string, any]) => l.employeeId !== employeeId)
          );
        }

        dispatch({ type: 'SET_EMPLOYEES', payload: mEmployees });
        message.success('บันทึกข้อมูลสำเร็จ');
        setShowAddNew(false);
      } catch (e) {
        message.warning((e as Error).message);
      }
    };

    const handleCancel = () => {
      setShowAddNew(false);
    };

    const safeEmployees = employees || {};
    const Options = Object.keys(safeEmployees).map(it => (
      <Option key={it} value={it}>
        {`${safeEmployees[it].employeeCode} / ${safeEmployees[it].firstName} ${safeEmployees[it].lastName}`}
      </Option>
    ));

    return (
      <>
        <Select
          ref={selectRef}
          showSearch
          placeholder={placeholder || 'พิมพ์ชื่อ/รหัสพนักงาน'}
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
        {showAddNew && <EmployeeDetails onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />}
      </>
    );
  }
);

EmployeeSelector.displayName = 'EmployeeSelector';

export default EmployeeSelector;
