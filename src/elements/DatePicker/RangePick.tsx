import React, { forwardRef, useState } from 'react';
import { DatePicker } from 'antd';
import type { DatePickerProps } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { DateTime } from 'luxon';
import { isMobile } from 'react-device-detect';

const { RangePicker } = DatePicker;

type BaseProps = Omit<DatePickerProps, 'onChange' | 'value' | 'placeholder'>;

export interface RangePickProps extends BaseProps {
  value?: [string, string];
  onChange?: (value: [string, string], dateString: [string, string]) => void;
  format?: string;
  mFormat?: string;
  dFormat?: string;
  placeholder?: [string, string];
  picker?: 'date' | 'month' | 'year' | 'time';
  showTime?: boolean | { [key: string]: any };
}

const RangePick = forwardRef<any, RangePickProps>(({ 
  value, 
  onChange, 
  format, 
  mFormat, 
  dFormat, 
  placeholder, 
  picker, 
  showTime,
  ...props 
}, ref) => {
  const [dates, setDates] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const isMonth = picker === 'month';
  const isYear = picker === 'year';
  const isTime = picker === 'time';

  const disabledDateRange = (current: Dayjs) => {
    if (!dates) {
      return false;
    }
    const tooLate = dates[0] && current.diff(dates[0], 'days') > 7;
    const tooEarly = dates[1] && dates[1].diff(current, 'days') > 7;
    return !!tooEarly || !!tooLate;
  };

  const onOpenChange = (open: boolean) => {
    if (open) {
      setDates([null, null]);
    } else {
      setDates(null);
    }
  };

  const _onChange = (dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => {
    if (onChange && dates && dates[0] && dates[1]) {
      const formattedDates: [string, string] = [
        DateTime.fromJSDate(dates[0].toDate()).toFormat(mFormat || 'yyyy-MM-dd'),
        DateTime.fromJSDate(dates[1].toDate()).toFormat(mFormat || 'yyyy-MM-dd')
      ];
      onChange(formattedDates, dateStrings);
    }
  };

  const getValue = () => {
    if (!value) {
      return undefined;
    }
    return [
      dayjs(DateTime.fromFormat(value[0], mFormat || 'yyyy-MM-dd').toJSDate()),
      dayjs(DateTime.fromFormat(value[1], mFormat || 'yyyy-MM-dd').toJSDate())
    ] as [Dayjs, Dayjs];
  };

  const rangePickerProps: any = {
    ref,
    format: format || dFormat,
    placeholder: placeholder || [
      isMonth ? 'เดือนเริ่มต้น' : isYear ? 'ปีเริ่มต้น' : isTime ? 'เวลาเริ่มต้น' : 'วันที่เริ่มต้น',
      isMonth ? 'เดือนสิ้นสุด' : isYear ? 'ปีสิ้นสุด' : isTime ? 'เวลาสิ้นสุด' : 'วันที่สิ้นสุด'
    ],
    onChange: _onChange,
    value: getValue(),
    allowClear: false,
    picker,
    disabledDate: disabledDateRange,
    onOpenChange,
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => isMobile && (e.target.readOnly = true),
    ...props
  };

  if (showTime) {
    rangePickerProps.showTime = typeof showTime === 'object' ? showTime : true;
  }

  return <RangePicker {...rangePickerProps} />;
});

RangePick.displayName = 'RangePick';

export default RangePick;
