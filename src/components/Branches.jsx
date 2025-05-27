import React from 'react';
import { Select, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

/**
 * Branches Component
 *
 * A select dropdown component for choosing branches from the Redux store.
 * Features modern Ant Design styling, i18next translations, and error handling.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.value - Selected branch value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.disabled - Whether select is disabled
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message to display
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement} Branches select component
 */
const Branches = ({ value, onChange, disabled, placeholder, error, className, ...props }) => {
  const { t } = useTranslation('components');
  const { branches } = useSelector((state) => state.data);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t('branches.label')}
      </label>
      <Select
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder || t('branches.placeholder')}
        className="w-full"
        {...props}
      >
        {Object.keys(branches).map((key) => (
          <Select.Option key={key} value={key}>
            {branches[key].branchName}
          </Select.Option>
        ))}
      </Select>
      {error && (
        <Text type="danger" className="block mt-1 text-sm">
          {error}
        </Text>
      )}
    </div>
  );
};

export default Branches;
