import { DateRange } from 'data/Constant';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { CardHeader, Row, Col, FormSelect } from 'shards-react';
import RangeDatePicker from './common/RangeDatePicker';

const BranchDateRangeHeader = ({ disabled, onBranchChange, onRangeChange, onStartDateChange, onEndDateChange }) => {
  const { branches } = useSelector(state => state.data);
  const [branchCode, setBranch] = useState('all');
  const [range, setRange] = useState(DateRange.today);

  const _onBranchSelected = br => {
    setBranch(br);
    onBranchChange && onBranchChange(br);
  };

  const _onStartDateSelected = useCallback(
    dateValue => {
      onStartDateChange && onStartDateChange(dateValue);
    },
    [onStartDateChange]
  );

  const _onEndDateSelected = useCallback(
    dateValue => {
      onEndDateChange && onEndDateChange(dateValue);
    },
    [onEndDateChange]
  );

  const _onRangeChange = useCallback(
    rng => {
      setRange(rng);
      onRangeChange && onRangeChange(rng);
    },
    [onRangeChange]
  );

  return (
    <CardHeader>
      <Row style={{ alignItems: 'center' }}>
        <Col md="4" className="mb-sm-0 mt-2">
          <FormSelect
            name="branchCode"
            value={branchCode}
            onChange={ev => _onBranchSelected(ev.target.value)}
            disabled={disabled}
          >
            {[
              <option key="all" value="all">
                ทุกสาขา
              </option>,
              ...Object.keys(branches).map(key => (
                <option key={key} value={key}>
                  {branches[key].branchName}
                </option>
              ))
            ]}
          </FormSelect>
        </Col>
        <Col md="4" className="mb-sm-0 mt-2">
          <FormSelect name="range" value={range} onChange={ev => _onRangeChange(ev.target.value)} disabled={disabled}>
            <option value={DateRange.today}>{DateRange.today}</option>
            <option value={DateRange.thisWeek}>{DateRange.thisWeek}</option>
            <option value={DateRange.thisMonth}>{DateRange.thisMonth}</option>
            <option value={DateRange.sevenDays}>{DateRange.sevenDays}</option>
            <option value={DateRange.thirtyDays}>{DateRange.thirtyDays}</option>
            <option value={DateRange.custom}>{DateRange.custom}</option>
          </FormSelect>
        </Col>
        {range === DateRange.custom ? (
          <Col md="4" className="mt-2">
            <RangeDatePicker onStartDateChange={_onStartDateSelected} onEndDateChange={_onEndDateSelected} />
          </Col>
        ) : (
          <Col md="4" />
        )}
      </Row>
    </CardHeader>
  );
};

export default BranchDateRangeHeader;
