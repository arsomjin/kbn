/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Select } from 'antd';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

const DepartmentSelector = forwardRef(({ hasAll, ...props }, ref) => {
  const { t } = useTranslation();
  const { departments } = useSelector((state) => state.data);
  const selectRef = useRef();

  useImperativeHandle(
    ref,
    () => ({
      focus: () => selectRef.current?.focus(),
      blur: () => selectRef.current?.blur(),
      clear: () => selectRef.current?.clear(),
      isFocused: () => selectRef.current?.isFocused(),
      setNativeProps: (nativeProps) => selectRef.current?.setNativeProps(nativeProps),
    }),
    [],
  );

  const options = Object.entries(departments)
    .filter(([, dept]) => dept.department && !dept.deleted)
    .map(([id, dept]) => (
      <Option key={id} value={id}>
        {dept.department}
      </Option>
    ));

  return (
    <Select ref={selectRef} placeholder={t('profile:department')} {...props}>
      {hasAll
        ? [
            <Option key="all" value="all">
              {t('common:allDepartments')}
            </Option>,
            ...options,
          ]
        : options}
    </Select>
  );
});

DepartmentSelector.displayName = 'DepartmentSelector';

export default DepartmentSelector;
