import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import XHR from 'i18next-xhr-backend';
import languageEN from './locales/en.json';
import languageTH from './locales/th.json';

i18n
  .use(XHR)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translations: languageEN
      },
      th: {
        translations: languageTH
      }
    },
    /* default language when load the website in browser */
    lng: 'th',
    /* When react i18next not finding any language to as default in borwser */
    fallbackLng: 'th',
    /* debugger For Development environment */
    debug: true,
    ns: ['translations'],
    defaultNS: 'translations',
    keySeparator: false,
    interpolation: {
      escapeValue: false,
      formatSeparator: ','
    },
    react: {
      wait: true,
      bindI18n: 'languageChanged loaded',
      bindStore: 'added removed',
      nsMode: 'default'
    }
  });

console.log('language_detect', LanguageDetector);

export const tran = key => i18n.t(key);

export default i18n;
