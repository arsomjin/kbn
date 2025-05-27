import * as React from 'react';

export interface EmployeeSelectorProps extends React.ComponentPropsWithoutRef<'select'> {
  disabled?: boolean;
  [key: string]: any;
}

declare const EmployeeSelector: React.ForwardRefExoticComponent<
  EmployeeSelectorProps & React.RefAttributes<any>
>;
export default EmployeeSelector;
