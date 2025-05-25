import React from 'react';
import { Card } from 'antd';

interface EmpDetailsProps {
  employee: any;
}

/**
 * EmpDetails migrated: shows employee summary
 */
export const EmpDetails: React.FC<EmpDetailsProps> = ({ employee }) => {
  if (!employee) return null;
  return (
    <Card bordered className='mb-2'>
      <div className='font-bold text-lg mb-1'>
        {employee.firstName} {employee.lastName}
      </div>
      <div className='text-gray-500 mb-1'>{employee.position}</div>
      <div className='text-gray-400 text-xs'>{employee.employeeCode}</div>
    </Card>
  );
};
