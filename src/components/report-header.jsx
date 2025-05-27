import React from 'react';
import { Row, Col, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { useResponsive } from 'hooks/useResponsive';
import SaleTypeSelector from './SaleTypeSelector';
import CommonSelector from './CommonSelector';
import BranchSelector from './BranchSelector';
import { DatePicker } from 'elements';
import { VehicleType, formItemClass } from 'data/Constant';

/**
 * ReportHeader component for displaying common report filter options
 * @param {Object} props - Component props
 * @param {string} props.title - Report title
 * @param {string} props.subtitle - Report subtitle
 * @param {boolean} props.disabled - Whether the form fields are disabled
 * @param {boolean} props.disableAllBranches - Whether to disable branch selection
 * @param {string} props.durationName - Duration field name
 * @param {Object} props.defaultDuration - Default duration value
 * @param {string} props.type - Report type (e.g., 'sale')
 * @param {boolean} props.isDateRange - Whether to show date range picker
 * @param {boolean} props.disableAllTypes - Whether to disable type selection
 */
const ReportHeader = ({
  title,
  subtitle,
  disabled = false,
  disableAllBranches = false,
  durationName = 'month',
  defaultDuration,
  type,
  isDateRange = false,
  disableAllTypes = false,
}) => {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();

  return (
    <div className={`report-header ${isMobile ? 'mobile' : ''}`}>
      {/* Header Section */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h1>
          )}
          {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
        </div>
      )}

      {/* Filter Section */}
      <Row
        gutter={[16, 16]}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        {/* Branch Selector */}
        {!disableAllBranches && (
          <Col xs={24} sm={12} md={6}>
            <Form.Item label={t('reportHeader.branch')} name="branch" className={formItemClass}>
              <BranchSelector
                placeholder={t('reportHeader.selectBranch')}
                disabled={disabled}
                hasAll={!disableAllBranches}
              />
            </Form.Item>
          </Col>
        )}

        {/* Sale Type Selector */}
        {type === 'sale' && (
          <Col xs={24} sm={12} md={6}>
            <Form.Item label={t('reportHeader.saleType')} name="saleType" className={formItemClass}>
              <SaleTypeSelector
                placeholder={t('reportHeader.selectSaleType')}
                hasAll={!disableAllTypes}
                disabled={disabled}
              />
            </Form.Item>
          </Col>
        )}

        {/* Vehicle Type Selector */}
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label={t('reportHeader.vehicleType')}
            name="vehicleType"
            className={formItemClass}
          >
            <CommonSelector
              placeholder={t('reportHeader.selectVehicleType')}
              optionData={VehicleType}
              hasAll
              disabled={disabled}
            />
          </Form.Item>
        </Col>

        {/* Date Range / Duration Picker */}
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label={isDateRange ? t('reportHeader.dateRange') : t('reportHeader.duration')}
            name={isDateRange ? 'dateRange' : durationName}
            className={formItemClass}
          >
            <DatePicker
              placeholder={
                isDateRange ? t('reportHeader.selectDateRange') : t('reportHeader.selectDuration')
              }
              picker={isDateRange ? 'range' : 'month'}
              disabled={disabled}
              defaultValue={defaultDuration}
              className="w-full"
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default ReportHeader;
