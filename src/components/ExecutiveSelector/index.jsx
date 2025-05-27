import React, { useRef, forwardRef, useState, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import ExecutiveDetail from './ExecutiveDetail';
import { firestore, doc, setDoc, collection, getDoc } from 'services/firebase';
import { showWarn, showSuccess, errorHandler, cleanValuesBeforeSave } from 'utils/functions';
import { setExecutives } from 'store/slices/dataSlice';
import { showAlert } from 'api/AlertDialog/AlertManager';
const { Option } = Select;

export default forwardRef(({ onChange, placeholder, allowNotInList, ...props }, ref) => {
  const { executives } = useSelector((state) => state.data);
  const { user } = useSelector((state) => state.auth);
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
      },
    }),
    [],
  );

  const handleChange = (value) => {
    if (Array.isArray(value) && value.some((item) => item === 'addNew')) {
      const newValue = value.filter((item) => item !== 'addNew');
      setValue(newValue);
      onChange && onChange(newValue);
      showModal();
      return;
    } else if (value === 'addNew') {
      showModal();
      return;
    }

    setValue(value);
    onChange && onChange(value);
  };

  const handleSearch = (txt) => {
    setSearchTxt(txt);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && allowNotInList) {
      if (['multiple', 'tags'].includes(props.mode)) {
        handleChange(mValue ? [...mValue, searchTxt] : [searchTxt]);
        setValue([]);
      } else {
        handleChange(searchTxt);
      }
    }
  };

  const showModal = () => {
    setShowAddNew(true);
  };

  const handleOk = async (values) => {
    try {
      if (values.executiveCode) {
        const executivesRef = collection(firestore, 'data', 'company', 'executives');
        const docRef = doc(executivesRef, values.executiveCode);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          showAlert('มีรหัสผู้บริหารนี้แล้ว');
          errorHandler({
            code: 'duplicate_executiveCode',
            message: 'มีรหัสผู้บริหารนี้แล้ว',
            snap: {
              ...cleanValuesBeforeSave(values),
              module: 'Add_Executive_Duplicate_executiveCode',
            },
          });
          return;
        }
        await setDoc(docRef, {
          ...values,
          created: Date.now(),
          inputBy: user.uid,
        });
        let mExecutives = JSON.parse(JSON.stringify(executives));
        mExecutives[values.executiveCode] = {
          ...values,
          created: Date.now(),
          inputBy: user.uid,
        };
        dispatch(setExecutives(mExecutives));
        showSuccess(() => setShowAddNew(false), 'บันทึกข้อมูลสำเร็จ');
        setShowAddNew(false);
      } else {
        showAlert('ไม่มีรหัสผู้บริหาร');
        errorHandler({
          snap: {
            ...cleanValuesBeforeSave(values),
            module: 'Add_Executive_No_executiveCode',
          },
        });
        return;
      }
    } catch (e) {
      showWarn(e);
      errorHandler({
        code: e?.code || '',
        message: e?.message || '',
        snap: {
          ...cleanValuesBeforeSave(values),
          module: 'Add_Executive',
        },
      });
    }
  };

  const handleCancel = () => {
    setShowAddNew(false);
  };

  let Options = Object.entries(executives)
    .filter(([, data]) => !!data.firstName)
    .map(([k, data]) => (
      <Option key={k} value={k}>
        {`คุณ${data.firstName}${data.nickName ? `(${data.nickName})` : ''} ${data.lastName}`}
      </Option>
    ));

  return (
    <>
      <Select
        ref={selectRef}
        showSearch
        placeholder={placeholder || 'ผู้บริหาร'}
        optionFilterProp="children"
        filterOption={(input, option) => {
          return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
        onChange={handleChange}
        onSearch={handleSearch}
        onKeyDown={handleKeyDown}
        dropdownStyle={{ minWidth: 280 }}
        {...props}
      >
        {Options}
        <Option key="addNew" value="addNew" className="text-light">
          เพิ่มรายชื่อ...
        </Option>
      </Select>
      <ExecutiveDetail onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />
    </>
  );
});
