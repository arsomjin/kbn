import React from 'react';
import { Form, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { DurationPicker, Stepper } from 'elements';
import BranchSelector from './BranchSelector';
import PageTitle from './common/PageTitle';
import { formItemClass } from 'data/Constant';
import { useResponsive } from 'hooks/useResponsive';

/**
 * BranchDateRangeHeader - Modern header component with branch selector and date range picker
 * @param {Object} props - Component props
 * @param {string} props.title - Header title
 * @param {string} props.subtitle - Header subtitle
 * @param {boolean} props.disabled - Disable all form controls
 * @param {boolean} props.disableAllBranches - Disable "All branches" option
 * @param {string} props.branchName - Form field name for branch selector
 * @param {string} props.dateName - Form field name for date picker
 * @param {Array} props.steps - Stepper steps configuration
 * @param {number} props.activeStep - Current active step
 * @param {boolean} props.hasAllDate - Include "All dates" option
 * @param {Object} props.defaultDuration - Default duration value
 */
const BranchDateRangeHeader = ({
  title,
  subtitle,
  disabled = false,
  disableAllBranches = false,
  branchName = 'branchCode',
  dateName = 'date',
  steps,
  activeStep,
  hasAllDate = false,
  defaultDuration,
}) => {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();

  if (steps) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <Row gutter={[16, 16]}>
          {(title || subtitle) && (
            <Col xs={24} sm={12} md={8}>
              <PageTitle title={title} subtitle={subtitle} className="text-left" />
            </Col>
          )}
          <Col xs={24} sm={12} md={16}>
            <Stepper
              className="bg-gray-50 dark:bg-gray-700 p-2 rounded"
              steps={steps}
              activeStep={activeStep}
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label={t('components.branchSelector.label')}
              name={branchName}
              className={formItemClass}
            >
              <BranchSelector
                hasAll={!disableAllBranches}
                disabled={disabled}
                placeholder={t('components.branchSelector.placeholder')}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label={t('components.dateRange.label')}
              name={dateName}
              className={formItemClass}
            >
              <DurationPicker
                placeholder={t('components.dateRange.placeholder')}
                disabled={disabled}
                hasAllDate={hasAllDate}
                defaultValue={defaultDuration}
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <Row
      gutter={[16, 16]}
      className="bg-white dark:bg-gray-800 py-3 px-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 items-center"
    >
      {(title || subtitle) && (
        <Col xs={24} sm={12} md={8}>
          <PageTitle title={title} subtitle={subtitle} className="text-left" />
        </Col>
      )}
      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label={t('components.branchSelector.label')}
          name={branchName}
          className={formItemClass}
        >
          <BranchSelector
            hasAll={!disableAllBranches}
            disabled={disabled}
            placeholder={t('components.branchSelector.placeholder')}
          />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label={t('components.dateRange.label')}
          name={dateName}
          className={formItemClass}
        >
          <DurationPicker
            placeholder={t('components.dateRange.placeholder')}
            disabled={disabled}
            hasAllDate={hasAllDate}
            defaultValue={defaultDuration}
          />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default BranchDateRangeHeader;
