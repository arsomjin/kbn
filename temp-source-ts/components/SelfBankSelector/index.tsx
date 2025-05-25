import React, { useRef, forwardRef, useState, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import BankDetails from './BankDetails';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { useAntdUi } from '../../hooks/useAntdUi';
import { createNewId } from 'utils/functions';
import { setBanks } from 'store/slices/dataSlice';
import { app } from 'services/firebase';
import { sortArr } from 'utils/functions';
import { RootState } from 'store';

const { Option } = Select;

interface Bank {
  bankId: string;
  bankName: string;
  accNo: string;
  name: string;
  branch?: string;
  created?: number;
  inputBy?: string;
  order?: number;
}

interface SelfBankSelectorProps {
  onChange?: (value: string) => void;
  placeholder?: string;
  [key: string]: any;
}

interface SelfBankSelectorRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (nativeProps: any) => void;
}

const SelfBankSelector = forwardRef<SelfBankSelectorRef, SelfBankSelectorProps>(
  ({ onChange, placeholder, ...props }, ref) => {
    const firestore = getFirestore(app);
    const { banks } = useSelector((state: RootState) => state.data);
    const { user } = useSelector((state: RootState) => state.auth);
    const [showAddNew, setShowAddNew] = useState(false);
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
          return selectRef.current?.isFocused();
        },

        setNativeProps(nativeProps: any) {
          selectRef.current?.setNativeProps(nativeProps);
        }
      }),
      []
    );

    const handleChange = (value: string) => {
      if (value === 'addNew') {
        return showModal();
      }
      onChange && onChange(value);
    };

    const showModal = () => {
      setShowAddNew(true);
    };

    const handleOk = async (values: Omit<Bank, 'bankId' | 'created' | 'inputBy'>) => {
      try {
        let mBanks = { ...banks };
        const banksRef = collection(firestore, 'data', 'company', 'banks');
        let bankId = createNewId('BANK');

        const newBank: Bank = {
          ...values,
          bankId,
          created: Date.now(),
          inputBy: user?.uid || ''
        };

        // Add the bank document to Firestore
        await setDoc(doc(banksRef, bankId), newBank);

        // Update local state
        mBanks[bankId] = newBank;
        dispatch(setBanks(mBanks));

        message.success('บันทึกข้อมูลสำเร็จ');
        setShowAddNew(false);
      } catch (e) {
        message.warning(e instanceof Error ? e.message : String(e));
      }
    };

    const handleCancel = () => {
      setShowAddNew(false);
    };

    const banksList = Object.keys(banks)
      .map(bankId => ({
        ...banks[bankId],
        bankId
      }))
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

    return (
      <>
        <Select
          ref={selectRef}
          showSearch
          placeholder={placeholder || 'ธนาคาร'}
          optionFilterProp='children'
          filterOption={(input, option) => {
            const childText = option?.children ? String(option.children).toLowerCase() : '';
            return childText.indexOf(input.toLowerCase()) >= 0;
          }}
          onChange={handleChange}
          dropdownStyle={{ minWidth: 440 }}
          {...props}
        >
          {banksList.map(bank => (
            <Option key={bank.bankId} value={bank.bankId}>
              {`${bank.bankName} - ${bank.accNo} - ${bank.name}`}
            </Option>
          ))}
          {/* <Option key="addNew" value="addNew" className="text-light">
          เพิ่มรายการ...
        </Option> */}
        </Select>
        <BankDetails onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />
      </>
    );
  }
);

SelfBankSelector.displayName = 'SelfBankSelector';

export default SelfBankSelector;
