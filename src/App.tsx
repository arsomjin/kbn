import React, { useState, useEffect, createContext, useContext } from 'react';
import { Provider } from 'react-redux';
import { ConfigProvider, App as AntdApp } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { ModalProvider } from 'contexts/ModalContext';
import { AuthProvider, useAuth } from 'contexts/AuthContext';
import { I18nextProvider } from 'react-i18next';
import i18n from 'translations/i18n';
import { useSelector } from 'react-redux';
import { RootState } from './store';

// Redux store
import { store } from 'store';

// Theme configuration
import { getAntDesignConfig } from 'theme/themeConfig';
import { applyTheme } from 'theme/themeConfig';

// Providers
import { PermissionProvider } from 'contexts/PermissionContext';
import NotificationProvider from 'components/notifications';
import { BranchProvider } from 'contexts/BranchContext';
import { ProvinceProvider } from 'contexts/ProvinceContext';
import { LoadingProvider } from 'contexts/LoadingContext';
import { EmployeeProvider } from 'contexts/EmployeeContext';
import { DepartmentProvider } from 'contexts/DepartmentContext';
import EnterKeyNavigationProvider from 'components/EnterKeyNavigationProvider';
import { WindowSizeProvider } from 'contexts/WindowSizeContext';

// Components
import AppRouter from 'navigation/AppRouter';
import ErrorBoundary from 'components/common/ErrorBoundary';
import { LoadingSpinner } from 'components/common/LoadingSpinner';

// Styles
import './App.css';
import { useNotifications } from 'hooks/useNotifications';
// import './styles/inputNumber.css';

// Theme-aware App Content component
const ThemeAppContent: React.FC = () => {
  // Get current theme from Redux store
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDarkMode = theme === 'dark';

  // Get appropriate Ant Design theme based on current theme state
  const antdTheme = getAntDesignConfig(isDarkMode ? 'dark' : 'light');

  useNotifications();

  return (
    <ConfigProvider theme={antdTheme}>
      <AntdApp notification={{ placement: 'topRight' }}>
        <ModalProvider>
          <NotificationProvider>
            <PermissionProvider>
              <ProvinceProvider>
                <BranchProvider>
                  <EmployeeProvider>
                    <DepartmentProvider>
                      <EnterKeyNavigationProvider>
                        <BrowserRouter>
                          <AppRouter />
                        </BrowserRouter>
                      </EnterKeyNavigationProvider>
                    </DepartmentProvider>
                  </EmployeeProvider>
                </BranchProvider>
              </ProvinceProvider>
            </PermissionProvider>
          </NotificationProvider>
        </ModalProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  return (
    <WindowSizeProvider>
      <Provider store={store}>
        <ErrorBoundary>
          <LoadingProvider>
            <I18nextProvider i18n={i18n}>
              <AuthProvider>
                <ThemeAppContent />
              </AuthProvider>
            </I18nextProvider>
          </LoadingProvider>
        </ErrorBoundary>
      </Provider>
    </WindowSizeProvider>
  );
};

export default App;
