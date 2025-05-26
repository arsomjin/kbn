/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { Select } from 'antd';
import { useSelector } from 'react-redux';
import { getCollection } from 'firebase/api';
import { showWarn } from 'functions';
const { Option } = Select;

export default forwardRef(({ hasAll, ...props }, ref) => {
  const { departments } = useSelector(state => state.data);
  const [data, setData] = useState(null);

  const selectRef = useRef();

  const _getData = async () => {
    try {
      let doc = await getCollection('data/company/departments', [['deleted', '!=', true]]);
      setData(doc);
    } catch (e) {
      showWarn(e);
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
      }
    }),
    []
  );

  let Options = Object.keys(data || departments).map(it =>
    (data || departments)[it].department ? (
      <Option key={it} value={it}>
        {(data || departments)[it].department}
      </Option>
    ) : null
  );

  return (
    <Select
      ref={selectRef}
      placeholder="แผนก"
      // allowClear
      {...props}
    >
      {hasAll
        ? [
            <Option key="all" value="all">
              ทุกแผนก
            </Option>,
            ...Options
          ]
        : Options}
    </Select>
  );
});
