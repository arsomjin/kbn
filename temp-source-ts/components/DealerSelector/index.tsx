import React, { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from 'services/firebase';
import { useAntdUi } from 'hooks/useAntdUi';
import { createNewId } from 'utils/functions';
import DealerDetails from './DealerDetails';
import type { DealerFormValues } from './DealerDetails';

const { Option } = Select;

interface Dealer {
  dealerId: string;
  dealerCode: string;
  dealerName: string;
  created?: number;
  updated?: number;
  inputBy?: string;
  updateBy?: string;
  [key: string]: any;
}

interface DealerSelectorProps extends Omit<SelectProps, 'ref'> {
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  noAddable?: boolean;
  allowNotInList?: boolean;
}

const DealerSelector = forwardRef<any, DealerSelectorProps>(
  ({ onChange, placeholder, noAddable, allowNotInList, ...props }, ref) => {
    const { dealers } = useSelector((state: any) => state.data);
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

    const handleOk = async (values: DealerFormValues, type: 'add' | 'edit' | 'delete') => {
      try {
        let mDealers = JSON.parse(JSON.stringify(dealers));
        const dealersRef = collection(firestore, 'data/company/dealers');
        let dealerId: string;

        if (type === 'add') {
          dealerId = createNewId('DEAL');
          await setDoc(doc(dealersRef, dealerId), {
            ...values,
            dealerId,
            created: Date.now(),
            inputBy: user.uid
          });
          mDealers[dealerId] = {
            ...values,
            dealerId,
            created: Date.now(),
            inputBy: user.uid
          };
        } else if (type === 'edit') {
          dealerId = values.dealerId || '';
          await updateDoc(doc(dealersRef, dealerId), {
            ...values,
            dealerId,
            updated: Date.now(),
            updateBy: user.uid
          });
          mDealers[dealerId] = {
            ...values,
            dealerId,
            updated: Date.now(),
            updateBy: user.uid
          };
        } else {
          dealerId = values.dealerId || '';
          await deleteDoc(doc(dealersRef, dealerId));
          mDealers = Object.fromEntries(
            Object.entries(mDealers).filter(([_, l]: [string, any]) => l.dealerId !== dealerId)
          );
        }

        dispatch({ type: 'SET_DEALERS', payload: mDealers });
        message.success('บันทึกข้อมูลสำเร็จ');
        setShowAddNew(false);
      } catch (e) {
        message.warning((e as Error).message);
      }
    };

    const handleCancel = () => {
      setShowAddNew(false);
    };

    const Options = Object.keys(dealers).map(dl => (
      <Option key={dl} value={dl}>
        {`${dealers[dl].dealerCode} / ${dealers[dl].dealerName}`}
      </Option>
    ));

    return (
      <>
        <Select
          ref={selectRef}
          showSearch
          placeholder={placeholder || 'พิมพ์ชื่อ/รหัสผู้จำหน่าย'}
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
        {showAddNew && <DealerDetails onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />}
      </>
    );
  }
);

DealerSelector.displayName = 'DealerSelector';

export default DealerSelector;
