import React, { createContext, useState } from 'react';
import { Spin } from 'antd';
import { useTranslation } from 'react-i18next';

export const LoadingContext = createContext(undefined);

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  const withLoading = async (promise) => {
    try {
      showLoading();
      return await promise;
    } finally {
      hideLoading();
    }
  };

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        setLoading: setIsLoading,
        showLoading,
        hideLoading,
        withLoading
      }}
    >
      {isLoading && (
        <div className='fixed inset-0 flex items-center justify-center bg-black/50 dark:bg-black/70 z-50'>
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center'>
            <Spin size='large' />
            <span className='mt-4 text-gray-700 dark:text-gray-300'>{t('common:loading')}</span>
          </div>
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
}; 