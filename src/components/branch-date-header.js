import React from 'react';
import { DatePicker, Stepper } from 'elements';
import { Row, Col } from 'shards-react';
import BranchSelector from './BranchSelector';
import PageTitle from './common/PageTitle';
import { Form } from 'antd';
import { formItemClass } from 'data/Constant';
import { getRules } from 'api/Table';
import { isMobile, isTablet } from 'react-device-detect';

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
  onlyDate
}) => {
  if (steps) {
    return (
      <div className="page-header p-3 ">
        <Row>
          {(title || subtitle) && <PageTitle sm="4" title={title} subtitle={subtitle} className="text-sm-left" />}
          <Col>
            <Stepper
              className="nature-stepper nature-steps-compact"
              steps={steps}
              activeStep={activeStep}
              alternativeLabel={false} // In-line labels
            />
          </Col>
        </Row>
        <Row>
          {!onlyDate && (
            <Col md="4">
              <Form.Item
                label="สาขา"
                name={branchName || 'branchCode'}
                className={formItemClass}
                {...(branchRequired && { rules: getRules(['required']) })}
              >
                <BranchSelector
                  hasAll={!disableAllBranches}
                  disabled={disabled}
                  style={{ display: 'flex' }}
                  onlyUserBranch={onlyUserBranch}
                  // className="my-2"
                />
              </Form.Item>
            </Col>
          )}
          <Col md="4">
            <Form.Item
              label={dateLabel || 'วันที่'}
              name={dateName || 'date'}
              className={formItemClass}
              {...(dateRequired && { rules: getRules(['required']) })}
            >
              <DatePicker
                placeholder="วันที่"
                disabled={disabled}
                isRange={isRange}
                disabledDate={disabledDate}
                {...(isRange && {
                  allowClear: true,
                  inputReadOnly: isMobile || isTablet
                })}
              />
            </Form.Item>
          </Col>
          {extraComponent && (
            <Col md="4">
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
    <div className="page-header p-3 ">
      <Row form style={{ alignItems: 'center' }} className="mb-4">
        {/* <Row className="page-header py-3 align-items-center"> */}
        {(title || subtitle) && <PageTitle sm="8" title={title} subtitle={subtitle} className="text-sm-left" />}
      </Row>
      <Row>
        {!onlyDate && (
          <Col md="4">
            <Form.Item
              label="สาขา"
              name={branchName || 'branchCode'}
              className={formItemClass}
              {...(branchRequired && { rules: getRules(['required']) })}
            >
              <BranchSelector
                hasAll={!disableAllBranches}
                disabled={disabled}
                style={{ display: 'flex' }}
                onlyUserBranch={onlyUserBranch}
                // className="my-2"
              />
            </Form.Item>
          </Col>
        )}
        <Col md="4">
          <Form.Item
            label={dateLabel || 'วันที่'}
            name={dateName || 'date'}
            className={formItemClass}
            {...(dateRequired && { rules: getRules(['required']) })}
          >
            <DatePicker
              placeholder="วันที่"
              disabled={disabled}
              isRange={isRange}
              disabledDate={disabledDate}
              {...(isRange && {
                allowClear: true,
                inputReadOnly: isMobile || isTablet
              })}
            />
          </Form.Item>
        </Col>
        {extraComponent && (
          <Col md="4">
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
