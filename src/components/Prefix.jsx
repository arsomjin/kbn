import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from 'antd';

const { Option } = Select;

/**
 * Prefix Component
 *
 * A selector component for Thai name prefixes.
 * Provides common Thai prefixes including personal and business titles.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.label - Label for the prefix selector
 * @param {string} props.error - Error message to display
 * @returns {React.ReactElement} Prefix selector component
 */
const Prefix = ({ label, error, ...props }) => {
  const { t } = useTranslation();

  const prefixOptions = [
    t('components.prefix.mr'),
    t('components.prefix.mrs'),
    t('components.prefix.miss'),
    t('components.prefix.shop'),
    t('components.prefix.partnership'),
    t('components.prefix.limitedCompany'),
    t('components.prefix.publicCompany'),
  ];

  return (
    <>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label || t('components.prefix.label')}
      </label>
      <Select
        placeholder={t('components.prefix.placeholder')}
        showSearch
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        {...props}
      >
        {prefixOptions.map((prefix, index) => (
          <Option key={index} value={prefix}>
            {prefix}
          </Option>
        ))}
      </Select>
      {error && <span className="text-red-500 dark:text-red-400 text-sm mt-1">{error}</span>}
    </>
  );
};

export default Prefix;
