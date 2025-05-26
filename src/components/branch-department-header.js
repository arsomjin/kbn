import React from 'react';
import { Row, Col } from 'shards-react';
import BranchSelector from './BranchSelector';
import DepartmentSelector from './DepartmentSelector';
import PageTitle from './common/PageTitle';

const BranchDepartmentHeader = ({
  title,
  subtitle,
  disabled,
  onBranchChange,
  onDepartmentChange,
  disableAllBranches,
  disableAllDepartments,
  defaultBranch,
  defaultDepartment,
  extendedComponent
}) => {
  const _onBranchSelected = br => {
    //  showLog('branchSelected', br);
    onBranchChange(br);
  };

  const _onDepartmentSelected = dp => {
    //  showLog('departmentSelected', dp);
    onDepartmentChange(dp);
  };

  let md = extendedComponent ? '3' : '4';

  return (
    <Row form className="page-header py-4 align-items-center">
      <PageTitle sm={md} title={title} subtitle={subtitle} className="text-sm-left" />
      <Col md={md}>
        <BranchSelector
          hasAll={!disableAllBranches}
          onChange={_onBranchSelected}
          defaultValue={defaultBranch}
          disabled={disabled}
          style={{ display: 'flex' }}
          className="my-2"
        />
      </Col>
      <Col md={md}>
        <DepartmentSelector
          hasAll={!disableAllDepartments}
          onChange={_onDepartmentSelected}
          defaultValue={defaultDepartment}
          disabled={disabled}
          style={{ display: 'flex' }}
        />
      </Col>
      {extendedComponent && <Col md={md}>{extendedComponent}</Col>}
    </Row>
  );
};

export default BranchDepartmentHeader;
