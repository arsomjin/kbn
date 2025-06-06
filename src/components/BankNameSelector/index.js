import React, { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import BankNameDetails from './BankNameDetails';
import { FirebaseContext } from '../../firebase';
import { showWarn } from 'functions';
import { setBankNames } from 'redux/actions/data';
import { showSuccess } from 'functions';
import { load } from 'functions';
import { createNewId } from 'utils';
const { Option } = Select;

export default forwardRef(({ onChange, placeholder, allowNotInList, ...props }, ref) => {
  const { firestore, api } = useContext(FirebaseContext);
  const { bankNames } = useSelector(state => state.data);
  const { user } = useSelector(state => state.auth);
  const [showAddNew, setShowAddNew] = useState(false);

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
      }
    }),
    []
  );

  const handleChange = value => {
    // showLog('select', value);
    if (value === 'addNew') {
      return showModal();
    }
    onChange && onChange(value);
  };

  const showModal = () => {
    setShowAddNew(true);
  };

  const handleOk = async values => {
    try {
      //  showLog({ values });
      load(true);
      let mBankNames = JSON.parse(JSON.stringify(bankNames));
      const bankNamesRef = firestore.collection('data').doc('company').collection('bankNames');
      const bankNameId = createNewId('BANK');
      await bankNamesRef.doc(bankNameId).set({
        ...values,
        created: Date.now(),
        inputBy: user.uid,
        bankNameId
      });
      mBankNames[bankNameId] = {
        ...values,
        bankNameId,
        created: Date.now(),
        inputBy: user.uid
      };
      dispatch(setBankNames(mBankNames));
      await api.updateData('bankNames', bankNameId);
      load(false);
      showSuccess(() => setShowAddNew(false), 'บันทึกข้อมูลสำเร็จ');
      setShowAddNew(false);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const handleCancel = () => {
    setShowAddNew(false);
  };

  let Options = Object.keys(bankNames).map(dl => (
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
