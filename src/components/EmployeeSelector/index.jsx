import React, { useRef, forwardRef, useState, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import EmployeeDetails from './EmployeeDetails';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';
import { setEmployees } from 'store/slices/dataSlice';
import { errorHandler } from 'utils/functions';
import { processFormDataForFirestore } from 'utils/dateHandling';
import { useModal } from 'contexts/ModalContext';
const { Option } = Select;

const EmployeeSelector = forwardRef(
  ({ onChange, placeholder, isTechnician, hasStatusColor, allowNotInList, ...props }, ref) => {
    const { employees } = useSelector((state) => state.data);
    const { user } = useSelector((state) => state.auth);
    const [showAddNew, setShowAddNew] = useState(false);
    const [mValue, setValue] = useState(null);
    const [searchTxt, setSearchTxt] = useState('');

    const dispatch = useDispatch();
    const selectRef = useRef();
    const db = getFirestore();
    const { showError, showSuccess: showModalSuccess } = useModal();

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
      if (
        ['addNew'].includes(
          Array.isArray(value) ? (value.length > 0 ? value[value.length - 1] : value[0]) : value,
        )
      ) {
        if (
          (Array.isArray(value)
            ? value.length > 0
              ? value[value.length - 1]
              : value[0]
            : value) === 'addNew'
        ) {
          return showModal();
        }
      } else {
        setValue(value);
        onChange && onChange(value);
      }
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
        let mEmployees = JSON.parse(JSON.stringify(employees));
        const employeesRef = collection(db, 'data', 'company', 'employees');

        if (values.employeeCode) {
          await setDoc(doc(employeesRef, values.employeeCode), {
            ...values,
            created: Date.now(),
            inputBy: user.uid,
          });

          mEmployees[values.employeeCode] = {
            ...values,
            created: Date.now(),
            inputBy: user.uid,
          };

          dispatch(setEmployees(mEmployees));
          showModalSuccess('บันทึกข้อมูลสำเร็จ', () => setShowAddNew(false));
          setShowAddNew(false);
        } else {
          showError('ไม่มีรหัสพนักงาน');
          errorHandler({
            snap: {
              ...processFormDataForFirestore(values),
              module: 'Add_Employee_No_employeeCode',
            },
          });
          return;
        }
      } catch (e) {
        showError(e?.message || 'เกิดข้อผิดพลาด');
        errorHandler({
          code: e?.code || '',
          message: e?.message || '',
          snap: {
            ...processFormDataForFirestore(values),
            module: 'Add_Employee',
          },
        });
      }
    };

    const handleCancel = () => {
      setShowAddNew(false);
    };

    let Options = Object.keys(employees).map((it) =>
      employees[it].firstName &&
      (isTechnician
        ? employees[it].position && employees[it].position.indexOf('ช่าง') > -1
        : true) ? (
        <Option
          key={it}
          value={it}
          {...(hasStatusColor &&
            employees[it].status === 'ลาออก' && { style: { color: '#F08080' } })}
        >
          {`${employees[it].firstName}${
            employees[it].nickName ? `(${employees[it].nickName})` : ''
          } ${employees[it].lastName}`}
        </Option>
      ) : null,
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
  },
);

export default EmployeeSelector;
