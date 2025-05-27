import React from 'react';
import { useAccountMenuConfig } from './menuConfig';
import { useTranslation } from 'react-i18next';

/**
 * Test component to verify menu translations are working
 * This can be temporarily added to any page to test the translations
 */
const MenuTest = () => {
  const { t, i18n } = useTranslation('menu');
  const menuConfig = useAccountMenuConfig();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px', borderRadius: '8px' }}>
      <h3>Menu Translation Test</h3>
      <p>Current Language: {i18n.language}</p>
      <button onClick={toggleLanguage} style={{ marginBottom: '10px' }}>
        Toggle Language ({i18n.language === 'en' ? 'Switch to Thai' : 'Switch to English'})
      </button>

      <div>
        <h4>Direct Translation Test:</h4>
        <ul>
          <li>account.branch.title: {t('account.branch.title')}</li>
          <li>account.overview: {t('account.overview')}</li>
          <li>account.income: {t('account.income')}</li>
          <li>account.expense: {t('account.expense')}</li>
          <li>account.inputPrice: {t('account.inputPrice')}</li>
        </ul>
      </div>

      <div>
        <h4>Menu Config Test:</h4>
        <ul>
          <li>Branch Title: {menuConfig.branch.label}</li>
          <li>Branch Children:</li>
          <ul>
            {menuConfig.branch.children.map((item) => (
              <li key={item.key}>{item.label}</li>
            ))}
          </ul>
        </ul>
      </div>
    </div>
  );
};

export default MenuTest;
