import React from 'react';
import { Result } from 'antd';
import { useTranslation } from 'react-i18next';

/**
 * Displays an access denied message for unauthorized users.
 */
const AccessDenied = () => {
  const { t } = useTranslation();
  return (
    <Result
      status="403"
      title={t('common:accessDeniedTitle', 'Access Denied')}
      subTitle={t('common:accessDeniedMessage', 'You do not have permission to view this page.')}
    />
  );
};

export default AccessDenied; 