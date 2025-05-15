import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translation files
import enApp from './en/app.json';
import thApp from './th/app.json';
import enAuth from './en/auth.json';
import thAuth from './th/auth.json';
import enNotifications from './en/notifications.json';
import thNotifications from './th/notifications.json';
import enProfile from './en/profile.json';
import thProfile from './th/profile.json';
import enUserReview from './en/userReview.json';
import thUserReview from './th/userReview.json';
import enRoles from './en/roles.json';
import thRoles from './th/roles.json';
import enTheme from './en/theme.json';
import thTheme from './th/theme.json';
import enLanguage from './en/language.json';
import thLanguage from './th/language.json';
import enCommon from './en/common.json';
import thCommon from './th/common.json';
import enValidation from './en/validation.json';
import thValidation from './th/validation.json';
import enFirebase from './en/firebase.json';
import thFirebase from './th/firebase.json';
import enProvinces from './en/provinces.json';
import thProvinces from './th/provinces.json';
import enDashboard from './en/dashboard.json';
import thDashboard from './th/dashboard.json';
import enBranches from './en/branches.json';
import thBranches from './th/branches.json';
import enOverview from './en/overview.json';
import thOverview from './th/overview.json';
import enDeveloper from './en/developer.json';
import thDeveloper from './th/developer.json';
import enContent from './en/content.json';
import thContent from './th/content.json';
import enUserManagement from './en/userManagement.json';
import thUserManagement from './th/userManagement.json';
import enSystemSettings from './en/systemSettings.json';
import thSystemSettings from './th/systemSettings.json';
import enSendNotification from './en/sendNotification.json';
import thSendNotification from './th/sendNotification.json';
import enPermissions from './en/permissions.json';
import thPermissions from './th/permissions.json';
import enUserRoleManager from './en/userRoleManager.json';
import thUserRoleManager from './th/userRoleManager.json';
import enEmployees from './en/employees.json';
import thEmployees from './th/employees.json';
import enAccount from './en/account.json';
import thAccount from './th/account.json';

// Resources object containing translations
const resources = {
  en: {
    app: enApp,
    auth: enAuth,
    notifications: enNotifications,
    profile: enProfile,
    userReview: enUserReview,
    roles: enRoles,
    theme: enTheme,
    language: enLanguage,
    common: enCommon,
    validation: enValidation,
    firebase: enFirebase,
    provinces: enProvinces,
    dashboard: enDashboard,
    overview: enOverview,
    developer: enDeveloper,
    content: enContent,
    userManagement: enUserManagement,
    systemSettings: enSystemSettings,
    sendNotification: enSendNotification,
    permissions: enPermissions,
    userRoleManager: enUserRoleManager,
    branches: enBranches,
    employees: enEmployees,
    account: enAccount
  },
  th: {
    app: thApp,
    auth: thAuth,
    notifications: thNotifications,
    profile: thProfile,
    userReview: thUserReview,
    roles: thRoles,
    theme: thTheme,
    language: thLanguage,
    common: thCommon,
    validation: thValidation,
    firebase: thFirebase,
    provinces: thProvinces,
    dashboard: thDashboard,
    overview: thOverview,
    developer: thDeveloper,
    branches: thBranches,
    content: thContent,
    userManagement: thUserManagement,
    systemSettings: thSystemSettings,
    sendNotification: thSendNotification,
    permissions: thPermissions,
    userRoleManager: thUserRoleManager,
    employees: thEmployees,
    account: thAccount
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'th',
    defaultNS: 'common',
    ns: [
      'app', 'auth', 'notifications', 'profile', 'userReview', 'roles', 'theme', 'language', 'common', 'validation', 'firebase', 'provinces',
      'dashboard', 'overview', 'developer', 'content', 'userManagement', 'systemSettings', 'sendNotification', 'permissions', 'userRoleManager',
      'branches', 'employees', 'account'
    ],
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
