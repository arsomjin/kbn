import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from 'antd';
import { useTranslation } from 'react-i18next';
import PageDoc from '../../components/PageDoc';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  // Get the current settings section from the URL
  const currentSection = location.pathname.split('/').pop();

  return (
    <div>
      <PageDoc />
      <h1>{t('settings:title')}</h1>
      <Card>
        {/* Settings content will be rendered here based on the current section */}
        <p>{t(`settings:${currentSection}.title`)}</p>
      </Card>
    </div>
  );
};

export default Settings;
