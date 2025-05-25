import React from 'react';
import { useTranslation } from 'react-i18next';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTheme } from 'hooks/useTheme';
import { DarkModeSwitch } from 'react-toggle-dark-mode';

const ThemeSwitch: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <DarkModeSwitch
      checked={theme === 'dark'}
      onChange={toggleTheme}
      size={24}
      sunColor='#FFC300' // bright yellow
      moonColor='#4CAF50' // green earth tone for dark mode
      aria-label={t('common.toggleTheme')}
      title={t('common.toggleTheme')}
    />
  );
};

export default ThemeSwitch;
