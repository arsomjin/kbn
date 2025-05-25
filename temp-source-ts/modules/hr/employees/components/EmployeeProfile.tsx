// EmployeeProfile component (migrated from legacy)
// TODO: Convert to TypeScript, use Ant Design + Tailwind, i18next, and update props

import React from 'react';
import { Card, Row, Col } from 'antd';
import { EmpDetails } from './EmpDetails';
import { EmployeeAccountDetails } from './EmployeeAccountDetails';

interface EmployeeProfileProps {
  employee: any;
  isEdit: boolean;
  onClose: () => void;
  provinceId?: string;
}

/**
 * EmployeeProfile migrated: shows employee details and account info
 */
export const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ employee, isEdit, onClose, provinceId }) => {
  return (
    <Card bordered={false} className='mb-4'>
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <EmpDetails employee={employee} />
        </Col>
        <Col xs={24} md={16}>
          <EmployeeAccountDetails employee={employee} isEdit={isEdit} onClose={onClose} provinceId={provinceId} />
        </Col>
      </Row>
    </Card>
  );
};

export default EmployeeProfile;
