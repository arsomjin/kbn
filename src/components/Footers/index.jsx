import React from 'react';
import { Typography, Space } from 'antd';
import { FacebookOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import OpenApp from 'react-open-app';

const { Text, Link } = Typography;

/**
 * Copyright Component
 *
 * Displays copyright information with company link
 * Features modern Ant Design typography and i18next translations
 *
 * @returns {JSX.Element} The copyright component
 */
export const Copyright = () => {
  const { t } = useTranslation();

  return (
    <Text type="secondary" className="text-center block text-blue-300 dark:text-blue-400">
      {t('footer.copyright')}{' '}
      <Link
        href="https://www.facebook.com/kbnkorat"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-300 hover:text-blue-200 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {t('footer.companyName')}
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Text>
  );
};

/**
 * Socials Component
 *
 * Displays social media links with responsive sizing
 * Features modern responsive design and dark mode support
 *
 * @param {Object} props - Component props
 * @param {boolean} props.medium - Medium icon size
 * @param {boolean} props.large - Large icon size
 * @returns {JSX.Element} The socials component
 */
export const Socials = ({ medium, large }) => {
  const { t } = useTranslation();

  const iconSize = large ? '64px' : medium ? '48px' : '24px';

  return (
    <div className="text-center mb-2">
      <Text type="secondary" className="text-blue-300 dark:text-blue-400 block mb-2">
        {t('footer.followUs')}
      </Text>
      <Space size="middle">
        <OpenApp
          href="https://www.facebook.com/kbnkorat/"
          android="fb://page/390277407694392"
          ios="fb://page/?id=390277407694392"
        >
          <FacebookOutlined
            className="text-blue-400 hover:text-blue-300 dark:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer"
            style={{ fontSize: iconSize }}
          />
        </OpenApp>
      </Space>
    </div>
  );
};

/**
 * FooterContent Component
 *
 * Main footer content wrapper with copyright and social links
 * Features modern spacing and layout with dark mode support
 *
 * @returns {JSX.Element} The footer content component
 */
export const FooterContent = () => {
  return (
    <div className="mt-6 pt-6">
      <Copyright />
    </div>
  );
};
