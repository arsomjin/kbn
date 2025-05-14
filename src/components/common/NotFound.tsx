import React, { useState, useEffect } from 'react';
import { Result, Button, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Result
      status='404'
      title='404'
      subTitle={t('errors.notFound')}
      extra={
        <Button type='primary' onClick={() => navigate('/')}>
          {t('back')}
        </Button>
      }
      className='mt-10'
    />
  );
};

export default NotFound;
