import React from 'react';
import { DatePicker, Stepper } from 'elements';
import { Row, Col, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import BranchSelector from './BranchSelector';
import PageTitle from './common/PageTitle';
import { formItemClass } from 'data/Constant';
import { InputGroup } from 'elements';

/**
 * BranchMonthHeader Component
 * Provides a header with branch selector, month picker, and optional stepper
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle
 * @param {boolean} props.disabled - If true, disables all controls
 * @param {boolean} props.disableAllBranches - If true, disables "All Branches" option
 * @param {string} props.branchName - Name for branch form field
 * @param {string} props.monthName - Name for month form field
 * @param {Array} props.steps - Stepper steps array
 * @param {number} props.activeStep - Current active step
 * @param {boolean} props.isRange - If true, shows month range picker
 * @param {string} props.monthLabel - Custom label for month field
 * @param {string} props.branchLabel - Custom label for branch field
 * @param {React.ReactNode} props.extraComponent - Additional component to render
 * @param {boolean} props.onlyMonth - If true, shows only month picker without year
 * @param {boolean} props.onlyUserBranch - If true, shows only user's branch
 * @param {string} props.sm - Small screen column span
 */
const BranchMonthHeader = ({
  title,
  subtitle,
  disabled,
  disableAllBranches,
  branchName,
  monthName,
  steps,
  activeStep,
  isRange,
  monthLabel,
  branchLabel,
  extraComponent,
  onlyMonth,
  onlyUserBranch,
  sm,
}) => {
  const { t } = useTranslation('components');
  return (
    <div className="page-header p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <Row gutter={[16, 16]}>
        {(title || subtitle) && (
          <Col xs={24} sm={12} md={8} lg={6}>
            <PageTitle
              sm={sm || '4'}
              title={title}
              subtitle={subtitle}
              className="text-left text-gray-800 dark:text-gray-200"
            />
          </Col>
        )}
        {!!steps && (
          <Col xs={24} sm={12} md={16} lg={18}>
            <Stepper
              className="bg-gray-50 dark:bg-gray-700 rounded-md p-2"
              steps={steps}
              activeStep={activeStep}
              alternativeLabel={false} // In-line labels
            />
          </Col>
        )}
      </Row>
      <Row gutter={[16, 16]} className="mt-4">
        {!onlyMonth && (
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name={branchName || 'branchCode'} className={formItemClass}>
              <InputGroup
                spans={[8, 16]}
                addonBefore={branchLabel || t('branchMonthHeader.branch')}
                inputComponent={(props) => (
                  <BranchSelector
                    hasAll={!disableAllBranches}
                    disabled={disabled}
                    style={{ width: '100%' }}
                    onlyUserBranch={onlyUserBranch}
                    {...props}
                  />
                )}
                className="text-center"
              />
            </Form.Item>
          </Col>
        )}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item
            name={monthName || (isRange ? 'monthRange' : 'month')}
            className={formItemClass}
          >
            <InputGroup
              spans={[8, 16]}
              addonBefore={
                monthLabel ||
                (isRange ? t('branchMonthHeader.monthRange') : t('branchMonthHeader.month'))
              }
              inputComponent={(props) => (
                <DatePicker
                  picker="month"
                  isRange={isRange}
                  disabled={disabled}
                  style={{ width: '100%' }}
                  {...props}
                />
              )}
            />
          </Form.Item>
        </Col>
        {extraComponent && (
          <Col xs={24} sm={12} md={8} lg={6}>
            {extraComponent}
          </Col>
        )}
      </Row>
    </div>
  );
};

export default BranchMonthHeader;
