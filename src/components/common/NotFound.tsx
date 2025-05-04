import React from 'react';
import { Result, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Result
      status='404'
      title='404'
      subTitle={t('errors.notFound')}
      extra={
        <Button type='primary' onClick={() => navigate('/')}>
          {t('common.back')}
        </Button>
      }
      className='mt-10'
    />
  );
};

export default NotFound;
