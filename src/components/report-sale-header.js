import React from 'react';
import { Row, Col } from 'shards-react';
import { Form } from 'antd';
import { formItemClass } from 'data/Constant';
import SaleTypeSelector from './SaleTypeSelector';

const ReportSaleHeader = ({ disableAllTypes }) => {
  return (
    <Row className="justify-content-center">
      <Col md="4">
        <Form.Item label="ประเภทการขาย" name="saleType" className={formItemClass}>
          <SaleTypeSelector placeholder="ประเภทการขาย" hasAll={!disableAllTypes} />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default ReportSaleHeader;
