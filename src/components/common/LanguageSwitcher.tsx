import React from 'react';
import { Dropdown, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { GlobalOutlined } from '@ant-design/icons';

const LanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  const items = [
    {
      key: 'en',
      label: t('english', { ns: 'language' }),
      onClick: () => changeLanguage('en')
    },
    {
      key: 'th',
      label: t('thai', { ns: 'language' }),
      onClick: () => changeLanguage('th')
    }
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      <Button type='text' icon={<GlobalOutlined />} className='flex items-center'>
        <span className='ml-1'>{i18n.language === 'th' ? 'TH' : 'EN'}</span>
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
