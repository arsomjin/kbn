import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import BankNameDetails from './BankNameDetails';
import { firestore, collection, doc, setDoc } from 'services/firebase';
import { setBankNames } from 'store/slices/dataSlice';
import { load } from 'utils/functions';
import { createNewId } from 'utils';
import { useModal } from 'contexts/ModalContext';
const { Option } = Select;

const BankNameSelector = forwardRef(({ onChange, placeholder, ...props }, ref) => {
  const { bankNames } = useSelector((state) => state.data);
  const { user } = useSelector((state) => state.auth);
  const [showAddNew, setShowAddNew] = useState(false);
  const { showWarn, showSuccess } = useModal();

  const dispatch = useDispatch();

  const selectRef = useRef();

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
    // showLog('select', value);
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
      //  showLog({ values });
      load(true);
      let mBankNames = JSON.parse(JSON.stringify(bankNames));
      const bankNamesRef = collection(firestore, 'data', 'company', 'bankNames');
      const bankNameId = createNewId('BANK');
      await setDoc(doc(bankNamesRef, bankNameId), {
        ...values,
        created: Date.now(),
        inputBy: user.uid,
        bankNameId,
      });
      mBankNames[bankNameId] = {
        ...values,
        bankNameId,
        created: Date.now(),
        inputBy: user.uid,
      };
      dispatch(setBankNames(mBankNames));
      load(false);
      showSuccess('บันทึกข้อมูลสำเร็จ', 3, () => setShowAddNew(false));
      setShowAddNew(false);
    } catch (e) {
      showWarn(e.message || e);
      load(false);
    }
  };

  const handleCancel = () => {
    setShowAddNew(false);
  };

  let Options = Object.keys(bankNames).map((dl) => (
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
        optionFilterProp="children"
        onChange={handleChange}
        {...props}
      >
        {Options}
        <Option key="addNew" value="addNew" className="text-light">
          เพิ่มรายการ...
        </Option>
      </Select>

      <BankNameDetails onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />
    </>
  );
});

export default BankNameSelector;
