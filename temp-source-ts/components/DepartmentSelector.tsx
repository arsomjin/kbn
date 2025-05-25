import React, { useMemo } from 'react';
import { Select, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { Department } from 'services/departmentService';
import { useDepartmentContext } from 'contexts/DepartmentContext';
interface DepartmentSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  provinceId?: string;
  label?: string;
  required?: boolean;
  size?: 'large' | 'middle' | 'small';
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
  value,
  onChange,
  provinceId,
  label = 'Department',
  required = false,
  size = 'large',
  placeholder = 'Select department',
  disabled = false
}) => {
  const { t } = useTranslation(['departments', 'common']);

  // Use memoized selector to prevent unnecessary rerenders
  const { departments, loading } = useSelector(
    (state: RootState) => ({
      departments: state.departments.departments,
      loading: state.departments.loading
    }),
    (prev, next) => {
      // Only rerender if departments or loading state changes
      return prev.departments === next.departments && prev.loading === next.loading;
    }
  );

  // Filter departments by province if provinceId is provided
  const filteredDepartments = useMemo(() => {
    if (!provinceId) return departments;
    return Object.entries(departments).reduce(
      (acc, [id, dept]) => {
        if (dept.provinceId === provinceId) {
          acc[id] = dept;
        }
        return acc;
      },
      {} as Record<string, Department>
    );
  }, [departments, provinceId]);

  return (
    <Select
      showSearch
      value={value}
      onChange={onChange}
      placeholder={placeholder || t('selectDepartment', { ns: 'departments' })}
      disabled={disabled || loading}
      loading={loading}
      optionFilterProp='children'
      filterOption={(input, option) => {
        const optionText = typeof option?.children === 'string' ? option.children : '';
        return optionText.toLowerCase().includes(input.toLowerCase());
      }}
      style={{ width: '100%' }}
      size={size}
      notFoundContent={loading ? <Spin size='small' /> : t('noDepartmentFound', { ns: 'departments' })}
    >
      {Object.entries(filteredDepartments).map(([id, dept]) => {
        return (
          <Select.Option key={id} value={id}>
            {dept.department}
          </Select.Option>
        );
      })}
    </Select>
  );
};

export default DepartmentSelector;
