import React from 'react';
import { DatePicker, Stepper } from 'elements';
import { Row, Col } from 'shards-react';
import BranchSelector from './BranchSelector';
import PageTitle from './common/PageTitle';
import { Form } from 'antd';
import { formItemClass } from 'data/Constant';
import { InputGroup } from 'elements';

const BranchYearHeader = ({
  title,
  subtitle,
  disabled,
  disableAllBranches,
  branchName,
  yearName,
  steps,
  activeStep,
  isRange,
  yearLabel,
  branchLabel,
  extraComponent,
  extraName,
  yearDisabled,
  onlyUserBranch
}) => {
  return (
    <div className="page-header p-3 ">
      <Row>
        {(title || subtitle) && <PageTitle sm="4" title={title} subtitle={subtitle} className="text-sm-left" />}
        {!!steps && (
          <Col>
            <Stepper
              className="bg-light"
              steps={steps}
              activeStep={activeStep}
              alternativeLabel={false} // In-line labels
            />
          </Col>
        )}
      </Row>
      <Row className="mt-3">
        <Col md="4">
          <Form.Item
            // label="สาขา"
            name={branchName || 'branchCode'}
            className={formItemClass}
          >
            <InputGroup
              spans={[8, 16]}
              addonBefore={branchLabel || 'สาขา'}
              inputComponent={props => (
                <BranchSelector
                  hasAll={!disableAllBranches}
                  disabled={disabled}
                  style={{ display: 'flex' }}
                  onlyUserBranch={onlyUserBranch}
                  {...props}
                />
              )}
              className="text-center"
            />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item
            // label={isRange ? 'ช่วงปี' : 'ปี'}
            name={yearName || (isRange ? 'yearRange' : 'year')}
            className={formItemClass}
          >
            <InputGroup
              spans={[8, 16]}
              addonBefore={yearLabel || (isRange ? 'ช่วงปี' : 'ปี')}
              inputComponent={props => (
                <DatePicker picker="year" isRange={isRange} disabled={yearDisabled || disabled} {...props} />
              )}
            />
          </Form.Item>
        </Col>
        {extraComponent && (
          <Col md="4">
            <Form.Item
              // label={isRange ? 'ช่วงปี' : 'ปี'}
              name={extraName}
              className={formItemClass}
            >
              {extraComponent}
            </Form.Item>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default BranchYearHeader;
