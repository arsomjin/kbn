import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Import namespace-based translations
import executiveTH from './namespaces/executive.th.json';
import executiveEN from './namespaces/executive.en.json';

// Import legacy translations for backward compatibility
import legacyTH from './locales/th.json';
import legacyEN from './locales/en.json';

// Enterprise Translation Configuration
const enterpriseI18nConfig = {
  // Language resources organized by namespace
  resources: {
    th: {
      // Namespace-based translations - FIXED: Use direct import
      executive: executiveTH,

      // Legacy translations (for backward compatibility)
      translations: legacyTH,

      // Common translations
      common: {
        language: {
          switch: 'เปลี่ยนภาษา',
          thai: 'ไทย',
          english: 'อังกฤษ',
        },
        actions: {
          save: 'บันทึก',
          cancel: 'ยกเลิก',
          edit: 'แก้ไข',
          delete: 'ลบ',
          view: 'ดู',
          search: 'ค้นหา',
          filter: 'กรอง',
          export: 'ส่งออก',
          import: 'นำเข้า',
        },
        status: {
          active: 'ใช้งาน',
          inactive: 'ไม่ใช้งาน',
          pending: 'รอดำเนินการ',
          approved: 'อนุมัติ',
          rejected: 'ปฏิเสธ',
          draft: 'ร่าง',
          completed: 'เสร็จสิ้น',
        },
      },
    },
    en: {
      // Namespace-based translations - FIXED: Use direct import
      executive: executiveEN,

      // Legacy translations (for backward compatibility)
      translations: legacyEN,

      // Common translations
      common: {
        language: {
          switch: 'Switch Language',
          thai: 'Thai',
          english: 'English',
        },
        actions: {
          save: 'Save',
          cancel: 'Cancel',
          edit: 'Edit',
          delete: 'Delete',
          view: 'View',
          search: 'Search',
          filter: 'Filter',
          export: 'Export',
          import: 'Import',
        },
        status: {
          active: 'Active',
          inactive: 'Inactive',
          pending: 'Pending',
          approved: 'Approved',
          rejected: 'Rejected',
          draft: 'Draft',
          completed: 'Completed',
        },
      },
    },
  },

  // Default language (Thai as requested)
  lng: 'th',
  fallbackLng: 'th',

  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',

  // Namespace configuration
  ns: ['executive', 'common', 'translations'],
  defaultNS: 'translations', // For backward compatibility

  // Key separator for nested translations
  keySeparator: '.',
  nsSeparator: ':',

  // Interpolation settings
  interpolation: {
    escapeValue: false,
    formatSeparator: ',',
  },

  // React-specific settings
  react: {
    wait: true,
    bindI18n: 'languageChanged loaded',
    bindStore: 'added removed',
    nsMode: 'default',
    useSuspense: false,
  },

  // Language detection settings
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    lookupLocalStorage: 'kbn-language',
    caches: ['localStorage'],
    excludeCacheFor: ['cimode'],
  },
};

// Initialize i18n with enterprise configuration
i18n.use(LanguageDetector).use(initReactI18next).init(enterpriseI18nConfig);

// Enterprise translation utilities
export const useNamespacedTranslation = (namespace = 'translations') => {
  const { t, i18n: i18nInstance } =
    require('react-i18next').useTranslation(namespace);

  return {
    t,
    i18n: i18nInstance,
    // Utility to get translation from specific namespace
    nt: (key, ns = namespace) => i18nInstance.t(key, { ns }),
    // Utility to check if translation exists
    exists: (key, ns = namespace) => i18nInstance.exists(key, { ns }),
    // Utility to get all translations for a namespace
    getNamespaceTranslations: (ns = namespace) =>
      i18nInstance.getResourceBundle(i18nInstance.language, ns),
  };
};

// Utility to add new namespace translations dynamically
export const addNamespaceTranslations = (namespace, language, translations) => {
  i18n.addResourceBundle(language, namespace, translations, true, true);
};

// Utility to get translation with fallback
export const getTranslationWithFallback = (
  key,
  namespace = 'translations',
  fallback = key
) => {
  const translation = i18n.t(key, { ns: namespace });
  return translation === key ? fallback : translation;
};

// Enterprise translation function with namespace support
export const et = (key, namespace = 'translations', options = {}) => {
  return i18n.t(key, { ns: namespace, ...options });
};

// Legacy translation function for backward compatibility
export const tran = (key) => i18n.t(key);

console.log('🌍 Enterprise i18n system initialized with namespace support');
console.log(
  '📋 Available namespaces:',
  Object.keys(enterpriseI18nConfig.resources.th)
);
console.log('🎯 Executive translations loaded:', Object.keys(executiveTH));

export default i18n;
