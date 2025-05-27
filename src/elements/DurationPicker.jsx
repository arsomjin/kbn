import React, { forwardRef, useRef, useImperativeHandle, useCallback, useState } from 'react';
import { Select } from 'antd';
import { DateRange, DateRangeWithAll } from 'data/Constant';
import moment from 'moment';
import RangePicker from './RangePicker';
import { getStartDateFromDuration } from 'utils/functions';
const { Option } = Select;

const initDuration = [moment().startOf('week').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')];

export default forwardRef(
  ({ placeholder, onChange, defaultDuration, value, hasAll, ...props }, ref) => {
    const mDuration = defaultDuration
      ? [getStartDateFromDuration(defaultDuration), initDuration[1]]
      : initDuration;
    const [val, setVal] = useState(defaultDuration || 'thisWeek');
    const selectRef = useRef();
    const durationRef = useRef(mDuration);
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

    const _onChange = useCallback(
      (val) => {
        let result = durationRef.current;
        result[2] = val;
        if (val !== 'custom') {
          result[0] = getStartDateFromDuration(val);
          durationRef.current = result;
          onChange && onChange(result);
        }
        setVal(val);
      },
      [onChange],
    );

    const _onDurationChange = useCallback(
      (val) => {
        //  showLog({ val });
        durationRef.current[0] = val[0];
        durationRef.current[1] = val[1];
        durationRef.current[3] = val;
        onChange && onChange(durationRef.current);
      },
      [onChange],
    );

    let mDateRange = hasAll ? DateRangeWithAll : DateRange;

    return (
      <div>
        <Select
          ref={selectRef}
          placeholder={placeholder || 'ช่วงเวลา'}
          value={val}
          onChange={_onChange}
          {...props}
        >
          {Object.keys(mDateRange).map((key) => (
            <Option key={key} value={key}>
              {mDateRange[key]}
            </Option>
          ))}
        </Select>
        {val === 'custom' && <RangePicker onChange={_onDurationChange} />}
      </div>
    );
  },
);
