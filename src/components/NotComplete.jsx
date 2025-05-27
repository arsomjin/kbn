import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * NotComplete Component
 *
 * A simple component to display validation or completion messages.
 * Used to show user feedback about incomplete or invalid data.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.info - Custom message to display
 * @param {string} props.className - Custom CSS classes
 * @returns {React.ReactElement} Not complete message component
 */
const NotComplete = ({ info, className }) => {
  const { t } = useTranslation();

  return (
    <h6 className={className || 'm-0 text-red-500 dark:text-red-400'}>
      {info || t('components.notComplete.defaultMessage')}
    </h6>
  );
};

export default NotComplete;
