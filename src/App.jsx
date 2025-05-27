import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';

import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './navigation/AppRouter';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import EnterKeyNavigationProvider from 'components/EnterKeyNavigationProvider';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useSelector } from 'react-redux';
import { useNotifications } from 'hooks/useNotifications';
import { ModalProvider } from 'contexts/ModalContext';

import { getAntDesignConfig } from './theme/themeConfig';
// Redux store
import { store } from './store';
import { Provider } from 'react-redux';

import { I18nextProvider } from 'react-i18next';
import i18n from 'translations/i18n';

import NotificationProvider from 'components/notifications';
import { LoadingProvider } from './contexts/LoadingContext';

// import './App.css';
import FirestoreSyncManager from 'components/FirestoreSyncManager';

const ThemeAppContent = () => {
  // Get current theme from Redux store
  const theme = useSelector((state) => state.theme.theme);
  const isDarkMode = theme === 'dark';

  // Get appropriate Ant Design theme based on current theme state
  const antdTheme = getAntDesignConfig(isDarkMode ? 'dark' : 'light');

  useNotifications();

  return (
    <ConfigProvider theme={antdTheme}>
      <AntdApp notification={{ placement: 'topRight' }}>
        <ModalProvider>
          <NotificationProvider>
            <EnterKeyNavigationProvider>
              <BrowserRouter>
                <Suspense fallback={<LoadingSpinner />}>
                  <AppRouter />
                </Suspense>
              </BrowserRouter>
            </EnterKeyNavigationProvider>
          </NotificationProvider>
        </ModalProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <LoadingProvider>
          <I18nextProvider i18n={i18n}>
            <AuthProvider>
              <FirestoreSyncManager />
              <ThemeAppContent />
            </AuthProvider>
          </I18nextProvider>
        </LoadingProvider>
      </ErrorBoundary>
    </Provider>
  );
};

export default App;
