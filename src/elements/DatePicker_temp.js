import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useState,
} from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import { isMobile } from 'react-device-detect';
import { showLog } from 'functions';
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
  (
    {
      value,
      onChange,
      format,
      placeholder,
      picker,
      isRange,
      disabledDate,
      ...props
    },
    ref
  ) => {
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
        },
      }),
      []
    );

    const [dates, setDates] = useState(null);

    const onOpenChange = (open) => {
      if (open) {
        setDates([null, null]);
      } else {
        setDates(null);
      }
    };

    const disabledDateRange = (current) => {
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

    const mFormat = isMonth
      ? 'YYYY-MM'
      : isYear
        ? 'YYYY'
        : isTime
          ? 'HH:mm'
          : 'YYYY-MM-DD';

    const MComponent = isRange ? RangePicker : DatePicker;

    const _onChange = (date, dateString) => {
      showLog({ date, dateString });
      if (isRange) {
        if (date && date.length === 2) {
          onChange &&
            onChange([
              dayjs(dateString[0], 'DD/MM/YYYY').format('YYYY-MM-DD'),
              dayjs(dateString[1], 'DD/MM/YYYY').format('YYYY-MM-DD'),
            ]);
        } else {
          onChange && onChange(null);
        }
      } else {
        onChange &&
          onChange(date ? dayjs(date).format(mFormat) : null, dateString);
      }
    };

    showLog({ dates, value });
    return (
      <MComponent
        ref={dateRef}
        format={
          format ||
          (isMonth
            ? 'MM/YYYY'
            : isYear
              ? 'YYYY'
              : isTime
                ? 'HH:mm'
                : 'DD/MM/YYYY')
        }
        {...(!isRange && {
          placeholder:
            placeholder ||
            (isMonth ? 'เดือน' : isYear ? 'ปี' : isTime ? 'เวลา' : 'วันที่'),
        })}
        locale={customThaiLocale}
        onChange={_onChange}
        onCalendarChange={(val) => setDates(val)}
        onOpenChange={onOpenChange}
        value={
          typeof value === 'undefined'
            ? value
            : !!value
              ? isRange
                ? [
                    !!dates && !!dates[0] ? dates[0] : dayjs(value[0], mFormat),
                    !!dates && !!dates[1] ? dates[1] : dayjs(value[1], mFormat),
                  ]
                : dayjs(value, mFormat)
              : dayjs()
        }
        allowClear={false}
        picker={picker}
        disabledDate={isRange ? disabledDateRange : disabledDate}
        onFocus={(e) => isMobile && (e.target.readOnly = true)} // Disable virtual keyboard on mobile devices.
        {...props}
      />
    );
  }
);
