import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Card, Row, Col, Select } from 'antd';
import { DateRange } from 'data/Constant';
import RangeDatePicker from './common/RangeDatePicker';
import PageTitle from './common/PageTitle';
import { Stepper } from 'elements';

/**
 * BranchDateSpecificHeader Component
 *
 * A comprehensive header component for reports and pages that need branch and date range selection.
 * Features responsive design, i18next translations, and modern Ant Design components.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle
 * @param {Array} props.steps - Stepper steps array
 * @param {number} props.activeStep - Current active step
 * @param {boolean} props.disabled - Whether controls are disabled
 * @param {Function} props.onBranchChange - Branch selection callback
 * @param {Function} props.onRangeChange - Date range selection callback
 * @param {Function} props.onStartDateChange - Start date change callback
 * @param {Function} props.onEndDateChange - End date change callback
 * @param {boolean} props.noBranch - Whether to hide branch selector
 * @param {boolean} props.noRange - Whether to hide range selector
 * @param {React.ReactNode} props.extraComponent - Additional component to render
 * @param {string} props.sm - Grid size for title
 * @param {string} props.onlyUserBranch - Restrict to specific branch
 * @param {Array} props.defaultRange - Default date range [start, end]
 * @returns {React.ReactElement} Branch date specific header component
 */
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
  defaultRange = [],
}) => {
  const { t } = useTranslation('components');
  const { branches } = useSelector((state) => state.data);
  const [branchCode, setBranch] = useState(onlyUserBranch || 'all');
  const [range, setRange] = useState(DateRange.today);

  /**
   * Handle branch selection
   * @param {string} br - Selected branch code
   */
  const _onBranchSelected = (br) => {
    setBranch(br);
    onBranchChange && onBranchChange(br);
  };

  /**
   * Handle start date selection
   * @param {Date} dateValue - Selected start date
   */
  const _onStartDateSelected = useCallback(
    (dateValue) => {
      onStartDateChange && onStartDateChange(dateValue);
    },
    [onStartDateChange],
  );

  /**
   * Handle end date selection
   * @param {Date} dateValue - Selected end date
   */
  const _onEndDateSelected = useCallback(
    (dateValue) => {
      onEndDateChange && onEndDateChange(dateValue);
    },
    [onEndDateChange],
  );

  /**
   * Handle date range selection
   * @param {string} rng - Selected range type
   */
  const _onRangeChange = useCallback(
    (rng) => {
      setRange(rng);
      onRangeChange && onRangeChange(rng);
    },
    [onRangeChange],
  );

  return (
    <Card
      className="mb-4 shadow-sm border-gray-200 dark:border-gray-700 dark:bg-gray-800"
      bodyStyle={{ padding: '16px 24px' }}
    >
      <Row gutter={[16, 16]} align="middle">
        {(title || subtitle) && (
          <Col xs={24} sm={12} md={sm ? parseInt(sm) * 2 : 8}>
            <PageTitle
              sm={sm || '4'}
              title={title}
              subtitle={subtitle}
              className="text-left mb-0"
            />
          </Col>
        )}
        {!!steps && (
          <Col xs={24} sm={12} md={8}>
            <Stepper
              className="bg-gray-50 dark:bg-gray-700 rounded p-2"
              steps={steps}
              activeStep={activeStep}
            />
          </Col>
        )}
      </Row>

      <Row gutter={[16, 16]} align="middle" className="mt-4">
        {!noBranch && (
          <Col xs={24} sm={12} md={6}>
            <Select
              value={branchCode}
              onChange={_onBranchSelected}
              disabled={disabled}
              className="w-full"
              placeholder={t('branchDateSpecificHeader.selectBranch')}
            >
              <Select.Option
                key="all"
                value="all"
                disabled={!!onlyUserBranch && onlyUserBranch !== '0450'}
              >
                {t('branchDateSpecificHeader.allBranches')}
              </Select.Option>
              {Object.keys(branches).map((key) => (
                <Select.Option
                  key={key}
                  value={key}
                  disabled={
                    !!onlyUserBranch &&
                    onlyUserBranch !== '0450' &&
                    onlyUserBranch !== branches[key].branchCode
                  }
                >
                  {branches[key].branchName}
                </Select.Option>
              ))}
            </Select>
          </Col>
        )}

        {!noRange && (
          <Col xs={24} sm={12} md={6}>
            <Select
              value={range}
              onChange={_onRangeChange}
              disabled={disabled}
              className="w-full"
              placeholder={t('branchDateSpecificHeader.selectRange')}
            >
              <Select.Option value={DateRange.today}>
                {t('branchDateSpecificHeader.ranges.today')}
              </Select.Option>
              <Select.Option value={DateRange.thisWeek}>
                {t('branchDateSpecificHeader.ranges.thisWeek')}
              </Select.Option>
              <Select.Option value={DateRange.thisMonth}>
                {t('branchDateSpecificHeader.ranges.thisMonth')}
              </Select.Option>
              <Select.Option value={DateRange.sevenDays}>
                {t('branchDateSpecificHeader.ranges.sevenDays')}
              </Select.Option>
              <Select.Option value={DateRange.thirtyDays}>
                {t('branchDateSpecificHeader.ranges.thirtyDays')}
              </Select.Option>
              <Select.Option value={DateRange.custom}>
                {t('branchDateSpecificHeader.ranges.custom')}
              </Select.Option>
            </Select>
          </Col>
        )}

        {(range === DateRange.custom || noRange) && (
          <Col xs={24} sm={12} md={noRange && !extraComponent ? 12 : 6}>
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
          <Col xs={24} sm={12} md={6}>
            {extraComponent}
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default BranchDateSpecificHeader;
