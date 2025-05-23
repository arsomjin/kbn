import React, { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from 'services/firebase';
import { createNewId } from 'utils/functions';
import { useAntdUi } from 'hooks/useAntdUi';
import ExecutiveDetails, { ExecutiveFormValues } from './ExecutiveDetails';

const { Option } = Select;

interface Executive {
  executiveId: string;
  executiveCode: string;
  executiveName: string;
  created?: number;
  updated?: number;
  inputBy?: string;
  updateBy?: string;
  [key: string]: any;
}

interface ExecutiveSelectorProps extends Omit<SelectProps, 'ref'> {
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  noAddable?: boolean;
  allowNotInList?: boolean;
}

export interface ExecutiveSelectorRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (nativeProps: any) => void;
}

const ExecutiveSelector = forwardRef<ExecutiveSelectorRef, ExecutiveSelectorProps>(
  ({ onChange, placeholder, noAddable, allowNotInList, ...props }, ref) => {
    const { executives } = useSelector((state: any) => state.data);
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

    const handleOk = async (values: ExecutiveFormValues, type: 'add' | 'edit' | 'delete') => {
      try {
        let mExecutives = JSON.parse(JSON.stringify(executives));
        const executivesRef = collection(firestore, 'data/company/executives');
        let executiveId: string;

        if (type === 'add') {
          executiveId = createNewId('EXEC');
          await setDoc(doc(executivesRef, executiveId), {
            ...values,
            executiveId,
            created: Date.now(),
            inputBy: user.uid
          });
          mExecutives[executiveId] = {
            ...values,
            executiveId,
            created: Date.now(),
            inputBy: user.uid
          };
        } else if (type === 'edit') {
          executiveId = values.executiveId || '';
          await updateDoc(doc(executivesRef, executiveId), {
            ...values,
            executiveId,
            updated: Date.now(),
            updateBy: user.uid
          });
          mExecutives[executiveId] = {
            ...values,
            executiveId,
            updated: Date.now(),
            updateBy: user.uid
          };
        } else {
          executiveId = values.executiveId || '';
          await deleteDoc(doc(executivesRef, executiveId));
          mExecutives = Object.fromEntries(
            Object.entries(mExecutives).filter(([_, l]: [string, any]) => l.executiveId !== executiveId)
          );
        }

        dispatch({ type: 'SET_EXECUTIVES', payload: mExecutives });
        message.success('บันทึกข้อมูลสำเร็จ');
        setShowAddNew(false);
      } catch (e) {
        message.warning((e as Error).message);
      }
    };

    const handleCancel = () => {
      setShowAddNew(false);
    };

    const Options = Object.keys(executives).map(it => (
      <Option key={it} value={it}>
        {`${executives[it].executiveCode} / ${executives[it].executiveName}`}
      </Option>
    ));

    return (
      <>
        <Select
          ref={selectRef}
          showSearch
          placeholder={placeholder || 'พิมพ์ชื่อ/รหัสผู้บริหาร'}
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
        {showAddNew && <ExecutiveDetails onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />}
      </>
    );
  }
);

ExecutiveSelector.displayName = 'ExecutiveSelector';

export default ExecutiveSelector;
