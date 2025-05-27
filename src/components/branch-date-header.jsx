import React from 'react';
import { DatePicker, Stepper } from 'elements';
import { Row, Col, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import BranchSelector from './BranchSelector';
import PageTitle from './common/PageTitle';
import { formItemClass } from 'data/Constant';
import { getRules } from 'api/Table';
import { isMobile, isTablet } from 'react-device-detect';

/**
 * BranchDateHeader Component
 * Provides a header with branch selector, date picker, and optional stepper
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle
 * @param {boolean} props.disabled - If true, disables all controls
 * @param {boolean} props.disableAllBranches - If true, disables "All Branches" option
 * @param {string} props.branchName - Name for branch form field
 * @param {string} props.dateName - Name for date form field
 * @param {Array} props.steps - Stepper steps array
 * @param {number} props.activeStep - Current active step
 * @param {string} props.dateLabel - Custom label for date field
 * @param {boolean} props.branchRequired - If true, makes branch field required
 * @param {boolean} props.dateRequired - If true, makes date field required
 * @param {React.ReactNode} props.extraComponent - Additional component to render
 * @param {string} props.extraName - Name for extra component form field
 * @param {string} props.extraLabel - Label for extra component
 * @param {boolean} props.onlyUserBranch - If true, shows only user's branch
 * @param {boolean} props.isRange - If true, shows date range picker
 * @param {Function} props.disabledDate - Function to disable specific dates
 * @param {boolean} props.onlyDate - If true, shows only date picker
 */
const BranchDateHeader = ({
  title,
  subtitle,
  disabled,
  disableAllBranches,
  branchName,
  dateName,
  steps,
  activeStep,
  dateLabel,
  branchRequired,
  dateRequired,
  extraComponent,
  extraName,
  extraLabel,
  onlyUserBranch,
  isRange,
  disabledDate,
  onlyDate,
}) => {
  const { t } = useTranslation('components');
  if (steps) {
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
          <Col xs={24} sm={12} md={16} lg={18}>
            <Stepper
              className="bg-gray-50 dark:bg-gray-700 rounded-md p-2"
              steps={steps}
              activeStep={activeStep}
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="mt-4">
          {!onlyDate && (
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label={t('branchDateHeader.branch')}
                name={branchName || 'branchCode'}
                className={formItemClass}
                {...(branchRequired && { rules: getRules(['required']) })}
              >
                <BranchSelector
                  hasAll={!disableAllBranches}
                  disabled={disabled}
                  style={{ width: '100%' }}
                  onlyUserBranch={onlyUserBranch}
                />
              </Form.Item>
            </Col>
          )}
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              label={dateLabel || t('branchDateHeader.date')}
              name={dateName || 'date'}
              className={formItemClass}
              {...(dateRequired && { rules: getRules(['required']) })}
            >
              <DatePicker
                placeholder={t('branchDateHeader.date')}
                disabled={disabled}
                isRange={isRange}
                disabledDate={disabledDate}
                style={{ width: '100%' }}
                {...(isRange && {
                  allowClear: true,
                  inputReadOnly: isMobile || isTablet,
                })}
              />
            </Form.Item>
          </Col>
          {extraComponent && (
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                {...(extraName && { name: extraName })}
                {...(extraLabel && { label: extraLabel })}
                {...(formItemClass && { className: formItemClass })}
              >
                {extraComponent}
              </Form.Item>
            </Col>
          )}
        </Row>
      </div>
    );
  }
  return (
    <div className="page-header p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <Row gutter={[16, 16]} align="middle" className="mb-4">
        {(title || subtitle) && (
          <Col xs={24} sm={12} md={16} lg={18}>
            <PageTitle
              sm="8"
              title={title}
              subtitle={subtitle}
              className="text-left text-gray-800 dark:text-gray-200"
            />
          </Col>
        )}
      </Row>
      <Row gutter={[16, 16]}>
        {!onlyDate && (
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              label={t('branchDateHeader.branch')}
              name={branchName || 'branchCode'}
              className={formItemClass}
              {...(branchRequired && { rules: getRules(['required']) })}
            >
              <BranchSelector
                hasAll={!disableAllBranches}
                disabled={disabled}
                style={{ width: '100%' }}
                onlyUserBranch={onlyUserBranch}
              />
            </Form.Item>
          </Col>
        )}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item
            label={dateLabel || t('branchDateHeader.date')}
            name={dateName || 'date'}
            className={formItemClass}
            {...(dateRequired && { rules: getRules(['required']) })}
          >
            <DatePicker
              placeholder={t('branchDateHeader.date')}
              disabled={disabled}
              isRange={isRange}
              disabledDate={disabledDate}
              style={{ width: '100%' }}
              {...(isRange && {
                allowClear: true,
                inputReadOnly: isMobile || isTablet,
              })}
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

export default BranchDateHeader;
