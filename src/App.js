import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { I18nextProvider } from 'react-i18next';
import { ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import NatureThemeProvider from './components/theme/NatureThemeProvider';
import Navigation from './navigation';
import Load from './elements/Load';
import EventEmitter from './api/EventEmitter';
import ErrorBoundary from 'api/ErrorBoundary';
import configureStore from './redux/store/configureStore';
import EnterKeyNavigationProvider from 'components/EnterKeyNavigationProvider';
import './role-testing-utilities';
// URGENT RBAC MIGRATION - Make available globally
import './utils/urgent-rbac-migration';
// URGENT: Firebase Rules Fix
import './fix-firebase-rules-issue';
// 🔍 Authentication Flow Debugger
import './utils/authFlowDebugger';
// 🧪 Auth Fix Test Utility
import './utils/testAuthFix';
// 🔧 Migration Utility for Clean Slate RBAC
import './utils/migrate-current-user';
// 🚨 Permission Error Fix Script
import './fix-permission-error';
// 🎨 Standard Button Styling
import './styles/standardButtons.css';
// 🧪 Approval Fixes Testing Utilities (Development Only)
import './utils/test-approval-fixes';
// 🔧 Auth Recovery Utility (Critical Bug Fix)
import './utils/auth-recovery';
// 🌍 Enterprise i18n System
import i18n from './translations/i18n-enterprise';
// 🚀 Super Admin Creation Script (Testing)
import './create-super-admin';
import './App.css';

// 🔧 Configure dayjs as default for Ant Design
dayjs.locale('th');

// 🔧 CRITICAL FIX: Custom Thai locale for dayjs compatibility
const thaiLocale = {
  lang: {
    locale: 'th_TH',
    placeholder: 'เลือกวันที่',
    rangePlaceholder: ['วันที่เริ่มต้น', 'วันที่สิ้นสุด'],
    today: 'วันนี้',
    now: 'ตอนนี้',
    backToToday: 'กลับไปวันนี้',
    ok: 'ตกลง',
    clear: 'ล้าง',
    month: 'เดือน',
    year: 'ปี',
    timeSelect: 'เลือกเวลา',
    dateSelect: 'เลือกวันที่',
    monthSelect: 'เลือกเดือน',
    yearSelect: 'เลือกปี',
    decadeSelect: 'เลือกทศวรรษ',
    yearFormat: 'YYYY',
    dateFormat: 'D/M/YYYY',
    dayFormat: 'D',
    dateTimeFormat: 'D/M/YYYY HH:mm:ss',
    monthBeforeYear: true,
    previousMonth: 'เดือนก่อนหน้า (PageUp)',
    nextMonth: 'เดือนถัดไป (PageDown)',
    previousYear: 'ปีก่อนหน้า (Control + left)',
    nextYear: 'ปีถัดไป (Control + right)',
    previousDecade: 'ทศวรรษก่อนหน้า',
    nextDecade: 'ทศวรรษถัดไป',
    previousCentury: 'ศตวรรษก่อนหน้า',
    nextCentury: 'ศตวรรษถัดไป',
  },
  timePickerLocale: {
    placeholder: 'เลือกเวลา',
  },
};

export const store = configureStore();

// Expose store globally for testing utilities
window.store = store;

const persistor = persistStore(store, null, () => {
  const states = store.getState();
  // console.log('Persistor_persisted', states);
});

const App = () => {
  const onBeforeLift = () => {
    // Silent initialization in production
    const isDev = process?.env?.NODE_ENV === 'development';

    if (isDev) {
      console.log('🔥 KBN Application Ready');
    }

    // 🔍 DEBUGGING: Start authentication flow monitoring in development (silent)
    if (isDev) {
      import('./utils/authFlowDebugger')
        .then(({ debugAuthFlow }) => {
          // Start monitoring but don't store the cleanup function unless needed
          const cleanup = debugAuthFlow();

          // Optional: Stop monitoring after 30 seconds to reduce noise
          setTimeout(() => {
            cleanup();
          }, 30000);
        })
        .catch((error) => {
          // Silent error handling
        });
    }

    // Load utilities silently in development
    if (isDev) {
      import('./utils/selfApproval').catch(() => {});
      import('./utils/debugAuth').catch(() => {});
      import('./dev/approval-debug').catch(() => {});
      import('./fix-auth-instability').catch(() => {});
      import('./role-testing-utilities').catch(() => {});
      import('./dev/quick-rbac-setup').catch(() => {});
    }

    // 🔧 CRITICAL: Auto-detect and recover from auth limbo states
    import('./utils/auth-recovery')
      .then(({ autoRecoverAuthLimbo }) => {
        autoRecoverAuthLimbo();
      })
      .catch(() => {
        // Silent error handling
      });
  };

  return (
    <Provider store={store}>
      <PersistGate
        loading={<Load loading />}
        persistor={persistor}
        onBeforeLift={onBeforeLift}
      >
        <ConfigProvider
          locale={thaiLocale}
          theme={{
            token: {
              colorPrimary: '#52c41a',
              borderRadius: 6,
            },
          }}
        >
          <I18nextProvider i18n={i18n}>
            <ErrorBoundary>
              <NatureThemeProvider>
                <EnterKeyNavigationProvider>
                  <Navigation />
                  <EventEmitter />
                </EnterKeyNavigationProvider>
              </NatureThemeProvider>
            </ErrorBoundary>
          </I18nextProvider>
        </ConfigProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
