import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * NoData - A component for displaying "no data" message
 *
 * Features:
 * - i18next translation support for customizable text
 * - Centered layout with consistent styling
 * - Dark mode compatible text colors
 * - Responsive design with proper spacing
 *
 * @param {Object} props - Component props
 * @param {string} [props.text] - Custom no data text (overrides translation)
 * @returns {JSX.Element} The no data display component
 */
const NoData = ({ text }) => {
  const { t } = useTranslation();

  return (
    <div className="text-center my-8 py-4">
      <small className="text-gray-500 dark:text-gray-400 text-sm">
        {text || t('common.noData')}
      </small>
    </div>
  );
};

export default NoData;
