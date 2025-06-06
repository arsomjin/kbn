import React, { forwardRef, useState, memo } from 'react';
import { isMobile } from 'react-device-detect';
import classNames from 'classnames';
import { InputGroup, DatePicker, InputGroupAddon, InputGroupText } from 'shards-react';
import { registerLocale } from 'react-datepicker';
import th from 'date-fns/locale/th';

const MDatePicker = forwardRef((props, ref) => {
  registerLocale('th', th);
  const [date, setDate] = useState(new Date());
  const { className, onDateChange, ...mProps } = props;

  const handleDateChange = value => {
    setDate(new Date(value));
    onDateChange(value);
  };

  const classes = classNames(className, 'd-flex', 'my-auto', 'date-range');

  return (
    <InputGroup className={classes}>
      <DatePicker
        selected={date}
        onChange={val => handleDateChange(val)}
        placeholderText="วันที่"
        dropdownMode="select"
        className="text-center"
        locale="th"
        dateFormat="dd/MM/yyyy"
        onFocus={e => isMobile && (e.target.readOnly = true)}
        {...mProps}
      />
      <InputGroupAddon type="append">
        <InputGroupText>
          <i className="material-icons">&#xE916;</i>
        </InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
});

export default memo(MDatePicker);
