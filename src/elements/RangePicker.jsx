import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import classNames from 'classnames';
import { DatePicker } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { isMobile } from 'react-device-detect';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import { useMergeState } from 'api/CustomHooks';

const { RangePicker } = DatePicker;

export default forwardRef(({ value, onChange, format, placeholder, className, ...props }, ref) => {
  const [range, setRange] = useMergeState({
    startDate: undefined,
    endDate: undefined,
  });
  const dateRef = useRef();

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        dateRef.current?.focus();
      },

      blur: () => {
        dateRef.current?.blur();
      },

      clear: () => {
        dateRef.current?.clear();
      },

      isFocused: () => {
        return dateRef.current?.isFocused();
      },

      setNativeProps(nativeProps) {
        dateRef.current?.setNativeProps(nativeProps);
      },
    }),
    [],
  );

  useEffect(() => {
    dayjs.locale('th');
  }, []);

  useEffect(() => {
    if (value && Array.isArray(value) && value.length === 2) {
      setRange({
        startDate: dayjs(value[0], 'YYYY-MM-DD'),
        endDate: dayjs(value[1], 'YYYY-MM-DD'),
      });
    }
  }, [setRange, value]);

  const handleDateChange = (dates, dateStrings) => {
    if (dates && dates.length === 2) {
      setRange({
        startDate: dates[0],
        endDate: dates[1],
      });
      onChange && onChange([dateStrings[0], dateStrings[1]]);
    } else {
      setRange({
        startDate: undefined,
        endDate: undefined,
      });
      onChange && onChange([null, null]);
    }
  };

  const classes = classNames(className, 'd-flex', 'my-auto', 'date-range');

  return (
    <div ref={dateRef} className={classes}>
      <RangePicker
        size="small"
        value={range.startDate && range.endDate ? [range.startDate, range.endDate] : null}
        onChange={handleDateChange}
        placeholder={placeholder || ['เริ่มต้น', 'สิ้นสุด']}
        format={format || 'DD/MM/YYYY'}
        suffixIcon={<CalendarOutlined />}
        allowClear
        style={{ width: '100%' }}
        {...(isMobile && { inputReadOnly: true })}
        {...props}
      />
    </div>
  );
});
