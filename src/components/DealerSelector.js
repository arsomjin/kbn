import React, { forwardRef, useContext, useRef, useImperativeHandle, useState } from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import DealerDetails from './DealerDetails';
import { FirebaseContext } from '../firebase';
import { showWarn } from 'functions';
import { setDealers } from 'redux/actions/data';
import { showSuccess } from 'functions';
import { createNewId } from 'utils';
const { Option } = Select;

export default forwardRef(({ onChange, placeholder, noAddable, allowNotInList, ...props }, ref) => {
  const { api, firestore } = useContext(FirebaseContext);
  const { dealers } = useSelector(state => state.data);
  const { user } = useSelector(state => state.auth);
  const [showAddNew, setShowAddNew] = useState(false);
  const [mValue, setValue] = useState(null);
  const [searchTxt, setSearchTxt] = useState('');

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
    //  showLog('change', value);
    if (value === 'addNew') {
      return showModal();
    }
    setValue(value);
    onChange && onChange(value);
  };

  const handleSearch = txt => {
    setSearchTxt(txt);
  };

  const handleKeyDown = (event, row) => {
    if (event.key === 'Enter' && allowNotInList) {
      //  showLog({ searchTxt, mValue });
      if (['multiple', 'tags'].includes(props.mode)) {
        handleChange(!!mValue ? [...mValue, searchTxt] : [searchTxt]);
        setValue([]);
      } else {
        handleChange(searchTxt);
      }
    }
  };

  const showModal = () => {
    setShowAddNew(true);
  };

  const handleOk = async (values, type) => {
    try {
      //  showLog({ values });
      // Add dealer.
      let mDealers = JSON.parse(JSON.stringify(dealers));
      const dealersRef = firestore.collection('data').doc('sales').collection('dealers');
      let dealerId;
      if (type === 'add') {
        dealerId = createNewId('DEAL');
        await dealersRef.doc(dealerId).set({
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
        dealerId = values.dealerId;
        await dealersRef.doc(values.dealerId).update({
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
        await dealersRef.doc(values.dealerId).delete();
        mDealers = mDealers.filter(l => l.dealerId !== values.dealerId);
      }
      dispatch(setDealers(mDealers));
      await api.updateData('dealers', dealerId);
      showSuccess(() => setShowAddNew(false), 'บันทึกข้อมูลสำเร็จ');
      setShowAddNew(false);
    } catch (e) {
      showWarn(e);
    }
  };

  const handleCancel = () => {
    setShowAddNew(false);
  };

  let Options = Object.keys(dealers).map(dl => (
    <Option key={dl} value={dl}>
      {/* <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {`${dealers[dl].dealerCode} / ${dealers[dl].dealerName}`}
        <Tooltip title="แก้ไข">
          <Button
            onClick={() => onEditOption(dl)}
            icon={<EditOutlined style={{ color: 'lightgray' }} />}
            ghost
            size="small"
          />
        </Tooltip>
      </div>
    </Option> */}
      {`${dealers[dl].dealerCode} / ${dealers[dl].dealerName}`}
    </Option>
  ));

  return (
    <>
      <Select
        ref={selectRef}
        showSearch
        placeholder={placeholder || 'พิมพ์ชื่อ/รหัสผู้จำหน่าย'}
        optionFilterProp="children"
        filterOption={(input, option) => {
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
          <Option key="addNew" value="addNew" className="text-light">
            เพิ่ม/แก้ไข รายชื่อ...
          </Option>
        )}
      </Select>
      {showAddNew && <DealerDetails onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />}
    </>
  );
});
