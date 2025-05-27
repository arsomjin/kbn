/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle, useState, useEffect } from 'react';
import { Select } from 'antd';
import { useSelector } from 'react-redux';
import { cleanValuesBeforeSave } from 'utils/functions';
import ServiceDetails from './ServiceDetails';
import { createKeywords } from 'utils';
import { ServiceNameKeywords } from 'data/Constant';
import { useModal } from 'contexts/ModalContext';

const { Option } = Select;

const ServiceSelector = forwardRef(({ onChange, noAddable, ...props }, ref) => {
  const { user } = useSelector((state) => state.auth);
  const [showAddNew, setShowAddNew] = useState(false);
  const [data, setData] = useState(null);
  const { showWarn, showSuccess } = useModal();

  const selectRef = useRef();

  const _getData = async () => {
    try {
      // TODO: Implement proper data fetching
      // let doc = await getCollection('data/services/serviceList');
      // setData(doc);
      setData({});
    } catch (e) {
      showWarn(e.message || e);
    }
  };

  useEffect(() => {
    _getData();
  }, []);

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
    //  showLog('select', value);
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
      // Add service.
      let mServices = JSON.parse(JSON.stringify(data));
      let keywords = createKeywords(values.serviceCode);
      ServiceNameKeywords.map((kw) => {
        if (values.name.toString().toLowerCase().indexOf(kw) > -1) {
          keywords = [...keywords, ...createKeywords(kw)];
        }
        return kw;
      });

      keywords = [...keywords, ...createKeywords(values.name)];

      let mValues = cleanValuesBeforeSave({ ...values, keywords });

      // TODO: Implement proper Firebase save
      let serviceCode = mValues.serviceCode;
      console.log('Saving service:', {
        ...mValues,
        created: Date.now(),
        inputBy: user.uid,
        serviceCode,
      });
      mServices[serviceCode] = {
        ...mValues,
        serviceCode,
        created: Date.now(),
        inputBy: user.uid,
      };
      _getData();
      showSuccess('บันทึกข้อมูลสำเร็จ', 3, () => setShowAddNew(false));
      setShowAddNew(false);
    } catch (e) {
      showWarn(e.message || e);
    }
  };

  const handleCancel = () => {
    setShowAddNew(false);
  };

  if (!data) {
    return null;
  }

  const Options = Object.keys(data)
    .map((k) => ({ ...data[k], _key: k }))
    .filter((l) => !l.deleted)
    .map((it) => (
      <Option key={it._key} value={it._key}>
        {it.name}
      </Option>
    ));

  return (
    <>
      <Select
        ref={selectRef}
        placeholder="รายการ"
        optionFilterProp="children"
        filterOption={(input, option) => {
          return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
        onChange={handleChange}
        dropdownStyle={{ minWidth: 280 }}
        {...props}
      >
        {Options}
        {!noAddable && (
          <Option key="addNew" value="addNew" className="text-light">
            เพิ่มรายการ...
          </Option>
        )}
      </Select>
      <ServiceDetails onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />
    </>
  );
});

export default ServiceSelector;
