import React from 'react';
import { DatePicker, Stepper } from 'elements';
import { Row, Col, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import BranchSelector from './BranchSelector';
import PageTitle from './common/PageTitle';
import { formItemClass } from 'data/Constant';
import { InputGroup } from 'elements';

/**
 * BranchYearHeader Component
 * Provides a header with branch selector, year picker, and optional stepper
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle
 * @param {boolean} props.disabled - If true, disables all controls
 * @param {boolean} props.disableAllBranches - If true, disables "All Branches" option
 * @param {string} props.branchName - Name for branch form field
 * @param {string} props.yearName - Name for year form field
 * @param {Array} props.steps - Stepper steps array
 * @param {number} props.activeStep - Current active step
 * @param {boolean} props.isRange - If true, shows year range picker
 * @param {string} props.yearLabel - Custom label for year field
 * @param {string} props.branchLabel - Custom label for branch field
 * @param {React.ReactNode} props.extraComponent - Additional component to render
 * @param {string} props.extraName - Name for extra component form field
 * @param {boolean} props.yearDisabled - If true, disables year picker
 * @param {boolean} props.onlyUserBranch - If true, shows only user's branch
 */
const BranchYearHeader = ({
  title,
  subtitle,
  disabled,
  disableAllBranches,
  branchName,
  yearName,
  steps,
  activeStep,
  isRange,
  yearLabel,
  branchLabel,
  extraComponent,
  extraName,
  yearDisabled,
  onlyUserBranch,
}) => {
  const { t } = useTranslation('components');
  return (
    <div className="page-header p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <Row gutter={[16, 16]}>
        {(title || subtitle) && (
          <Col xs={24} sm={12} md={8} lg={6}>
            <PageTitle
              sm="4"
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
            />
          </Col>
        )}
      </Row>
      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item name={branchName || 'branchCode'} className={formItemClass}>
            <InputGroup
              spans={[8, 16]}
              addonBefore={branchLabel || t('branchYearHeader.branch')}
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
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item name={yearName || (isRange ? 'yearRange' : 'year')} className={formItemClass}>
            <InputGroup
              spans={[8, 16]}
              addonBefore={
                yearLabel ||
                (isRange ? t('branchYearHeader.yearRange') : t('branchYearHeader.year'))
              }
              inputComponent={(props) => (
                <DatePicker
                  picker="year"
                  isRange={isRange}
                  disabled={yearDisabled || disabled}
                  style={{ width: '100%' }}
                  {...props}
                />
              )}
            />
          </Form.Item>
        </Col>
        {extraComponent && (
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name={extraName} className={formItemClass}>
              {extraComponent}
            </Form.Item>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default BranchYearHeader;
