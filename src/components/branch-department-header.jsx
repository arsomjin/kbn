import React from 'react';
import { Row, Col } from 'antd';
import BranchSelector from './BranchSelector';
import DepartmentSelector from './DepartmentSelector';
import PageTitle from './common/PageTitle';

/**
 * BranchDepartmentHeader Component
 * Provides a header with branch and department selectors for reports and forms
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle
 * @param {boolean} props.disabled - If true, disables all selectors
 * @param {Function} props.onBranchChange - Callback when branch selection changes
 * @param {Function} props.onDepartmentChange - Callback when department selection changes
 * @param {boolean} props.disableAllBranches - If true, disables "All Branches" option
 * @param {boolean} props.disableAllDepartments - If true, disables "All Departments" option
 * @param {string} props.defaultBranch - Default branch value
 * @param {string} props.defaultDepartment - Default department value
 * @param {React.ReactNode} props.extendedComponent - Additional component to render
 */
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
  extendedComponent,
}) => {
  const _onBranchSelected = (br) => {
    //  showLog('branchSelected', br);
    onBranchChange(br);
  };

  const _onDepartmentSelected = (dp) => {
    //  showLog('departmentSelected', dp);
    onDepartmentChange(dp);
  };

  let md = extendedComponent ? '3' : '4';

  return (
    <Row
      gutter={[16, 16]}
      className="page-header py-4 align-items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm"
      align="middle"
    >
      <PageTitle
        sm={md}
        title={title}
        subtitle={subtitle}
        className="text-left text-gray-800 dark:text-gray-200"
      />
      <Col xs={24} sm={12} md={md} lg={md} xl={md}>
        <BranchSelector
          hasAll={!disableAllBranches}
          onChange={_onBranchSelected}
          defaultValue={defaultBranch}
          disabled={disabled}
          style={{ width: '100%' }}
          className="my-2"
        />
      </Col>
      <Col xs={24} sm={12} md={md} lg={md} xl={md}>
        <DepartmentSelector
          hasAll={!disableAllDepartments}
          onChange={_onDepartmentSelected}
          defaultValue={defaultDepartment}
          disabled={disabled}
          style={{ width: '100%' }}
        />
      </Col>
      {extendedComponent && (
        <Col xs={24} sm={12} md={md} lg={md} xl={md}>
          {extendedComponent}
        </Col>
      )}
    </Row>
  );
};

export default BranchDepartmentHeader;
