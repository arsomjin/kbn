import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useTranslation } from 'react-i18next';

interface LoadingBoundaryProps {
  loading: boolean;
  children: React.ReactNode;
  delay?: number;
}

const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({
  loading,
  children,
  delay = 200 // Default delay of 200ms to prevent flashing
}) => {
  const { t } = useTranslation();
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (loading) {
      timeoutId = setTimeout(() => {
        setShowLoading(true);
      }, delay);
    } else {
      setShowLoading(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loading, delay]);

  if (!loading) {
    return <>{children}</>;
  }

  if (loading && !showLoading) {
    return null; // Return nothing during the delay to prevent flashing
  }

  return (
    <div className='flex justify-center items-center h-[calc(100vh-180px)]'>
      <Spin tip={t('common:loading')} size='large' />
    </div>
  );
};

export default LoadingBoundary;
