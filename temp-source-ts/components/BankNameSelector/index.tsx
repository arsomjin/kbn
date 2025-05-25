import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import BankNameDetails from './BankNameDetails';
import { firestore } from 'services/firebase';
import { useAntdUi } from 'hooks/useAntdUi';
import { createNewId } from 'utils';
import type { SelectProps } from 'antd';
import type { RootState } from 'store';
import { useLoading } from 'hooks/useLoading';
import { collection, doc, setDoc } from 'firebase/firestore';

const { Option } = Select;

interface BankNameSelectorProps extends Omit<SelectProps<string>, 'onChange'> {
  onChange?: (value: string) => void;
}

interface BankName {
  name: string;
  remark?: string | null;
  created: number;
  inputBy: string;
  bankNameId: string;
}

interface BankNamesState {
  [key: string]: BankName;
}

const BankNameSelector = forwardRef<any, BankNameSelectorProps>(({ onChange, placeholder, ...props }, ref) => {
  const bankNames = useSelector((state: RootState) => (state as any).data?.bankNames as BankNamesState);
  const user = useSelector((state: RootState) => state.auth.user);
  const [showAddNew, setShowAddNew] = useState(false);
  const dispatch = useDispatch();
  const selectRef = useRef<any>(null);
  const { setLoading } = useLoading();
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
        selectRef.current?.blur(); // AntD Select does not have clear method by default
      },
      isFocused: () => {
        // Not directly available; fallback to document.activeElement check
        return document.activeElement === selectRef.current?.getInputElement?.();
      },
      setNativeProps: (_nativeProps: any) => {
        // Not applicable in web/AntD
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

  const handleOk = async (values: { name: string; remark?: string | null }) => {
    if (!user) {
      message.warning('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      let mBankNames = { ...bankNames };
      const bankNameId = createNewId('BANK');
      const bankNameData = {
        ...values,
        created: Date.now(),
        inputBy: user.uid,
        bankNameId
      };

      // Add to Firestore
      const bankNamesRef = collection(firestore, 'data', 'company', 'bankNames');
      await setDoc(doc(bankNamesRef, bankNameId), bankNameData);

      // Update local state
      mBankNames[bankNameId] = bankNameData;
      dispatch({ type: 'SET_BANK_NAMES', payload: mBankNames });

      setLoading(false);
      message.success('บันทึกข้อมูลสำเร็จ');
      setShowAddNew(false);
    } catch (e) {
      message.warning(e instanceof Error ? e.message : String(e));
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowAddNew(false);
  };

  const Options = Object.keys(bankNames || {}).map(dl => (
    <Option key={dl} value={bankNames[dl].name}>
      {bankNames[dl].name}
    </Option>
  ));

  return (
    <>
      <Select
        ref={selectRef}
        style={{ width: '100%' }}
        showArrow
        placeholder={placeholder || 'ชื่อธนาคาร'}
        optionFilterProp='children'
        onChange={handleChange}
        showSearch
        filterOption={(input, option) => {
          const children = option?.children?.toString().toLowerCase() || '';
          return children.indexOf(input.toLowerCase()) >= 0;
        }}
        {...props}
      >
        {Options}
        <Option key='addNew' value='addNew' className='text-light'>
          เพิ่มรายการ...
        </Option>
      </Select>
      <BankNameDetails onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />
    </>
  );
});

export default BankNameSelector;
