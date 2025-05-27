import { DateRange } from 'data/Constant';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Card, Row, Col, Select } from 'antd';
import RangeDatePicker from './common/RangeDatePicker';

const { Option } = Select;

/**
 * BranchDateRangeHeader Component
 * Provides a header with branch selector and date range picker for reports
 * @param {Object} props - Component props
 * @param {boolean} props.disabled - If true, disables all selectors
 * @param {Function} props.onBranchChange - Callback when branch selection changes
 * @param {Function} props.onRangeChange - Callback when date range changes
 * @param {Function} props.onStartDateChange - Callback when start date changes
 * @param {Function} props.onEndDateChange - Callback when end date changes
 */
const BranchDateRangeHeader = ({
  disabled,
  onBranchChange,
  onRangeChange,
  onStartDateChange,
  onEndDateChange,
}) => {
  const { t } = useTranslation('components');
  const { branches } = useSelector((state) => state.data);
  const [branchCode, setBranch] = useState('all');
  const [range, setRange] = useState(DateRange.today);

  const _onBranchSelected = (br) => {
    setBranch(br);
    onBranchChange && onBranchChange(br);
  };

  const _onStartDateSelected = useCallback(
    (dateValue) => {
      onStartDateChange && onStartDateChange(dateValue);
    },
    [onStartDateChange],
  );

  const _onEndDateSelected = useCallback(
    (dateValue) => {
      onEndDateChange && onEndDateChange(dateValue);
    },
    [onEndDateChange],
  );

  const _onRangeChange = useCallback(
    (rng) => {
      setRange(rng);
      onRangeChange && onRangeChange(rng);
    },
    [onRangeChange],
  );

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm">
      <Row gutter={[16, 16]} align="middle" className="p-2">
        <Col xs={24} sm={8} md={6} lg={4}>
          <Select
            value={branchCode}
            onChange={_onBranchSelected}
            disabled={disabled}
            style={{ width: '100%' }}
            placeholder={t('branchSelector.placeholder')}
          >
            <Option key="all" value="all">
              {t('branchSelector.all')}
            </Option>
            {Object.keys(branches).map((key) => (
              <Option key={key} value={key}>
                {branches[key].branchName}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8} md={6} lg={4}>
          <Select
            value={range}
            onChange={_onRangeChange}
            disabled={disabled}
            style={{ width: '100%' }}
            placeholder={t('dateRange.placeholder')}
          >
            <Option value={DateRange.today}>{DateRange.today}</Option>
            <Option value={DateRange.thisWeek}>{DateRange.thisWeek}</Option>
            <Option value={DateRange.thisMonth}>{DateRange.thisMonth}</Option>
            <Option value={DateRange.sevenDays}>{DateRange.sevenDays}</Option>
            <Option value={DateRange.thirtyDays}>{DateRange.thirtyDays}</Option>
            <Option value={DateRange.custom}>{DateRange.custom}</Option>
          </Select>
        </Col>
        <Col xs={24} sm={8} md={6} lg={4}>
          {range === DateRange.custom && (
            <RangeDatePicker
              onStartDateChange={_onStartDateSelected}
              onEndDateChange={_onEndDateSelected}
            />
          )}
        </Col>
      </Row>
    </Card>
  );
};

export default BranchDateRangeHeader;
