import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { validateEmployeeData } from '../utils/employeeUtils';
import { EmployeeFormData } from '../types';

export const useEmployeeValidation = () => {
  const { t } = useTranslation();

  const validateForm = useCallback(
    (values: Partial<EmployeeFormData>) => {
      const errors = validateEmployeeData(values);
      return errors.map(error => t(`validation.${error}`));
    },
    [t]
  );

  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validatePhone = useCallback((phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }, []);

  const validateBankAccount = useCallback((account: string) => {
    const accountRegex = /^[0-9]{10}$/;
    return accountRegex.test(account.replace(/\D/g, ''));
  }, []);

  const validateSalary = useCallback((salary: number) => {
    return salary > 0 && salary <= 1000000; // Maximum salary of 1 million THB
  }, []);

  return {
    validateForm,
    validateEmail,
    validatePhone,
    validateBankAccount,
    validateSalary
  };
};
