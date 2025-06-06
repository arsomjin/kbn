import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Prompt } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';

const LeavePageBlocker = ({ when, message }) => {
  //   const { t } = useTranslation();
  //   const message = t('page_has_unsaved_changes');

  useEffect(() => {
    if (!when) return () => {};

    const beforeUnloadCallback = event => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', beforeUnloadCallback);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadCallback);
    };
  }, [when, message]);

  return <Prompt when={when} message={message} />;
};

LeavePageBlocker.propTypes = {
  when: PropTypes.bool.isRequired
};

export default LeavePageBlocker;
