import React from 'react';
import { DurationPicker, Stepper } from 'elements';
import { Row, Col } from 'shards-react';
import BranchSelector from './BranchSelector';
import PageTitle from './common/PageTitle';
import { Form } from 'antd';
import { formItemClass } from 'data/Constant';

const BranchDateHeader = ({
  title,
  subtitle,
  disabled,
  disableAllBranches,
  branchName,
  dateName,
  steps,
  activeStep,
  hasAllDate,
  defaultDuration
}) => {
  if (steps) {
    return (
      <div className="page-header p-3 ">
        <Row>
          {(title || subtitle) && <PageTitle sm="4" title={title} subtitle={subtitle} className="text-sm-left" />}
          <Col>
            <Stepper
              className="bg-light"
              steps={steps}
              activeStep={activeStep}
              alternativeLabel={false} // In-line labels
            />
          </Col>
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
          <Col md="4">
            <Form.Item label="ช่วงเวลา" name={dateName || 'date'} className={formItemClass}>
              <DurationPicker placeholder="ช่วงเวลา" />
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  }
  return (
    <Row className="page-header py-3 align-items-center">
      {(title || subtitle) && <PageTitle sm="4" title={title} subtitle={subtitle} className="text-sm-left" />}
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
      <Col md="4">
        <Form.Item label="ช่วงเวลา" name={dateName || 'date'} className={formItemClass}>
          <DurationPicker placeholder="ช่วงเวลา" />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default BranchDateHeader;
