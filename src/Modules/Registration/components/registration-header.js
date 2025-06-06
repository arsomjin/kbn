import React from 'react';
import { DatePicker } from 'elements';
import { Row, Col } from 'shards-react';
import BranchSelector from 'components/BranchSelector';
import PageTitle from 'components/common/PageTitle';
import { Form } from 'antd';
import { formItemClass } from 'data/Constant';
import SaleTypeSelector from 'components/SaleTypeSelector';

const RegistrationHeader = ({
  title,
  subtitle,
  disabled,
  disableAllBranches,
  branchName,
  dateName,
  type,
  isDateRange,
  disableAllTypes
}) => {
  return (
    <div className="page-header p-3 ">
      <Row className="mb-4">
        {(title || subtitle) && <PageTitle sm="4" title={title} subtitle={subtitle} className="text-sm-left" />}
      </Row>
      <Row>
        <Col md="4">
          <Form.Item label="สาขา" name={branchName || 'branchCode'} className={formItemClass}>
            <BranchSelector
              hasAll={!disableAllBranches}
              disabled={disabled}
              style={{ display: 'flex' }}
              // className="my-2"
            />
          </Form.Item>
        </Col>
        {type === 'sale' && (
          <Col md="4">
            <Form.Item label="ประเภทการขาย" name="saleType" className={formItemClass}>
              <SaleTypeSelector placeholder="ประเภทการขาย" hasAll={!disableAllTypes} />
            </Form.Item>
          </Col>
        )}
        <Col md="4">
          <Form.Item label="วันที่" name={dateName || (isDateRange ? 'range' : 'date')} className={formItemClass}>
            <DatePicker placeholder="วันที่" isRange={isDateRange} />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default RegistrationHeader;
