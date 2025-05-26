import React, { useContext, useRef, forwardRef, useState, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import BankDetails from './BankDetails';
import { FirebaseContext } from '../../firebase';
import { showWarn } from 'functions';
import { setBanks } from 'redux/actions/data';
import { showSuccess } from 'functions';
import { createNewId } from 'utils';
import { sortArr } from 'functions';
const { Option } = Select;

export default forwardRef(({ onChange, placeholder, ...props }, ref) => {
  const { firestore, api } = useContext(FirebaseContext);
  const { banks } = useSelector(state => state.data);
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
    //  showLog('select', value);
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
      //TODO: Add bank.
      let mBanks = JSON.parse(JSON.stringify(banks));
      const banksRef = firestore.collection('data').doc('company').collection('banks');
      let bankId = createNewId('BANK');
      await banksRef.doc(bankId).set({
        ...values,
        created: Date.now(),
        inputBy: user.uid,
        bankId
      });
      await api.updateData('banks', bankId);
      mBanks[bankId] = {
        ...values,
        bankId,
        created: Date.now(),
        inputBy: user.uid
      };
      dispatch(setBanks(mBanks));
      showSuccess(() => setShowAddNew(false), 'บันทึกข้อมูลสำเร็จ');
      setShowAddNew(false);
    } catch (e) {
      showWarn(e);
    }
  };

  const handleCancel = () => {
    setShowAddNew(false);
  };

  let sBanks = Object.keys(banks).map(bankId => ({
    ...banks[bankId],
    bankId
  }));
  sBanks = sortArr(sBanks, 'order');

  // let Options = Object.keys(banks).map((dl) => (
  //   <Option
  //     key={dl}
  //     value={dl}
  //   >{`${banks[dl].bankName} - ${banks[dl].accNo}`}</Option>
  // ));

  let Options = sBanks.map(dl => (
    <Option key={dl.bankId} value={dl.bankId}>{`${dl.bankName} - ${dl.accNo} - ${dl.name}`}</Option>
  ));

  return (
    <>
      <Select
        ref={selectRef}
        showSearch
        placeholder={placeholder || 'ธนาคาร'}
        optionFilterProp="children"
        filterOption={(input, option) => {
          return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
        onChange={handleChange}
        dropdownStyle={{ minWidth: 440 }}
        {...props}
      >
        {Options}
        {/* <Option key="addNew" value="addNew" className="text-light">
          เพิ่มรายการ...
        </Option> */}
      </Select>
      <BankDetails onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />
    </>
  );
});
