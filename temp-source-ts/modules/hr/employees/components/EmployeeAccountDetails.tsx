import React from 'react';
import { Card, Button } from 'antd';

// EmployeeAccountDetails component (migrated from legacy)
// TODO: Convert to TypeScript, use Ant Design + Tailwind, i18next, and update props

interface EmployeeAccountDetailsProps {
  employee: any;
  isEdit: boolean;
  onClose: () => void;
  provinceId?: string;
}

/**
 * EmployeeAccountDetails migrated: shows/edit employee account info (stub)
 */
export const EmployeeAccountDetails: React.FC<EmployeeAccountDetailsProps> = ({
  employee,
  isEdit,
  onClose,
  provinceId
}) => {
  if (!employee) return null;
  return (
    <Card bordered className='mb-2'>
      <div className='mb-2'>
        Account details for:{' '}
        <b>
          {employee.firstName} {employee.lastName}
        </b>
      </div>
      {/* TODO: Add editable form fields and save logic */}
      <Button onClick={onClose}>Close</Button>
    </Card>
  );
};
