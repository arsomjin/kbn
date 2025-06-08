import React from 'react';
import classNames from 'classnames';
import { InputGroup, DatePicker, InputGroupAddon, InputGroupText } from 'shards-react';
import { isMobile } from 'react-device-detect';

import { registerLocale } from 'react-datepicker';
import th from 'date-fns/locale/th';
import dayjs from 'dayjs';

class RangeDatePicker extends React.Component {
  constructor(props) {
    super(props);
    registerLocale('th', th);
    this.state = {
      startDate: props?.startDateDefaultValue ? new Date(dayjs(props.startDateDefaultValue, 'YYYY-MM-DD')) : undefined,
      endDate: props?.endDateDefaultValue ? new Date(dayjs(props.endDateDefaultValue, 'YYYY-MM-DD')) : undefined
    };

    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
  }

  handleStartDateChange(value) {
    this.setState({
      ...this.state,
      ...{ startDate: new Date(value) }
    });
    this.props.onStartDateChange && this.props.onStartDateChange(new Date(value));
  }

  handleEndDateChange(value) {
    this.setState({
      ...this.state,
      ...{ endDate: new Date(value) }
    });
    this.props.onEndDateChange && this.props.onEndDateChange(new Date(value));
  }

  render() {
    const { className, size } = this.props;
    const classes = classNames(className, 'd-flex', 'my-auto', 'date-range');

    return (
      <InputGroup className={classes}>
        <InputGroupAddon type="prepend">
          <InputGroupText className="text-primary">ช่วงเวลา</InputGroupText>
        </InputGroupAddon>
        <DatePicker
          size={size || 'sm'}
          selected={this.state.startDate}
          onChange={this.handleStartDateChange}
          placeholderText="วันที่เริ่มต้น"
          dropdownMode="select"
          className="text-center"
          locale="th"
          dateFormat="dd/MM/yyyy"
          onFocus={e => isMobile && (e.target.readOnly = true)} // Disable virtual keyboard on mobile devices.
        />
        <DatePicker
          size={size || 'sm'}
          selected={this.state.endDate}
          onChange={this.handleEndDateChange}
          placeholderText="วันที่สิ้นสุด"
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
  }
}

export default RangeDatePicker;
