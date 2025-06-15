import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

const { RangePicker } = DatePicker;

// Custom Thai locale object compatible with dayjs
const customThaiLocale = {
  lang: {
    placeholder: 'เลือกวันที่',
    rangePlaceholder: ['วันที่เริ่มต้น', 'วันที่สิ้นสุด'],
    today: 'วันนี้',
    now: 'ตอนนี้',
    backToToday: 'กลับไปวันนี้',
    ok: 'ตกลง',
    clear: 'ล้าง',
    month: 'เดือน',
    year: 'ปี',
    timeSelect: 'เลือกเวลา',
    dateSelect: 'เลือกวันที่',
    monthSelect: 'เลือกเดือน',
    yearSelect: 'เลือกปี',
    decadeSelect: 'เลือกทศวรรษ',
    yearFormat: 'YYYY',
    dateFormat: 'D/M/YYYY',
    dayFormat: 'D',
    dateTimeFormat: 'D/M/YYYY HH:mm:ss',
    monthBeforeYear: true,
    previousMonth: 'เดือนก่อนหน้า (PageUp)',
    nextMonth: 'เดือนถัดไป (PageDown)',
    previousYear: 'ปีก่อนหน้า (Control + left)',
    nextYear: 'ปีถัดไป (Control + right)',
    previousDecade: 'ทศวรรษก่อนหน้า',
    nextDecade: 'ทศวรรษถัดไป',
    previousCentury: 'ศตวรรษก่อนหน้า',
    nextCentury: 'ศตวรรษถัดไป',
  },
  timePickerLocale: {
    placeholder: 'เลือกเวลา',
  },
};

export default forwardRef(
  ({ value, onChange, format, placeholder, ...props }, ref) => {
    const dateRef = useRef();

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
        },
      }),
      []
    );

    const _onChange = (date, dateString) => {
      //  showLog({ date, dateString, value });
      if (date && date.length === 2) {
        onChange &&
          onChange(
            [
              dayjs(date[0]).format('YYYY-MM-DD'),
              dayjs(date[1]).format('YYYY-MM-DD'),
            ],
            dateString
          );
      } else {
        onChange && onChange(null, dateString);
      }
    };

    //  showLog({ value });
    return (
      <RangePicker
        ref={dateRef}
        format={format || 'DD/MM/YYYY'}
        // placeholder={placeholder || 'วันที่'}
        locale={customThaiLocale}
        onChange={_onChange}
        {...(value &&
          value.length === 2 && {
            value: [dayjs(value[0]), dayjs(value[1])],
          })}
        allowClear={false}
        {...props}
      />
    );
  }
);
