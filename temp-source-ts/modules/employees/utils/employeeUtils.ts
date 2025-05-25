import { Employee, EmployeeFormData, EmployeeStatus } from '../types';
import { DateTime } from 'luxon';

export const validateEmployeeData = (data: Partial<EmployeeFormData>): string[] => {
  const errors: string[] = [];

  if (!data.employeeId?.trim()) {
    errors.push('Employee ID is required');
  }

  if (!data.firstName?.trim()) {
    errors.push('First name is required');
  }

  if (!data.lastName?.trim()) {
    errors.push('Last name is required');
  }

  if (!data.email?.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.phone?.trim()) {
    errors.push('Phone number is required');
  }

  if (!data.position?.trim()) {
    errors.push('Position is required');
  }

  if (!data.department?.trim()) {
    errors.push('Department is required');
  }

  if (!data.startDate) {
    errors.push('Start date is required');
  }

  if (data.endDate && data.startDate && data.endDate < data.startDate) {
    errors.push('End date cannot be before start date');
  }

  if (!data.status) {
    errors.push('Status is required');
  }

  if (!data.salary || data.salary <= 0) {
    errors.push('Valid salary is required');
  }

  if (!data.bankName?.trim()) {
    errors.push('Bank name is required');
  }

  if (!data.bankAccount?.trim()) {
    errors.push('Bank account is required');
  }

  if (!data.emergencyContact?.name?.trim()) {
    errors.push('Emergency contact name is required');
  }

  if (!data.emergencyContact?.relationship?.trim()) {
    errors.push('Emergency contact relationship is required');
  }

  if (!data.emergencyContact?.phone?.trim()) {
    errors.push('Emergency contact phone is required');
  }

  return errors;
};

export const formatEmployeeData = (data: EmployeeFormData): EmployeeFormData => {
  return {
    ...data,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    position: data.position.trim(),
    department: data.department.trim(),
    address: data.address.trim(),
    bankName: data.bankName.trim(),
    bankAccount: data.bankAccount.trim(),
    emergencyContact: {
      name: data.emergencyContact.name.trim(),
      relationship: data.emergencyContact.relationship.trim(),
      phone: data.emergencyContact.phone.trim()
    }
  };
};

export const getEmployeeStatusColor = (status: EmployeeStatus): string => {
  const statusColors = {
    [EmployeeStatus.ACTIVE]: 'success',
    [EmployeeStatus.INACTIVE]: 'default',
    [EmployeeStatus.ON_LEAVE]: 'warning',
    [EmployeeStatus.TERMINATED]: 'error'
  };
  return statusColors[status];
};

export const calculateEmploymentDuration = (startDate: Date, endDate?: Date): string => {
  const start = DateTime.fromJSDate(startDate);
  const end = endDate ? DateTime.fromJSDate(endDate) : DateTime.now();

  const duration = end.diff(start, ['years', 'months', 'days']).toObject();

  const parts: string[] = [];
  if (duration.years) parts.push(`${Math.floor(duration.years)} years`);
  if (duration.months) parts.push(`${Math.floor(duration.months)} months`);
  if (duration.days) parts.push(`${Math.floor(duration.days)} days`);

  return parts.join(', ');
};

export const formatSalary = (salary: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2
  }).format(salary);
};

export const isEmployeeActive = (employee: Employee): boolean => {
  return employee.status === EmployeeStatus.ACTIVE && !employee.deleted;
};

export const getEmployeeFullName = (employee: Employee): string => {
  return `${employee.firstName} ${employee.lastName}`;
};
