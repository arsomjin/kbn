import React from 'react';
import { Row, Col } from 'shards-react';
import { Form } from 'antd';
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
  disableAllTypes
}) => {
  return (
    <Row className="justify-content-center">
      {type === 'sale' && (
        <Col md="4">
          <Form.Item label="ประเภทการขาย" name="saleType" className={formItemClass}>
            <SaleTypeSelector placeholder="ประเภทการขาย" hasAll={!disableAllTypes} />
          </Form.Item>
        </Col>
      )}
      <Col md="4">
        <Form.Item label="ประเภทรถ" name={'vehicleType'} className={formItemClass}>
          <CommonSelector placeholder="รถ" optionData={VehicleType} hasAll />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default ReportHeader;
