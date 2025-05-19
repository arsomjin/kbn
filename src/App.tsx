import React, { useState, useEffect, createContext, useContext } from 'react';
import { Provider } from 'react-redux';
import { ConfigProvider, App as AntdApp } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { ModalProvider } from 'contexts/ModalContext';
import { AuthProvider } from 'contexts/AuthContext';
import { I18nextProvider } from 'react-i18next';
import i18n from 'translations/i18n';

// Redux store
import { store } from 'store';

// Theme configuration
import { getAntDesignConfig } from 'theme/themeConfig';

// Providers
import { PermissionProvider } from 'contexts/PermissionContext';
import NotificationProvider from 'components/notifications';
import { BranchProvider } from 'contexts/BranchContext';
import { ProvinceProvider } from 'contexts/ProvinceContext';
import { LoadingProvider } from 'contexts/LoadingContext';
import { EmployeeProvider } from 'contexts/EmployeeContext';
import { DepartmentProvider } from 'contexts/DepartmentContext';
import EnterKeyNavigationProvider from 'components/EnterKeyNavigationProvider';

// Components
import AppRouter from 'navigation/AppRouter';
import ErrorBoundary from 'components/common/ErrorBoundary';
import { LoadingSpinner } from 'components/common/LoadingSpinner';

// Styles
import './App.css';
import './styles/inputNumber.css';

// Theme types
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// No-op function for context default value
const noop = () => {
  // This is intentionally empty - it's just a placeholder for the context default value
  // The actual implementation is provided by ThemeProvider
};

// Create a Theme context
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: noop
});

// Custom hook to use theme context
export const useTheme = () => useContext(ThemeContext);

// Get initial theme from local storage or system preference
const getInitialTheme = (): Theme => {
  const savedTheme = localStorage.getItem('theme') as Theme | null;

  if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
    return savedTheme;
  }

  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
};

// Theme provider component
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme());

  useEffect(() => {
    // Update document element class for CSS
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save to local storage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

// Theme-aware App Content component
const ThemeAppContent: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const antdTheme = getAntDesignConfig(isDarkMode ? 'dark' : 'light');

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
    <Provider store={store}>
      <ErrorBoundary>
        <LoadingProvider>
          <I18nextProvider i18n={i18n}>
            <ThemeProvider>
              <AuthProvider>
                <ThemeAppContent />
              </AuthProvider>
            </ThemeProvider>
          </I18nextProvider>
        </LoadingProvider>
      </ErrorBoundary>
    </Provider>
  );
};

export default App;
