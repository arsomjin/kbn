import React from 'react';
import { Row, Col, Form } from 'antd';
import PropTypes from 'prop-types';
import { formItemClass } from 'data/Constant';
import SaleTypeSelector from './SaleTypeSelector';
import CommonSelector from './CommonSelector';
import { VehicleType } from 'data/Constant';

const ReportHeader = ({
  title,
  subtitle,
  disabled,
  disableAllBranches,
  branchName,
  durationName,
  defaultDuration,
  type,
  isDateRange,
  disableAllTypes,
}) => {
  return (
    <Row justify='center'>
      {type === 'sale' && (
        <Col md={8}>
          <Form.Item
            label='ประเภทการขาย'
            name='saleType'
            className={formItemClass}
          >
            <SaleTypeSelector
              placeholder='ประเภทการขาย'
              hasAll={!disableAllTypes}
            />
          </Form.Item>
        </Col>
      )}
      <Col md={8}>
        <Form.Item
          label='ประเภทรถ'
          name={'vehicleType'}
          className={formItemClass}
        >
          <CommonSelector placeholder='รถ' optionData={VehicleType} hasAll />
        </Form.Item>
      </Col>
    </Row>
  );
};

ReportHeader.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  disabled: PropTypes.bool,
  disableAllBranches: PropTypes.bool,
  branchName: PropTypes.string,
  durationName: PropTypes.string,
  defaultDuration: PropTypes.object,
  type: PropTypes.string,
  isDateRange: PropTypes.bool,
  disableAllTypes: PropTypes.bool,
};

export default ReportHeader;
