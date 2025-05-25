import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Select } from 'antd';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { usePermissions } from 'hooks/usePermissions';

const { Option } = Select;

const InternalProvinceSelector = forwardRef(({ hasAll, ...props }, ref) => {
  const { t } = useTranslation();
  const { provinces } = useSelector((state) => state.data);
  const { hasProvinceAccess } = usePermissions();
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

  const options = Object.entries(provinces)
    .filter(([id, province]) => province.name && !province.deleted && hasProvinceAccess(id))
    .sort(([, a], [, b]) => a.name.localeCompare(b.name))
    .map(([id, province]) => (
      <Option key={id} value={id}>
        {province.name}
      </Option>
    ));

  return (
    <Select ref={selectRef} placeholder={t('profile:province')} {...props}>
      {hasAll
        ? [
            <Option key="all" value="all">
              {t('common:allProvinces')}
            </Option>,
            ...options,
          ]
        : options}
    </Select>
  );
});

InternalProvinceSelector.displayName = 'InternalProvinceSelector';

export default InternalProvinceSelector;
