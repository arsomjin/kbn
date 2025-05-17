import React, { forwardRef } from 'react';
import { DatePicker } from 'antd';
import type { DatePickerProps } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { DateTime } from 'luxon';
import { isMobile } from 'react-device-detect';

type BaseProps = Omit<DatePickerProps, 'onChange' | 'value' | 'placeholder'>;

export interface DatePickProps extends BaseProps {
  value?: string;
  onChange?: (value: string, dateString: string) => void;
  format?: string;
  mFormat?: string;
  dFormat?: string;
  placeholder?: string;
  picker?: 'date' | 'month' | 'year' | 'time';
  disabledDate?: (current: Dayjs) => boolean;
}

const DatePick = forwardRef<any, DatePickProps>(({ 
  value, 
  onChange, 
  format, 
  mFormat, 
  dFormat, 
  placeholder, 
  picker, 
  disabledDate, 
  ...props 
}, ref) => {
  const isMonth = picker === 'month';
  const isYear = picker === 'year';
  const isTime = picker === 'time';

  const _onChange = (date: Dayjs | null, dateString: string | string[]) => {
    if (onChange && date && typeof dateString === 'string') {
      const formattedDate = DateTime.fromJSDate(date.toDate()).toFormat(mFormat || 'yyyy-MM-dd');
      onChange(formattedDate, dateString);
    }
  };

  const getValue = () => {
    if (!value) {
      return undefined;
    }
    return dayjs(DateTime.fromFormat(value, mFormat || 'yyyy-MM-dd').toJSDate());
  };

  return (
    <DatePicker
      ref={ref}
      format={format || dFormat}
      placeholder={placeholder || (isMonth ? 'เดือน' : isYear ? 'ปี' : isTime ? 'เวลา' : 'วันที่')}
      onChange={_onChange}
      value={getValue()}
      allowClear={false}
      picker={picker}
      disabledDate={disabledDate}
      onFocus={e => isMobile && ((e.target as HTMLInputElement).readOnly = true)}
      {...props}
    />
  );
});

DatePick.displayName = 'DatePick';

export default DatePick;
