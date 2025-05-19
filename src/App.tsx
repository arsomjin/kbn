import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { ConfigProvider, App as AntdApp, Spin } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from './hooks/useAuth';
import { ModalProvider } from './contexts/ModalContext';

// Redux store
import { store } from './store';
import { RootState } from './store';

// Theme configuration
import { getAntDesignConfig } from './theme/themeConfig';

// Permission Provider
import { PermissionProvider } from './contexts/PermissionContext';

// Notification Provider
import NotificationProvider from './components/notifications';
import { BranchProvider } from './contexts/BranchContext';
import { ProvinceProvider } from './contexts/ProvinceContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { EmployeeProvider } from './contexts/EmployeeContext';
import { DepartmentProvider } from './contexts/DepartmentContext';

// Enter Key Navigation Provider
import EnterKeyNavigationProvider from './components/EnterKeyNavigationProvider';

// Initialize i18n
import './translations/i18n';

// Styles
import './App.css';
import './styles/inputNumber.css';

// Import navigation
import AppRouter from './navigation/AppRouter';

// Initialize Firebase messaging
import { initializeMessaging } from './services/firebase';

import ErrorBoundary from './components/common/ErrorBoundary';
import AnimatedGradientBackground from './components/common/AnimatedGradientBackground';
import PageDoc from './components/PageDoc';

// Theme-aware App Content component
const ThemeAppContent: React.FC = () => {
  // Get current theme from Redux store
  const { theme } = useSelector((state: RootState) => state.theme);
  const isDarkMode = theme === 'dark';

  // Get appropriate Ant Design theme based on current theme state
  const antdTheme = getAntDesignConfig(isDarkMode ? 'dark' : 'light');

  // Initialize messaging when the app loads
  useEffect(() => {
    const initMessaging = async () => {
      try {
        await initializeMessaging();
        // No need to send config to service worker here; handled in firebase.ts
      } catch (error) {
        console.error('Error initializing Firebase messaging:', error);
      }
    };

    initMessaging();
  }, []);

  const { isLoading, hydrated, userProfile } = useAuth();

  if (isLoading || !hydrated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size='large' />
      </div>
    );
  }

  return (
    <ConfigProvider theme={antdTheme}>
      <AntdApp notification={{ placement: 'topRight' }}>
        <ModalProvider>
          <NotificationProvider>
            <PermissionProvider userProfile={userProfile}>
              <ProvinceProvider>
                <BranchProvider>
                  <EmployeeProvider>
                    <DepartmentProvider>
                      <EnterKeyNavigationProvider>
                        <BrowserRouter>
                          <AppRouter />
                          {/* <PageDoc /> */}
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
    <Provider store={store}>
      <ErrorBoundary>
        <LoadingProvider>
          <ThemeAppContent />
        </LoadingProvider>
      </ErrorBoundary>
    </Provider>
  );
};

export default App;
