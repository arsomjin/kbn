import React, { forwardRef, useState, memo } from 'react';
import { isMobile } from 'react-device-detect';
import classNames from 'classnames';
import { Input } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { DatePicker } from 'elements';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

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

const MDatePicker = forwardRef((props, ref) => {
  const [date, setDate] = useState(
    props.selected ? dayjs(props.selected) : null
  );
  const { className, onDateChange, selected, ...mProps } = props;

  const handleDateChange = (value) => {
    setDate(value);
    if (onDateChange) {
      onDateChange(value ? value.toDate() : null);
    }
  };

  const classes = classNames(className, 'd-flex', 'my-auto', 'date-range');

  return (
    <div className={classes}>
      <DatePicker
        ref={ref}
        value={selected ? dayjs(selected) : date}
        onChange={handleDateChange}
        placeholder='วันที่'
        className='text-center'
        locale={customThaiLocale}
        format='DD/MM/YYYY'
        suffixIcon={<CalendarOutlined />}
        onFocus={(e) => isMobile && (e.target.readOnly = true)}
        style={{ width: '100%' }}
        {...mProps}
      />
    </div>
  );
});

MDatePicker.displayName = 'MDatePicker';

export default memo(MDatePicker);
