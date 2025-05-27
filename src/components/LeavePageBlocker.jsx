import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Prompt } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * LeavePageBlocker Component
 *
 * A component that blocks page navigation when there are unsaved changes.
 * Provides both browser beforeunload and React Router navigation blocking.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.when - Whether to block navigation
 * @param {string} props.message - Custom message to show (optional)
 * @returns {React.ReactElement} Leave page blocker component
 */
const LeavePageBlocker = ({ when, message }) => {
  const { t } = useTranslation();
  const defaultMessage = message || t('components.leavePageBlocker.defaultMessage');

  useEffect(() => {
    if (!when) return () => {};

    const beforeUnloadCallback = (event) => {
      event.preventDefault();
      event.returnValue = defaultMessage;
      return defaultMessage;
    };

    window.addEventListener('beforeunload', beforeUnloadCallback);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadCallback);
    };
  }, [when, defaultMessage]);

  return <Prompt when={when} message={defaultMessage} />;
};

LeavePageBlocker.propTypes = {
  when: PropTypes.bool.isRequired,
  message: PropTypes.string,
};

export default LeavePageBlocker;
