import React, { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { message } from 'antd';
import { setDealers } from '../../store/slices/dataSlice';
import { createNewId } from '../../utils';
import { Dealer, DealerSelectorProps } from '../../types/dealer';
import DealerDetails from './DealerDetails';
import { collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { useAntdUi } from '../../hooks/useAntdUi';

const { Option } = Select;

interface RootState {
  data: {
    dealers: Record<string, Dealer>;
  };
  auth: {
    user: {
      uid: string;
    };
  };
}

const DealerSelector = forwardRef<any, DealerSelectorProps>(
  ({ onChange, placeholder, noAddable, allowNotInList, ...props }, ref) => {
    const firestore = getFirestore(getApp());
    const { dealers } = useSelector((state: RootState) => state.data);
    const { user } = useSelector((state: RootState) => state.auth);
    const [showAddNew, setShowAddNew] = useState(false);
    const [mValue, setValue] = useState<string | string[] | null>(null);
    const [searchTxt, setSearchTxt] = useState('');

    const dispatch = useDispatch();
    const selectRef = useRef<any>(null);
    const { message } = useAntdUi();

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
          return selectRef.current?.isFocused();
        },
        setNativeProps(nativeProps: any) {
          selectRef.current?.setNativeProps(nativeProps);
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
        if (['multiple', 'tags'].includes(props.mode as string)) {
          handleChange(!!mValue ? [...(mValue as string[]), searchTxt] : [searchTxt]);
          setValue([]);
        } else {
          handleChange(searchTxt);
        }
      }
    };

    const showModal = () => {
      setShowAddNew(true);
    };

    const handleOk = async (values: Dealer, type: 'add' | 'edit' | 'delete') => {
      try {
        let mDealers = JSON.parse(JSON.stringify(dealers));
        const dealersRef = collection(firestore, 'data', 'sales', 'dealers');
        let dealerId = type === 'add' ? createNewId('DEAL') : values.dealerId;

        if (type === 'add') {
          await setDoc(doc(dealersRef, dealerId), {
            ...values,
            created: Date.now(),
            inputBy: user.uid,
            dealerId
          });
          mDealers[dealerId] = {
            ...values,
            dealerId,
            created: Date.now(),
            inputBy: user.uid
          };
        } else if (type === 'edit') {
          await updateDoc(doc(dealersRef, values.dealerId), {
            ...values,
            updated: Date.now(),
            updateBy: user.uid
          });
          mDealers[values.dealerId] = {
            ...values,
            updated: Date.now(),
            updateBy: user.uid
          };
        } else {
          await deleteDoc(doc(dealersRef, values.dealerId));
          mDealers = mDealers.filter((l: Dealer) => l.dealerId !== values.dealerId);
        }

        dispatch(setDealers(mDealers));
        message.success('บันทึกข้อมูลสำเร็จ');
        setShowAddNew(false);
      } catch (e) {
        message.warning(e instanceof Error ? e.message : String(e));
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
          filterOption={(input: string, option: any) => {
            return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
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
