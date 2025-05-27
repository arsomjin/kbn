import React from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';

/**
 * PrefixAnt - Modern prefix selector component with i18n support
 * @param {Object} props - Component props
 * @param {string} props.label - Form label (deprecated, kept for compatibility)
 * @param {string} props.error - Error message (deprecated, kept for compatibility)
 * @param {boolean} props.onlyPerson - Show only person prefixes (exclude company types)
 * @param {boolean} props.disabled - Disable the component
 * @param {boolean} props.readOnly - Make the component read-only
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Current selected value
 * @param {Function} props.onChange - Change handler function
 */
const PrefixAnt = ({
  onlyPerson = false,
  disabled = false,
  readOnly = false,
  placeholder,
  value,
  onChange,
  ...props
}) => {
  const { t } = useTranslation();

  const personPrefixes = [
    { value: 'นาย', label: t('components.prefix.mr'), labelEn: 'Mr.' },
    { value: 'นาง', label: t('components.prefix.mrs'), labelEn: 'Mrs.' },
    { value: 'นางสาว', label: t('components.prefix.miss'), labelEn: 'Miss' },
  ];

  const companyPrefixes = [
    { value: 'ร้าน', label: t('components.prefix.shop'), labelEn: 'Shop' },
    { value: 'หจก.', label: t('components.prefix.partnership'), labelEn: 'Partnership' },
    { value: 'บจก.', label: t('components.prefix.limitedCompany'), labelEn: 'Co., Ltd.' },
    { value: 'บมจ.', label: t('components.prefix.publicCompany'), labelEn: 'PLC' },
  ];

  const allPrefixes = onlyPerson ? personPrefixes : [...personPrefixes, ...companyPrefixes];

  return (
    <Select
      placeholder={placeholder || t('components.prefix.placeholder')}
      disabled={disabled || readOnly}
      value={value}
      onChange={onChange}
      className="w-full"
      allowClear
      showSearch
      optionFilterProp="children"
      {...props}
    >
      {allPrefixes.map((prefix) => (
        <Select.Option
          key={prefix.value}
          value={prefix.value}
          title={`${prefix.label} (${prefix.labelEn})`}
        >
          <span className="flex justify-between items-center">
            <span>{prefix.label}</span>
            <span className="text-gray-400 text-xs ml-2">{prefix.labelEn}</span>
          </span>
        </Select.Option>
      ))}
    </Select>
  );
};

export default PrefixAnt;
