import React from 'react';
import { Row, Col, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { formItemClass } from 'data/Constant';
import SaleTypeSelector from './SaleTypeSelector';

/**
 * ReportSaleHeader Component
 * Provides a header with sale type selector for sales reports
 * @param {Object} props - Component props
 * @param {boolean} props.disableAllTypes - If true, disables "All Types" option
 */
const ReportSaleHeader = ({ disableAllTypes }) => {
  const { t } = useTranslation('components');

  return (
    <Row
      gutter={[16, 16]}
      justify="center"
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
    >
      <Col xs={24} sm={12} md={8} lg={6} xl={4}>
        <Form.Item label={t('reportSaleHeader.saleType')} name="saleType" className={formItemClass}>
          <SaleTypeSelector
            placeholder={t('reportSaleHeader.saleType')}
            hasAll={!disableAllTypes}
          />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default ReportSaleHeader;
