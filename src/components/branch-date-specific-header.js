import { DateRange } from 'data/Constant';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { CardHeader, Row, Col, FormSelect } from 'shards-react';
import RangeDatePicker from './common/RangeDatePicker';
import PageTitle from './common/PageTitle';
import { Stepper } from 'elements';

const BranchDateSpecificHeader = ({
  title,
  subtitle,
  steps,
  activeStep,
  disabled,
  onBranchChange,
  onRangeChange,
  onStartDateChange,
  onEndDateChange,
  noBranch,
  noRange,
  extraComponent,
  sm,
  onlyUserBranch,
  defaultRange
}) => {
  const { branches } = useSelector(state => state.data);
  const [branchCode, setBranch] = useState(onlyUserBranch || 'all');
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
      <Row>
        {(title || subtitle) && <PageTitle sm={sm || '4'} title={title} subtitle={subtitle} className="text-sm-left" />}
        {!!steps && (
          <Col>
            <Stepper
              className="bg-light"
              steps={steps}
              activeStep={activeStep}
              alternativeLabel={false} // In-line labels
            />
          </Col>
        )}
      </Row>
      <Row style={{ alignItems: 'center' }}>
        {!noBranch && (
          <Col md="3" className="mb-2 sm-0 mt-2">
            <FormSelect
              name="branchCode"
              value={branchCode}
              onChange={ev => _onBranchSelected(ev.target.value)}
              disabled={disabled}
            >
              {[
                <option key="all" value="all" disabled={!!onlyUserBranch && onlyUserBranch !== '0450'}>
                  ทุกสาขา
                </option>,
                ...Object.keys(branches).map(key => (
                  <option
                    key={key}
                    value={key}
                    disabled={
                      !!onlyUserBranch && onlyUserBranch !== '0450' && onlyUserBranch !== branches[key].branchCode
                    }
                  >
                    {branches[key].branchName}
                  </option>
                ))
              ]}
            </FormSelect>
          </Col>
        )}
        {!noRange && (
          <Col md="5" className="mb-2">
            <FormSelect name="range" value={range} onChange={ev => _onRangeChange(ev.target.value)} disabled={disabled}>
              <option value={DateRange.today}>{DateRange.today}</option>
              <option value={DateRange.thisWeek}>{DateRange.thisWeek}</option>
              <option value={DateRange.thisMonth}>{DateRange.thisMonth}</option>
              <option value={DateRange.sevenDays}>{DateRange.sevenDays}</option>
              <option value={DateRange.thirtyDays}>{DateRange.thirtyDays}</option>
              <option value={DateRange.custom}>{DateRange.custom}</option>
            </FormSelect>
          </Col>
        )}
        {(range === DateRange.custom || noRange) && (
          <Col className="mb-2" md={noRange && !extraComponent ? '9' : '5'}>
            <RangeDatePicker
              onStartDateChange={_onStartDateSelected}
              onEndDateChange={_onEndDateSelected}
              startDateDefaultValue={defaultRange[0]}
              endDateDefaultValue={defaultRange[1]}
              size="md"
            />
          </Col>
        )}
        {extraComponent && (
          <Col md="4" className="mb-2">
            {extraComponent}
          </Col>
        )}
      </Row>
    </CardHeader>
  );
};

export default BranchDateSpecificHeader;
