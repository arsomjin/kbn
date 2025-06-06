import React, { useContext, useRef, forwardRef, useState, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import EmployeeDetails from './EmployeeDetails';
import { FirebaseContext } from '../../firebase';
import { showWarn } from 'functions';
import { setEmployees } from 'redux/actions/data';
import { showSuccess } from 'functions';
import { showAlert } from 'api/AlertDialog/AlertManager';
import { errorHandler } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
const { Option } = Select;

export default forwardRef(({ onChange, placeholder, isTechnician, hasStatusColor, allowNotInList, ...props }, ref) => {
  const { firestore, api } = useContext(FirebaseContext);
  const { employees } = useSelector(state => state.data);
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
    // showLog('select', value);
    if (['addNew'].includes(Array.isArray(value) ? (value.length > 0 ? value[value.length - 1] : value[0]) : value)) {
      if ((Array.isArray(value) ? (value.length > 0 ? value[value.length - 1] : value[0]) : value) === 'addNew') {
        return showModal();
      }
    } else {
      setValue(value);
      onChange && onChange(value);
    }
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

  const handleOk = async values => {
    try {
      //  showLog({ values });
      // Add employee.
      let mEmployees = JSON.parse(JSON.stringify(employees));
      const employeesRef = firestore.collection('data').doc('company').collection('employees');
      if (!!values.employeeCode) {
        await employeesRef.doc(values.employeeCode).set({
          ...values,
          created: Date.now(),
          inputBy: user.uid
        });
        mEmployees[values.employeeCode] = {
          ...values,
          created: Date.now(),
          inputBy: user.uid
        };
        dispatch(setEmployees(mEmployees));
        await api.updateData('employees', values.employeeCode);
        showSuccess(() => setShowAddNew(false), 'บันทึกข้อมูลสำเร็จ');
        setShowAddNew(false);
      } else {
        showAlert('ไม่มีรหัสพนักงาน');
        errorHandler({
          snap: {
            ...cleanValuesBeforeSave(values),
            module: 'Add_Employee_No_employeeCode'
          }
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
          module: 'Add_Employee'
        }
      });
    }
  };

  const handleCancel = () => {
    setShowAddNew(false);
  };

  let Options = Object.keys(employees).map(it =>
    employees[it].firstName &&
    (isTechnician ? employees[it].position && employees[it].position.indexOf('ช่าง') > -1 : true) ? (
      <Option
        key={it}
        value={it}
        {...(hasStatusColor && employees[it].status === 'ลาออก' && { style: { color: '#F08080' } })}
      >
        {`${employees[it].firstName}${
          employees[it].nickName ? `(${employees[it].nickName})` : ''
        } ${employees[it].lastName}`}
      </Option>
    ) : null
  );
  return (
    <>
      <Select
        ref={selectRef}
        showSearch
        placeholder={placeholder || (isTechnician ? 'ช่างบริการ' : 'พนักงาน')}
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
      <EmployeeDetails onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />
    </>
  );
});
