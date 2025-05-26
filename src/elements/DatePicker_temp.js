import React, { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import { DatePicker } from 'antd';
import 'moment/locale/th';
import locale from 'antd/es/date-picker/locale/th_TH';
import moment from 'moment';
import { isMobile } from 'react-device-detect';
import { showLog } from 'functions';
const { RangePicker } = DatePicker;

export default forwardRef(({ value, onChange, format, placeholder, picker, isRange, disabledDate, ...props }, ref) => {
  const dateRef = useRef();
  // showLog({ disabledDate });
  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        dateRef.current.focus();
      },

      blur: () => {
        dateRef.current.blur();
      },

      clear: () => {
        dateRef.current.clear();
      },

      isFocused: () => {
        return dateRef.current.isFocused();
      },

      setNativeProps(nativeProps) {
        dateRef.current.setNativeProps(nativeProps);
      }
    }),
    []
  );

  const [dates, setDates] = useState(null);

  const onOpenChange = open => {
    if (open) {
      setDates([null, null]);
    } else {
      setDates(null);
    }
  };

  const disabledDateRange = current => {
    if (!dates) {
      return false;
    }
    const tooLate = dates[0] && current.diff(dates[0], 'days') > 7;
    const tooEarly = dates[1] && dates[1].diff(current, 'days') > 7;
    return !!tooEarly || !!tooLate;
  };

  const isMonth = picker === 'month';
  const isYear = picker === 'year';
  const isTime = picker === 'time';

  const mFormat = isMonth ? 'YYYY-MM' : isYear ? 'YYYY' : isTime ? 'HH:mm' : 'YYYY-MM-DD';

  const MComponent = isRange ? RangePicker : DatePicker;

  const _onChange = (date, dateString) => {
    showLog({ date, dateString });
    if (isRange) {
      onChange &&
        onChange([
          moment(dateString[0], 'DD/MM/YYYY').format('YYYY-MM-DD'),
          moment(dateString[1], 'DD/MM/YYYY').format('YYYY-MM-DD')
        ]);
    } else {
      onChange && onChange(moment(date).format(mFormat), dateString);
    }
  };

  showLog({ dates, value });
  return (
    <MComponent
      ref={dateRef}
      format={format || (isMonth ? 'MM/YYYY' : isYear ? 'YYYY' : isTime ? 'HH:mm' : 'DD/MM/YYYY')}
      {...(!isRange && {
        placeholder: placeholder || (isMonth ? 'เดือน' : isYear ? 'ปี' : isTime ? 'เวลา' : 'วันที่')
      })}
      locale={locale}
      onChange={_onChange}
      onCalendarChange={val => setDates(val)}
      onOpenChange={onOpenChange}
      value={
        typeof value === 'undefined'
          ? value
          : !!value
            ? isRange
              ? [
                  !!dates && !!dates[0] ? dates[0] : moment(value[0], mFormat),
                  !!dates && !!dates[1] ? dates[1] : moment(value[1], mFormat)
                ]
              : moment(value, mFormat)
            : moment()
      }
      allowClear={false}
      picker={picker}
      disabledDate={isRange ? disabledDateRange : disabledDate}
      onFocus={e => isMobile && (e.target.readOnly = true)} // Disable virtual keyboard on mobile devices.
      {...props}
    />
  );
});
