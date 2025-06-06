import React, { useState } from 'react';
import classNames from 'classnames';
import { InputGroup, DatePicker, InputGroupAddon, InputGroupText } from 'shards-react';
import { isMobile } from 'react-device-detect';

import { registerLocale } from 'react-datepicker';
import th from 'date-fns/locale/th';

const RangeDatePicker = ({ value, onChange, ...props }) => {
  registerLocale('th', th);
  const [range, setRange] = useState([undefined, undefined]);

  const handleStartDateChange = value => {
    setRange(rg => [new Date(value), rg[1]]);
    onChange && onChange([new Date(value), range[1]]);
  };

  const handleEndDateChange = value => {
    setRange(rg => [rg[0], new Date(value)]);
    onChange && onChange([range[0], new Date(value)]);
  };

  const { className } = props;
  const classes = classNames(className, 'd-flex', 'my-auto', 'date-range');

  return (
    <InputGroup className={classes}>
      <DatePicker
        size="sm"
        selected={[range[0]]}
        onChange={handleStartDateChange}
        placeholderText="เริ่มต้น"
        dropdownMode="select"
        className="text-center"
        locale="th"
        dateFormat="dd/MM/yyyy"
        onFocus={e => isMobile && (e.target.readOnly = true)} // Disable virtual keyboard on mobile devices.
      />
      <DatePicker
        size="sm"
        selected={range[1]}
        onChange={handleEndDateChange}
        placeholderText="สิ้นสุด"
        dropdownMode="select"
        className="text-center"
        locale="th"
        dateFormat="dd/MM/yyyy"
        onFocus={e => isMobile && (e.target.readOnly = true)}
        popperPlacement="auto-left"
      />
      <InputGroupAddon type="append">
        <InputGroupText>
          <i className="material-icons">&#xE916;</i>
        </InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
};

export default RangeDatePicker;
